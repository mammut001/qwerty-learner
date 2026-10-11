// Calibration of the level estimator on the repo's own reviewed reading texts (static scenarios, levels 4-12).
//
// Ground truth: the level in the scenario key (n<L>-reading-<i>) and its band (4-6, 7-8, 9-10, 11-12).
// Template scenarios (functions) are NOT used: only literal texts, as the task requires.
// Protocol: CUTS are tuned on a deterministic training half (even index within each level),
// then evaluated on the held-out odd-index half and on the full set (in-sample, for reference).
//
// Run: node scripts/reading-corpus/calibrate.mjs   (prints JSON)

import { SCENARIO_REGISTRY } from '../../server/echelle-variants/index.mjs'
import { computeMetrics, scoreMetrics, levelFromScore, bandOf, CUTS, loadDefaultBasicWords } from './level.mjs'

export const BANDS = ['4-6', '7-8', '9-10', '11-12']

export function loadCalibrationSet() {
  const basic = loadDefaultBasicWords()
  const items = []
  for (const key of Object.keys(SCENARIO_REGISTRY)) {
    const m = /^n(\d+)-reading-(\d+)$/.exec(key)
    if (!m) continue
    const level = Number(m[1])
    if (level < 4 || level > 12) continue
    const statics = SCENARIO_REGISTRY[key].filter((s) => s && typeof s === 'object' && typeof s.text === 'string')
    statics.forEach((s, idx) => {
      const metrics = computeMetrics(s.text, basic)
      const { score } = scoreMetrics(metrics)
      items.push({ id: `${key}#${idx}`, level, band: bandOf(level), text: s.text, metrics, score, idx, parity: idx % 2 })
    })
  }
  return items
}

export function estimateWith(items, cuts) {
  return items.map((it) => {
    const est = levelFromScore(it.score, cuts)
    return { ...it, estimatedLevel: est, estimatedBand: bandOf(est) }
  })
}

export function accuracy(items, cuts) {
  const rows = estimateWith(items, cuts)
  const n = rows.length || 1
  const exact = rows.filter((r) => r.band === r.estimatedBand).length
  const bandIdx = (b) => BANDS.indexOf(b)
  const within = rows.filter((r) => Math.abs(bandIdx(r.band) - bandIdx(r.estimatedBand)) <= 1).length
  const mae = rows.reduce((s, r) => s + Math.abs(r.level - r.estimatedLevel), 0) / n
  return {
    n: rows.length,
    exactBandAccuracy: round(exact / n),
    withinOneBandAccuracy: round(within / n),
    meanAbsLevelError: round(mae),
  }
}

export function confusion(items, cuts) {
  const matrix = BANDS.map(() => BANDS.map(() => 0))
  for (const r of estimateWith(items, cuts)) {
    matrix[BANDS.indexOf(r.band)][BANDS.indexOf(r.estimatedBand)]++
  }
  return matrix
}

// Coordinate descent over the 8 ascending cuts. Objective: exact-band accuracy, then within-one-band
// accuracy, then lower mean absolute level error. Deterministic (fixed grid, fixed start, fixed order).
export function tuneCuts(trainItems, start = CUTS, passes = 4) {
  const cuts = [...start]
  const score = (c) => {
    const a = accuracy(trainItems, c)
    return [a.exactBandAccuracy, a.withinOneBandAccuracy, -a.meanAbsLevelError]
  }
  const better = (x, y) => {
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return x[i] > y[i]
    return false
  }
  let best = score(cuts)
  for (let p = 0; p < passes; p++) {
    for (let k = 0; k < cuts.length; k++) {
      // Keep the cuts strictly ascending with a gap of at least 0.01 (no empty levels).
      const lo = k === 0 ? 0 : cuts[k - 1] + 0.01
      const hi = k === cuts.length - 1 ? 1 : cuts[k + 1] - 0.01
      for (let v = Math.max(lo, 0); v <= Math.min(hi, 1) + 1e-9; v += 0.01) {
        const cand = [...cuts]
        cand[k] = Math.round(v * 100) / 100
        const s = score(cand)
        if (better(s, best)) {
          best = s
          cuts[k] = cand[k]
        }
      }
    }
  }
  return cuts.map((c) => Math.round(c * 100) / 100)
}

function round(x) {
  return Math.round(x * 1000) / 1000
}

export function runCalibration(cuts = CUTS) {
  const all = loadCalibrationSet()
  const train = all.filter((it) => it.parity === 0)
  const holdout = all.filter((it) => it.parity === 1)
  const perLevel = {}
  for (const it of all) perLevel[it.level] = (perLevel[it.level] || 0) + 1
  return {
    cuts,
    counts: { total: all.length, perLevel, train: train.length, holdout: holdout.length },
    full: accuracy(all, cuts),
    holdout: accuracy(holdout, cuts),
    train: accuracy(train, cuts),
    confusionFull: confusion(all, cuts),
    confusionHoldout: confusion(holdout, cuts),
    items: estimateWith(all, cuts),
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const all = loadCalibrationSet()
  const train = all.filter((it) => it.parity === 0)
  const tuned = tuneCuts(train)
  const result = runCalibration(CUTS)
  const tunedResult = runCalibration(tuned)
  console.log(JSON.stringify({
    currentCuts: CUTS,
    tunedOnTrainingHalf: tuned,
    currentAccuracy: { full: result.full, holdout: result.holdout },
    tunedAccuracy: { full: tunedResult.full, holdout: tunedResult.holdout, train: tunedResult.train },
    tunedConfusionHoldout: tunedResult.confusionHoldout,
    counts: tunedResult.counts,
  }, null, 2))
}
