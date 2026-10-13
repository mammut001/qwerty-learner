// Deterministic French reading-level estimator (Échelle québécoise bands 4-12).
// Pure functions: no network, no LLM. The only I/O is the optional default loader for
// basic-words.json, which is kept out of the scoring functions (they take the set as an argument).
//
// Metrics (all computed on the text as given):
//   words                    word tokens (letters, hyphenated forms kept as one token)
//   sentences                sentences found by splitSentences()
//   meanSentenceLength       words / sentences
//   longSentenceShare        share of sentences with more than 25 words
//   subordinationPerSentence subordination markers / sentences (see SUBORDINATION_MARKERS)
//   longWordShare            share of tokens with at least 10 letters
//   ttr100                   type/token ratio on the first 100 tokens (fixed window)
//   outsideBasicShare        share of tokens not in the basic high-frequency list
//   complexCuesPer100        passive / complex-tense / subjunctive cues per 100 words
//
// Score: each metric is clamped to [0,1] between the fixed anchors in FEATURE_SPEC, then combined
// with WEIGHTS (sum = 1). The score is mapped to a level by the eight CUTS (ascending):
// level = 4 + number of cuts <= score. CUTS were tuned once on the level 4-12 static reading
// scenarios of server/echelle-variants (see calibrate.mjs and out/REPORT.md).

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export const SUBORDINATION_MARKERS = [
  'qui', 'que', 'dont', 'où', 'lorsque', 'puisque', 'quoique', 'quand',
  'bien que', 'afin que', 'tandis que', 'alors que', 'parce que', 'pour que',
  'pendant que', 'avant que', 'après que', 'sans que',
]

// Pronouns/determiners that can sit between "que" and a subjunctive verb; they are never counted as the verb.
const SUBJ_PRONOUNS = new Set(['je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles'])
const NON_VERB_AFTER_QUE = new Set([
  'le', 'la', 'les', 'l', 'un', 'une', 'des', 'de', 'd', 'ce', 'cette', 'ces', 'se', 'ne', 'me', 'te',
  'son', 'sa', 'ses', 'leur', 'leurs', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'notre', 'nos', 'votre',
  'vos', 'y', 'en', 'plus', 'moins', 'si', 'très', 'trop', 'bien', 'aussi', 'même', 'toute', 'tout',
  'tous', 'toutes', 'chaque', 'quelque', 'quelques', 'pas', 'jamais', 'rien', 'tant', 'mais', 'ou',
])
const SUBJUNCTIVE_ENDING = /(?:e|es|ent|ions|iez)$/

export const FEATURE_SPEC = {
  meanSentenceLength: { lo: 8, hi: 30 },
  longSentenceShare: { lo: 0, hi: 0.5 },
  subordinationPerSentence: { lo: 0, hi: 1.5 },
  longWordShare: { lo: 0.05, hi: 0.3 },
  ttr100: { lo: 0.5, hi: 0.8 },
  outsideBasicShare: { lo: 0.1, hi: 0.5 },
  complexCuesPer100: { lo: 0, hi: 6 },
}

export const WEIGHTS = {
  meanSentenceLength: 0.2,
  longSentenceShare: 0.1,
  subordinationPerSentence: 0.15,
  longWordShare: 0.15,
  ttr100: 0.1,
  outsideBasicShare: 0.2,
  complexCuesPer100: 0.1,
}

// Eight ascending cut points on the score in [0,1]. Filled in by calibrate.mjs (tuned once).
export const CUTS = [0.34, 0.4, 0.41, 0.42, 0.65, 0.69, 0.7, 0.75]

export function tokenize(text) {
  return String(text).normalize('NFC').toLowerCase().match(/\p{L}+(?:-\p{L}+)*/gu) || []
}

export function splitSentences(text) {
  const t = String(text).replace(/\s+/g, ' ').trim()
  if (!t) return []
  return t
    .split(/(?<=[.!?…][»”"”)]*)\s+(?=[A-ZÀ-ÖØ-Þ«“"(0-9])/u)
    .map((s) => s.trim())
    .filter(Boolean)
}

const SINGLE_SUBORDINATORS = new Set(['qu', 'que', 'qui', 'dont', 'où', 'lorsque', 'puisque', 'quoique', 'quand'])
const MULTI_SUBORDINATORS = new Set(['bien que', 'afin que', 'tandis que', 'alors que', 'parce que',
  'pour que', 'pendant que', 'avant que', 'après que', 'sans que'])

// Each occurrence counts once: a multi-word marker ("bien que") is counted as one marker, not as "que" too.
export function countSubordination(tokens) {
  let n = 0
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    const next = tokens[i + 1]
    if (next && MULTI_SUBORDINATORS.has(`${t} ${next}`)) {
      n++
      i++
    } else if (SINGLE_SUBORDINATORS.has(t)) {
      n++
    }
  }
  return n
}

// Count "a été", "ont été", "avait/avaient", "aurait/auraient", forms in -èrent, and subjunctive cues after "que".
export function countComplexCues(tokens) {
  let n = 0
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    const next = tokens[i + 1]
    if ((t === 'a' || t === 'ont') && next === 'été') n++
    else if (t === 'avait' || t === 'avaient' || t === 'aurait' || t === 'auraient') n++
    else if (/èrent$/.test(t)) n++
    if (t === 'que' || t === 'qu') {
      let j = i + 1
      if (tokens[j] && SUBJ_PRONOUNS.has(tokens[j])) j++
      const cand = tokens[j]
      if (cand && !NON_VERB_AFTER_QUE.has(cand) && cand.length > 2 && SUBJUNCTIVE_ENDING.test(cand)) n++
    }
  }
  return n
}

function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

let defaultBasicWords = null
export function loadDefaultBasicWords() {
  if (!defaultBasicWords) {
    const here = dirname(fileURLToPath(import.meta.url))
    const data = JSON.parse(readFileSync(join(here, 'basic-words.json'), 'utf8'))
    defaultBasicWords = new Set(data.words)
  }
  return defaultBasicWords
}

export function computeMetrics(text, basicWords = loadDefaultBasicWords()) {
  const tokens = tokenize(text)
  const words = tokens.length
  const sentences = splitSentences(text)
  const sentenceCount = Math.max(1, sentences.length)
  const longSentences = sentences.filter((s) => tokenize(s).length > 25).length
  const longWords = tokens.filter((t) => t.replace(/-/g, '').length >= 10).length
  const window = tokens.slice(0, 100)
  const ttr100 = window.length ? new Set(window).size / window.length : 0
  const outside = tokens.filter((t) => !basicWords.has(t)).length
  const cues = countComplexCues(tokens)
  const subs = countSubordination(tokens)
  const metrics = {
    words,
    sentences: sentences.length,
    meanSentenceLength: words / sentenceCount,
    longSentenceShare: longSentences / sentenceCount,
    subordinationPerSentence: subs / sentenceCount,
    longWordShare: words ? longWords / words : 0,
    ttr100,
    outsideBasicShare: words ? outside / words : 0,
    complexCuesPer100: words ? (cues / words) * 100 : 0,
  }
  for (const k of Object.keys(metrics)) {
    if (typeof metrics[k] === 'number') metrics[k] = Math.round(metrics[k] * 10000) / 10000
  }
  return metrics
}

export function scoreMetrics(metrics) {
  let score = 0
  const parts = {}
  for (const [k, w] of Object.entries(WEIGHTS)) {
    const { lo, hi } = FEATURE_SPEC[k]
    const x = clamp01((metrics[k] - lo) / (hi - lo))
    parts[k] = x
    score += w * x
  }
  return { score: Math.round(score * 10000) / 10000, parts }
}

export function levelFromScore(score, cuts = CUTS) {
  let level = 4
  for (const c of cuts) if (score >= c) level++
  return level
}

export function bandOf(level) {
  if (level <= 6) return '4-6'
  if (level <= 8) return '7-8'
  if (level <= 10) return '9-10'
  return '11-12'
}

export function estimateLevel(text, { basicWords, cuts = CUTS } = {}) {
  const metrics = computeMetrics(text, basicWords ?? loadDefaultBasicWords())
  const { score, parts } = scoreMetrics(metrics)
  const estimatedLevel = levelFromScore(score, cuts)
  return { metrics, score, parts, estimatedLevel, band: bandOf(estimatedLevel) }
}
