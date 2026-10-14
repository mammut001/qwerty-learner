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

import fs, { appendFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createAiProvider } from '../server/echelle-ai-providers.mjs'
import {
  RECALL_HARNESS_VERSION,
  RECALL_REASON_CODES,
  moderateRecall,
  moderateRecallRulesOnly,
} from '../server/recall-moderation-harness.mjs'
import { runRecallCalibration } from '../server/recall-moderation-calibration.mjs'

function atomicWriteJson(filePath, data, fsImpl = fs) {
  const tmpPath = `${filePath}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}`
  const json = JSON.stringify(data, null, 2)
  fsImpl.writeFileSync(tmpPath, json, 'utf8')
  if (typeof fsImpl.renameSync === 'function') {
    fsImpl.renameSync(tmpPath, filePath)
  } else {
    fsImpl.writeFileSync(filePath, json, 'utf8')
  }
}

export function parseArgs(argv = []) {
  const options = {
    apply: false,
    dryRun: true,
    calibrate: false,
    skipCalibration: false,
    autoApprove: false,
    rulesOnly: false,
    noExcerpt: false,
    maxItems: 50,
    maxApprove: 20,
    logFile: null,
    calibrationCache: null,
    calibrationMaxAgeHours: 24,
    stateFile: null,
    recheck: false,
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
    } else if (arg === '--rules-only') {
      options.rulesOnly = true
    } else if (arg === '--no-excerpt') {
      options.noExcerpt = true
    } else if (arg === '--max-items') {
      const val = parseInt(argv[++i], 10)
      if (!Number.isNaN(val) && val > 0) options.maxItems = val
    } else if (arg === '--max-approve') {
      const val = parseInt(argv[++i], 10)
      if (!Number.isNaN(val) && val >= 0) options.maxApprove = val
    } else if (arg === '--log') {
      options.logFile = argv[++i] || null
    } else if (arg === '--calibration-cache') {
      options.calibrationCache = argv[++i] || null
    } else if (arg === '--calibration-max-age-hours') {
      const val = parseFloat(argv[++i])
      if (!Number.isNaN(val) && val >= 0) options.calibrationMaxAgeHours = val
    } else if (arg === '--state') {
      options.stateFile = argv[++i] || null
    } else if (arg === '--recheck') {
      options.recheck = true
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
  provider: injectedProvider = null,
  fs: injectedFs = null,
  now: injectedNow = null,
} = {}) {
  const opts = parseArgs(argv)
  const rulesOnly = opts.rulesOnly || env.RECALL_RULES_ONLY === '1'
  const noExcerpt = opts.noExcerpt || env.RECALL_NO_EXCERPT === '1'
  const allowAutoApprove = opts.autoApprove || env.RECALL_AUTO_APPROVE === '1'
  const calibrationCacheFile = opts.calibrationCache || env.RECALL_CALIBRATION_CACHE || null
  const calibrationMaxAgeHours = opts.calibrationMaxAgeHours ?? (env.RECALL_CALIBRATION_MAX_AGE_HOURS ? parseFloat(env.RECALL_CALIBRATION_MAX_AGE_HOURS) : 24)
  const stateFile = opts.stateFile || env.RECALL_STATE_FILE || null
  const recheck = opts.recheck || env.RECALL_RECHECK === '1' || env.RECALL_RECHECK === 'true'
  const logLines = []

  const fsImpl = injectedFs || fs
  const getNow = () => {
    if (typeof injectedNow === 'function') return injectedNow()
    if (typeof injectedNow === 'number') return injectedNow
    return Date.now()
  }

  // Check configuration errors
  if (rulesOnly && allowAutoApprove) {
    stderr('[CONFIG_ERROR] --auto-approve cannot be used together with --rules-only.')
    return { exitCode: 2, logLines }
  }

  const writeLog = (record) => {
    const line = JSON.stringify(record)
    logLines.push(line)
    if (opts.logFile) {
      try {
        if (typeof fsImpl.appendFileSync === 'function') {
          fsImpl.appendFileSync(opts.logFile, line + '\n', 'utf8')
        } else {
          appendFileSync(opts.logFile, line + '\n', 'utf8')
        }
      } catch (err) {
        stderr(`[WARN] Failed to write to log file ${opts.logFile}: ${err.message}`)
      }
    } else {
      stdout(line)
    }
  }

  // Handle standalone --calibrate flag
  if (opts.calibrate) {
    if (rulesOnly) {
      stdout('Rules-only mode: calibration gate is skipped.')
      return { exitCode: 0, logLines }
    }
    let provider = injectedProvider
    if (!provider) {
      try {
        provider = createAiProvider(env, fetchImpl)
      } catch (err) {
        stderr(`[CONFIG_ERROR] Failed to initialize AI provider: ${err.message}`)
        return { exitCode: 2, logLines }
      }
    }
    if (!provider) {
      stderr('[CONFIG_ERROR] STUDY_AI_PROVIDER (openai | anthropic | mock) and STUDY_AI_MODEL are required.')
      return { exitCode: 2, logLines }
    }
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
      if (calibrationCacheFile) {
        try {
          const cacheEntry = {
            provider: provider.name,
            model: provider.model,
            harnessVersion: RECALL_HARNESS_VERSION,
            mode: allowAutoApprove ? 'auto-approve' : 'triage',
            ok: true,
            falseApprovals: 0,
            agreement: report.agreement,
            at: getNow(),
          }
          atomicWriteJson(calibrationCacheFile, cacheEntry, fsImpl)
        } catch (err) {
          stderr(`[WARN] Failed to write calibration cache ${calibrationCacheFile}: ${err.message}`)
        }
      }
      return { exitCode: 0, report, logLines }
    }
    stderr('\nNOT OK — calibration failed (false approvals > 0 or agreement below minimum).')
    return { exitCode: 1, report, logLines }
  }

  // Validate API base and token for moderation run
  const apiBase = env.RECALL_API_BASE
  if (!apiBase) {
    stderr('[CONFIG_ERROR] RECALL_API_BASE environment variable is required.')
    return { exitCode: 2, logLines }
  }

  const token = env.RECALL_API_TOKEN || env.RECALL_MODERATOR_TOKEN
  if (!token) {
    stderr('[CONFIG_ERROR] RECALL_API_TOKEN or RECALL_MODERATOR_TOKEN environment variable is required.')
    return { exitCode: 2, logLines }
  }

  const origin = env.RECALL_API_ORIGIN || 'https://french.paytonpei.top'

  // Fetch pending recalls BEFORE creating provider or running calibration
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

  // Load state file and prune stale IDs no longer pending
  let state = { version: 1, items: {} }
  let stateModified = false
  if (stateFile) {
    try {
      const raw = fsImpl.readFileSync(stateFile, 'utf8')
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && parsed.items && typeof parsed.items === 'object') {
        state = { version: parsed.version || 1, items: { ...parsed.items } }
      }
    } catch {
      state = { version: 1, items: {} }
    }
  }

  const pendingIdSet = new Set(items.map((i) => i.id))
  for (const storedId of Object.keys(state.items)) {
    if (!pendingIdSet.has(storedId)) {
      delete state.items[storedId]
      stateModified = true
    }
  }

  // Filter out items already recorded as hold (unless recheck is true)
  let alreadyHeldCount = 0
  const itemsToModerate = []
  for (const item of items) {
    const record = state.items[item.id]
    if (!recheck && record && record.decision === 'hold') {
      alreadyHeldCount++
    } else {
      itemsToModerate.push(item)
    }
  }

  const printSummary = ({ decisions = [], applied = 0, alreadyHeld = alreadyHeldCount } = {}) => {
    const summary = {
      total: items.length,
      rejected: decisions.filter((d) => d.decision === 'reject').length,
      holdReview: decisions.filter((d) => d.decision === 'hold' && d.recommendation === 'review').length,
      holdHuman: decisions.filter((d) => d.decision === 'hold' && d.recommendation === 'human').length,
      recommendApprove: decisions.filter((d) => d.recommendation === 'approve').length,
      alreadyHeld,
      applied,
      mode: rulesOnly ? 'rules-only' : (allowAutoApprove ? 'auto-approve' : 'triage'),
      harnessVersion: RECALL_HARNESS_VERSION,
    }
    stdout(`SUMMARY ${JSON.stringify(summary)}`)
    return summary
  }

  // If 0 pending items or 0 items left after state filter: print SUMMARY and exit 0 without provider/calibration
  if (itemsToModerate.length === 0) {
    if (stateFile && stateModified) {
      try {
        atomicWriteJson(stateFile, state, fsImpl)
      } catch (err) {
        stderr(`[WARN] Failed to write state file ${stateFile}: ${err.message}`)
      }
    }
    if (items.length === 0) {
      stdout('No pending recalls found to moderate.')
    } else {
      stdout(`All ${items.length} pending recalls are already held in state. Skipping model calls.`)
    }
    const summary = printSummary({ decisions: [], applied: 0, alreadyHeld: alreadyHeldCount })
    return { exitCode: 0, decisions: [], logLines, summary, alreadyHeld: alreadyHeldCount }
  }

  // Initialize AI provider (only when items need moderation and not rules-only)
  let provider = null
  if (!rulesOnly) {
    try {
      provider = injectedProvider || createAiProvider(env, fetchImpl)
    } catch (err) {
      stderr(`[CONFIG_ERROR] Failed to initialize AI provider: ${err.message}`)
      return { exitCode: 2, logLines }
    }

    if (!provider) {
      stderr('[CONFIG_ERROR] STUDY_AI_PROVIDER (openai | anthropic | mock) and STUDY_AI_MODEL are required.')
      return { exitCode: 2, logLines }
    }
  }

  // Pre-run calibration gate for --apply (with calibration cache support)
  const currentMode = allowAutoApprove ? 'auto-approve' : 'triage'
  if (rulesOnly) {
    stdout('Rules-only mode: calibration gate is skipped.')
  } else if (opts.apply && !opts.skipCalibration) {
    let cacheHit = false
    const nowTime = getNow()
    if (calibrationCacheFile) {
      try {
        const rawCache = fsImpl.readFileSync(calibrationCacheFile, 'utf8')
        const cacheEntry = JSON.parse(rawCache)
        if (
          cacheEntry &&
          typeof cacheEntry === 'object' &&
          cacheEntry.provider === provider.name &&
          cacheEntry.model === provider.model &&
          cacheEntry.harnessVersion === RECALL_HARNESS_VERSION &&
          (cacheEntry.mode === currentMode ||
            (allowAutoApprove ? cacheEntry.mode === 'auto-approve-on' : cacheEntry.mode === 'auto-approve-off')) &&
          cacheEntry.ok === true &&
          cacheEntry.falseApprovals === 0 &&
          typeof cacheEntry.at === 'number'
        ) {
          const ageHours = (nowTime - cacheEntry.at) / (3600 * 1000)
          if (ageHours >= 0 && ageHours < calibrationMaxAgeHours) {
            cacheHit = true
            stdout(`[CALIBRATION_CACHE] Reusing passing calibration cache from ${calibrationCacheFile} (age: ${ageHours.toFixed(1)}h < ${calibrationMaxAgeHours}h). Calibration skipped.`)
          }
        }
      } catch {
        // Corrupt or unreadable cache file = no cache
      }
    }

    if (!cacheHit) {
      stdout(`Running safety calibration gate before applying reviews (mode: ${allowAutoApprove ? 'auto-approve ON' : 'auto-approve OFF'})...`)
      const calReport = await runRecallCalibration(provider, { allowAutoApprove })
      if (!calReport.ok || calReport.falseApprovals > 0) {
        stderr(`[SAFETY_GATE_TRIGGERED] Provider failed calibration gate (${calReport.falseApprovals} false approvals, ${(calReport.agreement * 100).toFixed(0)}% agreement). Refusing to apply changes.`)
        return { exitCode: 4, report: calReport, logLines }
      }
      stdout('Safety calibration passed (0 false approvals). Proceeding with moderation.')
      if (calibrationCacheFile) {
        try {
          const cacheEntry = {
            provider: provider.name,
            model: provider.model,
            harnessVersion: RECALL_HARNESS_VERSION,
            mode: currentMode,
            ok: true,
            falseApprovals: 0,
            agreement: calReport.agreement,
            at: nowTime,
          }
          atomicWriteJson(calibrationCacheFile, cacheEntry, fsImpl)
        } catch (err) {
          stderr(`[WARN] Failed to write calibration cache ${calibrationCacheFile}: ${err.message}`)
        }
      }
    }
  }

  stdout(`Processing ${itemsToModerate.length} pending recalls (${alreadyHeldCount} already held in state, max items: ${opts.maxItems}, max approve cap: ${opts.maxApprove}, auto-approve: ${allowAutoApprove ? 'ON' : 'OFF'}).`)

  const validFetchedIds = new Set(items.map((i) => i.id))
  let approvedCount = 0
  const decisions = []

  // Moderate items independently
  for (const item of itemsToModerate) {
    let result
    if (rulesOnly) {
      result = moderateRecallRulesOnly(item, { now: getNow() })
    } else {
      try {
        result = await moderateRecall(item, provider, {
          approvedCount,
          maxApprove: opts.maxApprove,
          allowAutoApprove,
          now: getNow(),
        })
      } catch (err) {
        // Independent isolation: one failure does not abort other items
        result = {
          id: item.id,
          decision: 'hold',
          recommendation: 'review',
          reasons: [RECALL_REASON_CODES.MODEL_ERROR],
          model: provider?.model || 'unknown',
          harnessVersion: RECALL_HARNESS_VERSION,
        }
      }
    }

    if (result.decision === 'approve') {
      approvedCount++
    }
    decisions.push(result)

    if (result.decision === 'hold') {
      state.items[item.id] = {
        decision: 'hold',
        reasons: result.reasons || [],
        recommendation: result.recommendation || (rulesOnly ? 'human' : 'review'),
        at: getNow(),
      }
      stateModified = true
    } else if (state.items[item.id]) {
      delete state.items[item.id]
      stateModified = true
    }

    if (noExcerpt) {
      stdout(`[item] id=${item.id} section=${item.section || ''} task=${item.task ?? ''} examMonth=${item.examMonth || ''} decision=${result.decision} recommendation=${result.recommendation || ''} reasons=${(result.reasons || []).join(',')} harnessVersion=${result.harnessVersion || RECALL_HARNESS_VERSION}`)
      writeLog({
        id: item.id,
        section: item.section,
        task: item.task,
        examMonth: item.examMonth,
        decision: result.decision,
        recommendation: result.recommendation || (rulesOnly ? 'human' : 'review'),
        reasons: result.reasons,
        harnessVersion: result.harnessVersion || RECALL_HARNESS_VERSION,
      })
    } else {
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
        model: result.model || provider?.model || (rulesOnly ? 'rules-only' : 'none'),
        harnessVersion: RECALL_HARNESS_VERSION,
        excerpt,
        timestamp: getNow(),
      })
    }
  }

  // Save state file if modified
  if (stateFile && stateModified) {
    try {
      atomicWriteJson(stateFile, state, fsImpl)
    } catch (err) {
      stderr(`[WARN] Failed to write state file ${stateFile}: ${err.message}`)
    }
  }

  const approveIds = decisions.filter((d) => d.decision === 'approve').map((d) => d.id).filter((id) => validFetchedIds.has(id))
  const rejectIds = decisions.filter((d) => d.decision === 'reject').map((d) => d.id).filter((id) => validFetchedIds.has(id))
  const holdIds = decisions.filter((d) => d.decision === 'hold').map((d) => d.id)

  if (rulesOnly) {
    const humanCount = decisions.filter((d) => d.decision === 'hold' && d.recommendation === 'human').length
    const reviewCount = decisions.filter((d) => d.decision === 'hold' && d.recommendation === 'review').length
    const rejectCount = decisions.filter((d) => d.decision === 'reject').length
    stdout(`\nRules-only summary:`)
    stdout(`- Total: ${decisions.length}`)
    stdout(`- Unscreened (held for human review): ${humanCount}`)
    stdout(`- Suspicious / Meta (held for review): ${reviewCount}`)
    stdout(`- Rejected: ${rejectCount}`)
  } else if (!allowAutoApprove) {
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
  let appliedTotal = 0
  if (opts.apply) {
    const reviewUrl = `${apiBase.replace(/\/+$/, '')}/api/study-plan/admin/recalls/review`
    let appliedApprove = 0
    let appliedReject = 0

    // With auto-approve OFF or rules-only, the runner NEVER POSTs action 'approve'
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
          let errBody = null
          try {
            errBody = await approveRes.json()
          } catch {}
          if (approveRes.status === 403 && errBody?.code === 'RECALL_MODERATOR_REJECT_ONLY') {
            stderr(`[API_ERROR] Server returned 403 RECALL_MODERATOR_REJECT_ONLY: Moderator token is reject-only and cannot approve recalls.`)
            return { exitCode: 3, decisions, logLines }
          }
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
        appliedReject = rejectIds.length
      } catch (err) {
        stderr(`[NETWORK_ERROR] Network error posting rejections (approvals applied: ${appliedApprove}): ${err.message}`)
        return { exitCode: 3, decisions, logLines }
      }
    }

    appliedTotal = appliedApprove + appliedReject
    if (rulesOnly) {
      stdout(`Rules-only mode applied: ${appliedReject} rejection(s) submitted to API.`)
    } else if (!allowAutoApprove) {
      stdout('Auto-approve is OFF: 0 approvals submitted. Rejected spam submitted to API.')
    } else {
      stdout('Successfully applied moderation reviews to API.')
    }
  } else {
    stdout('[DRY RUN] No reviews were posted to the API. Run with --apply to apply decisions.')
  }

  const summary = printSummary({ decisions, applied: appliedTotal })

  return {
    exitCode: 0,
    decisions,
    approveIds,
    rejectIds,
    holdIds,
    logLines,
    summary,
    alreadyHeld: alreadyHeldCount,
  }
}

// CLI entry point
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const result = await runRecallModerator()
  process.exit(result.exitCode)
}
