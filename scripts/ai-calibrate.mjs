#!/usr/bin/env node
// Checks a provider against the Échelle golden samples before you switch it on.
//   STUDY_AI_PROVIDER=openai STUDY_AI_MODEL=gpt-4.1-mini STUDY_AI_API_KEY=… node scripts/ai-calibrate.mjs
// Exits non-zero when agreement is below the threshold or any weak sample is passed.

import { createAiProvider } from '../server/echelle-ai-providers.mjs'
import { runCalibration } from '../server/echelle-ai-calibration.mjs'

const provider = createAiProvider(process.env)
if (!provider) {
  console.error('Set STUDY_AI_PROVIDER (openai | anthropic | mock) and STUDY_AI_MODEL first.')
  process.exit(2)
}
const minAgreement = Number(process.env.STUDY_AI_MIN_AGREEMENT || 0.85)
const report = await runCalibration(provider, { minAgreement })

for (const row of report.rows) {
  const verdict = row.error ? `ERROR ${row.error}` : row.passed ? 'pass' : 'fail'
  console.log(`${row.agree ? '✓' : '✗'} ${row.id.padEnd(14)} expected ${row.expected ? 'pass' : 'fail'}, got ${verdict}` +
    (row.mean !== undefined ? ` (mean ${row.mean})` : '') + (row.warnings?.length ? ` [${row.warnings.join(', ')}]` : ''))
}
console.log(`\n${report.provider}/${report.model}: agreement ${(report.agreement * 100).toFixed(0)}%, false passes ${report.falsePasses}, errors ${report.errors}`)
console.log(report.ok ? 'OK — provider meets the standard.' : `NOT OK — needs ≥ ${minAgreement * 100}% agreement and no false passes.`)
process.exit(report.ok ? 0 : 1)
