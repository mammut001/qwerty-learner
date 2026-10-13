#!/usr/bin/env node
// CLI runner for AI-assisted, prompt-injection resistant exam recall (机经) moderation.
//
// Exit codes:
//   0: Success (dry-run completed, review applied, or calibration passed)
//   1: Calibration failed (false approvals > 0 or agreement below threshold)
//   2: Configuration or arguments error (missing token, invalid options, missing provider)
//   3: API network or protocol error (cannot fetch recalls or failed to post review)
//   4: Safety gate triggered (calibration had false approvals during --apply)
//
// Usage:
//   node scripts/recall-moderator.mjs --calibrate
//   node scripts/recall-moderator.mjs --dry-run
//   node scripts/recall-moderator.mjs --apply
//   node scripts/recall-moderator.mjs --apply --max-items 50 --max-approve 20 --log /path/to/log.jsonl

import { appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createAiProvider } from '../server/echelle-ai-providers.mjs'
import { RECALL_HARNESS_VERSION, RECALL_REASON_CODES, moderateRecall } from '../server/recall-moderation-harness.mjs'
import { runRecallCalibration } from '../server/recall-moderation-calibration.mjs'

export function parseArgs(argv = []) {
  const options = {
    apply: false,
    dryRun: true,
    calibrate: false,
    skipCalibration: false,
    autoApprove: false,
    maxItems: 50,
    maxApprove: 20,
    logFile: null,
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--apply') {
      options.apply = true
      options.dryRun = false
    } else if (arg === '--dry-run') {
      options.dryRun = true
      options.apply = false
    } else if (arg === '--calibrate') {
      options.calibrate = true
    } else if (arg === '--skip-calibration') {
      options.skipCalibration = true
    } else if (arg === '--auto-approve') {
      options.autoApprove = true
    } else if (arg === '--max-items') {
      const val = parseInt(argv[++i], 10)
      if (!Number.isNaN(val) && val > 0) options.maxItems = val
    } else if (arg === '--max-approve') {
      const val = parseInt(argv[++i], 10)
      if (!Number.isNaN(val) && val >= 0) options.maxApprove = val
    } else if (arg === '--log') {
      options.logFile = argv[++i] || null
    }
  }

  return options
}

/**
 * Main execution function, accepting injected environment, fetch, and output streams for testing.
 */
export async function runRecallModerator({
  argv = process.argv.slice(2),
  env = process.env,
  fetchImpl = globalThis.fetch,
  stdout = (msg) => console.log(msg),
  stderr = (msg) => console.error(msg),
} = {}) {
  const opts = parseArgs(argv)
  const allowAutoApprove = opts.autoApprove || env.RECALL_AUTO_APPROVE === '1'
  const logLines = []

  const writeLog = (record) => {
    const line = JSON.stringify(record)
    logLines.push(line)
    if (opts.logFile) {
      try {
        appendFileSync(opts.logFile, line + '\n', 'utf8')
      } catch (err) {
        stderr(`[WARN] Failed to write to log file ${opts.logFile}: ${err.message}`)
      }
    } else {
      stdout(line)
    }
  }

  // 1. Initialize provider
  let provider
  try {
    provider = createAiProvider(env, fetchImpl)
  } catch (err) {
    stderr(`[CONFIG_ERROR] Failed to initialize AI provider: ${err.message}`)
    return { exitCode: 2, logLines }
  }

  if (!provider) {
    stderr('[CONFIG_ERROR] STUDY_AI_PROVIDER (openai | anthropic | mock) and STUDY_AI_MODEL are required.')
    return { exitCode: 2, logLines }
  }

  // 2. Handle --calibrate flag
  if (opts.calibrate) {
    stdout(`Running recall moderation calibration with ${provider.name}/${provider.model}...`)
    stdout(`Active mode: ${allowAutoApprove ? '--auto-approve ON' : '--auto-approve OFF (default)'}\n`)
    const report = await runRecallCalibration(provider, { allowAutoApprove })
    for (const row of report.rows) {
      const mark = row.agree ? '✓' : '✗'
      const outcome = row.decision + (row.recommendation ? ` (${row.recommendation})` : '')
      stdout(`${mark} ${row.id.padEnd(35)} expected ${row.expected}, got ${outcome || row.error} [${(row.reasons || []).join(', ')}]`)
    }
    stdout(`\nCalibration result (${report.activeMode}): agreement ${(report.agreement * 100).toFixed(0)}%, false approvals ${report.falseApprovals}, errors ${report.errors}`)
    stdout(`Note: ${report.note}`)
    if (report.bothModes) {
      const other = allowAutoApprove ? report.bothModes.autoApproveOff : report.bothModes.autoApproveOn
      stdout(`Alternate mode (${other.mode}): agreement ${(other.agreement * 100).toFixed(0)}%, false approvals ${other.falseApprovals}. ${other.note}`)
    }
    if (report.ok) {
      stdout('\nOK — provider passed calibration gate (0 false approvals).')
      return { exitCode: 0, report, logLines }
    }
    stderr('\nNOT OK — calibration failed (false approvals > 0 or agreement below minimum).')
    return { exitCode: 1, report, logLines }
  }

  // 3. Validate configuration for moderation runs
  const apiBase = env.RECALL_API_BASE
  if (!apiBase) {
    stderr('[CONFIG_ERROR] RECALL_API_BASE environment variable is required.')
    return { exitCode: 2, logLines }
  }

  const token = env.RECALL_MODERATOR_TOKEN
  if (!token) {
    stderr('[CONFIG_ERROR] RECALL_MODERATOR_TOKEN environment variable is required.')
    return { exitCode: 2, logLines }
  }

  const origin = env.RECALL_API_ORIGIN || 'https://french.paytonpei.top'

  // 4. Pre-run calibration gate for --apply
  if (opts.apply && !opts.skipCalibration) {
    stdout(`Running safety calibration gate before applying reviews (mode: ${allowAutoApprove ? 'auto-approve ON' : 'auto-approve OFF'})...`)
    const calReport = await runRecallCalibration(provider, { allowAutoApprove })
    if (!calReport.ok || calReport.falseApprovals > 0) {
      stderr(`[SAFETY_GATE_TRIGGERED] Provider failed calibration gate (${calReport.falseApprovals} false approvals, ${(calReport.agreement * 100).toFixed(0)}% agreement). Refusing to apply changes.`)
      return { exitCode: 4, report: calReport, logLines }
    }
    stdout('Safety calibration passed (0 false approvals). Proceeding with moderation.')
  }

  // 5. Fetch pending recalls
  const fetchUrl = `${apiBase.replace(/\/+$/, '')}/api/study-plan/admin/recalls?status=pending&limit=${opts.maxItems}`
  let pendingData
  try {
    const res = await fetchImpl(fetchUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (!res.ok) {
      stderr(`[API_ERROR] Failed to fetch pending recalls: HTTP ${res.status}`)
      return { exitCode: 3, logLines }
    }
    pendingData = await res.json()
  } catch (err) {
    stderr(`[NETWORK_ERROR] Network error while fetching pending recalls: ${err.message}`)
    return { exitCode: 3, logLines }
  }

  const items = Array.isArray(pendingData?.items)
    ? pendingData.items
    : (Array.isArray(pendingData?.recalls) ? pendingData.recalls : [])

  if (items.length === 0) {
    stdout('No pending recalls found to moderate.')
    return { exitCode: 0, decisions: [], logLines }
  }

  stdout(`Fetched ${items.length} pending recalls (max items: ${opts.maxItems}, max approve cap: ${opts.maxApprove}, auto-approve: ${allowAutoApprove ? 'ON' : 'OFF'}).`)

  // Valid IDs strictly from the fetched list
  const validFetchedIds = new Set(items.map((i) => i.id))
  let approvedCount = 0
  const decisions = []

  // 6. Moderate items independently
  for (const item of items) {
    let result
    try {
      result = await moderateRecall(item, provider, {
        approvedCount,
        maxApprove: opts.maxApprove,
        allowAutoApprove,
        now: Date.now(),
      })
    } catch (err) {
      // Independent isolation: one failure does not abort other items
      result = {
        id: item.id,
        decision: 'hold',
        recommendation: 'review',
        reasons: [RECALL_REASON_CODES.MODEL_ERROR],
        model: provider.model,
        harnessVersion: RECALL_HARNESS_VERSION,
      }
    }

    if (result.decision === 'approve') {
      approvedCount++
    }
    decisions.push(result)

    if (!allowAutoApprove) {
      stdout(`[triage] id=${item.id} decision=${result.decision} recommendation=${result.recommendation || 'review'} reasons=${(result.reasons || []).join(',')}`)
    }

    // Secrets hygiene: never log token or full prompt; excerpt capped at 80 chars
    const excerpt = String(item.topic || '').slice(0, 80).replace(/[\r\n\t]+/g, ' ')
    writeLog({
      id: item.id,
      decision: result.decision,
      recommendation: result.recommendation || 'review',
      reasons: result.reasons,
      model: provider.model,
      harnessVersion: RECALL_HARNESS_VERSION,
      excerpt,
      timestamp: Date.now(),
    })
  }

  const approveIds = decisions.filter((d) => d.decision === 'approve').map((d) => d.id).filter((id) => validFetchedIds.has(id))
  const rejectIds = decisions.filter((d) => d.decision === 'reject').map((d) => d.id).filter((id) => validFetchedIds.has(id))
  const holdIds = decisions.filter((d) => d.decision === 'hold').map((d) => d.id)

  if (!allowAutoApprove) {
    const recApproveCount = decisions.filter((d) => d.recommendation === 'approve').length
    const reviewCount = decisions.filter((d) => d.decision === 'hold' && d.recommendation !== 'approve').length
    const rejectCount = decisions.filter((d) => d.decision === 'reject').length
    stdout(`\nTriage summary (auto-approve OFF):`)
    stdout(`- Total: ${decisions.length}`)
    stdout(`- Recommended approve (held): ${recApproveCount}`)
    stdout(`- Review needed (held): ${reviewCount}`)
    stdout(`- Rejected: ${rejectCount}`)
    stdout(`(Auto-approve is OFF. ${recApproveCount} item(s) recommended for approval can be approved in the admin page.)`)
  } else {
    stdout(`\nModeration summary: ${approveIds.length} approve, ${rejectIds.length} reject, ${holdIds.length} hold.`)
  }

  // 7. Apply decisions if --apply is requested
  if (opts.apply) {
    const reviewUrl = `${apiBase.replace(/\/+$/, '')}/api/study-plan/admin/recalls/review`
    let appliedApprove = 0

    // With auto-approve OFF, the runner NEVER POSTs action 'approve'
    if (allowAutoApprove && approveIds.length > 0) {
      stdout(`Submitting ${approveIds.length} approved recalls...`)
      try {
        const approveRes = await fetchImpl(reviewUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Origin: origin,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: approveIds, action: 'approve' }),
        })
        if (!approveRes.ok) {
          stderr(`[API_ERROR] Failed to post approvals: HTTP ${approveRes.status}`)
          return { exitCode: 3, decisions, logLines }
        }
        appliedApprove = approveIds.length
      } catch (err) {
        stderr(`[NETWORK_ERROR] Network error posting approvals: ${err.message}`)
        return { exitCode: 3, decisions, logLines }
      }
    }

    if (rejectIds.length > 0) {
      stdout(`Submitting ${rejectIds.length} rejected recalls...`)
      try {
        const rejectRes = await fetchImpl(reviewUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Origin: origin,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: rejectIds, action: 'reject' }),
        })
        if (!rejectRes.ok) {
          stderr(`[API_ERROR] Failed to post rejections (approvals applied: ${appliedApprove}): HTTP ${rejectRes.status}`)
          return { exitCode: 3, decisions, logLines }
        }
      } catch (err) {
        stderr(`[NETWORK_ERROR] Network error posting rejections (approvals applied: ${appliedApprove}): ${err.message}`)
        return { exitCode: 3, decisions, logLines }
      }
    }

    if (!allowAutoApprove) {
      stdout('Auto-approve is OFF: 0 approvals submitted. Rejected spam submitted to API.')
    } else {
      stdout('Successfully applied moderation reviews to API.')
    }
  } else {
    stdout('[DRY RUN] No reviews were posted to the API. Run with --apply to apply decisions.')
  }

  return {
    exitCode: 0,
    decisions,
    approveIds,
    rejectIds,
    holdIds,
    logLines,
  }
}

// CLI entry point
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = await runRecallModerator()
  process.exit(result.exitCode)
}
