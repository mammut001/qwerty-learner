import { ECHELLE_LEVELS } from './echelle-data.mjs'
import { SENTENCE_GRAMMAR } from './echelle-grammar-bank.mjs'
import { TEXT_GRAMMAR } from './echelle-texte-bank.mjs'
import { LEXIQUE_TOPICS } from './echelle-lexique-bank.mjs'
import { LISTENING_CHECKS } from './echelle-listening-bank.mjs'
import { READING_CHECKS } from './echelle-reading-bank.mjs'
import { WRITING_TASKS, SPEAKING_TASKS } from './echelle-production-bank.mjs'

// Utilities ------------------------------------------------------------------
function djb2(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash = hash & 0xffffffff
  }
  return Math.abs(hash)
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(array, seed) {
  const rand = mulberry32(seed)
  const out = array.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Banks list the correct answer first; display order must not leak it.
function toQuestions(itemId, rows) {
  return rows.map(([prompt, ...choices], index) => ({
    prompt,
    choices: shuffle(choices, djb2(`${itemId}#${index}`)),
    answer: choices[0],
  }))
}

// Item ID regex used server-side for validation.
export const ECHELLE_ITEM_ID_REGEX = /^n(\d{1,2})-(listening|reading|writing|speaking|lex|gr)-[a-z0-9-]{1,60}$/

export function parseEchelleItemId(itemId) {
  const m = itemId.match(ECHELLE_ITEM_ID_REGEX)
  if (!m) return null
  return { level: Number(m[1]), skill: m[2] }
}

// Grammar / text concept mapping ---------------------------------------------
const GRAMMAR_BY_TEXT = new Map()
for (const concept of [...SENTENCE_GRAMMAR, ...TEXT_GRAMMAR]) {
  for (const [text, isAdvanced] of concept.sources) {
    if (!GRAMMAR_BY_TEXT.has(text)) {
      GRAMMAR_BY_TEXT.set(text, { id: concept.id, titleZh: concept.titleZh, isAdvanced })
    }
  }
}

function addGrammarItems(catalog, levelItems) {
  const seenBase = new Set()
  const seenAdvanced = new Set()
  for (let level = 1; level <= 12; level++) {
    const texts = []
    for (const skill of ['listening', 'reading', 'writing', 'speaking']) {
      const lvl = ECHELLE_LEVELS[skill].find(l => l.level === level)
      if (!lvl) continue
      for (const t of lvl.dimensions.phrase) texts.push(t)
      for (const t of lvl.dimensions.texte) texts.push(t)
    }
    for (const text of texts) {
      const g = GRAMMAR_BY_TEXT.get(text)
      if (!g) continue
      const baseId = `n${level}-gr-${g.id}`
      if (!seenBase.has(g.id)) {
        seenBase.add(g.id)
        const concept = findGrammarConcept(g.id)
        catalog[baseId] = {
          id: baseId,
          level,
          skill: 'gr',
          kind: 'grammar',
          titleZh: g.titleZh,
          explanationZh: concept.explanationZh,
          examples: concept.examples,
          questions: toQuestions(baseId, concept.questions),
          threshold: 0.75,
        }
        levelItems[level].push(baseId)
      } else if (g.isAdvanced && !seenAdvanced.has(g.id)) {
        seenAdvanced.add(g.id)
        const concept = findGrammarConcept(g.id)
        const advId = `n${level}-gr-${g.id}-avance`
        catalog[advId] = {
          id: advId,
          level,
          skill: 'gr',
          kind: 'grammar',
          titleZh: g.titleZh + '（深入）',
          explanationZh: concept.explanationZh,
          examples: concept.examples,
          questions: toQuestions(advId, concept.questions),
          threshold: 1,
        }
        levelItems[level].push(advId)
      }
    }
  }
}

function findGrammarConcept(id) {
  return SENTENCE_GRAMMAR.find(c => c.id === id) || TEXT_GRAMMAR.find(c => c.id === id)
}

// Lexique mapping -------------------------------------------------------------
const LEXIQUE_BY_TEXT = new Map()
for (const topic of LEXIQUE_TOPICS) {
  for (const text of topic.sources) {
    if (!LEXIQUE_BY_TEXT.has(text)) {
      LEXIQUE_BY_TEXT.set(text, { id: topic.id, titleZh: topic.titleZh })
    }
  }
}

function buildLexiqueQuestions(itemId, topic) {
  const seed = djb2(itemId)
  const rand = mulberry32(seed)
  const allZh = topic.words.map(w => w[1])
  const allFr = topic.words.map(w => w[0])
  const questions = []
  // 4 questions per topic, alternating FR→ZH and ZH→FR.
  for (let i = 0; i < 4; i++) {
    const wordIndex = i % topic.words.length
    const [fr, zh] = topic.words[wordIndex]
    const isFrPrompt = i % 2 === 0
    const prompt = isFrPrompt ? `${fr} 的意思是？` : `${zh} 对应的法语是？`
    const correct = isFrPrompt ? zh : fr
    const pool = isFrPrompt ? allZh : allFr
    const distractors = pool.filter(w => w !== correct)
    const shuffledDistractors = shuffle(distractors, Math.floor(rand() * 0x7fffffff)).slice(0, 3)
    const choices = shuffle([correct, ...shuffledDistractors], Math.floor(rand() * 0x7fffffff))
    questions.push({ prompt, choices, answer: correct })
  }
  return questions
}

function addLexiqueItems(catalog, levelItems) {
  const seenBase = new Set()
  const seenAdvanced = new Set()
  for (let level = 1; level <= 12; level++) {
    const texts = []
    for (const skill of ['listening', 'reading', 'writing', 'speaking']) {
      const lvl = ECHELLE_LEVELS[skill].find(l => l.level === level)
      if (!lvl) continue
      for (const t of lvl.dimensions.lexique) texts.push(t)
    }
    for (const text of texts) {
      const t = LEXIQUE_BY_TEXT.get(text)
      if (!t) continue
      const topic = LEXIQUE_TOPICS.find(x => x.id === t.id)
      if (!topic) continue
      const baseId = `n${level}-lex-${t.id}`
      if (!seenBase.has(t.id)) {
        seenBase.add(t.id)
        catalog[baseId] = {
          id: baseId,
          level,
          skill: 'lex',
          kind: 'lexique',
          titleZh: t.titleZh,
          words: topic.words,
          questions: buildLexiqueQuestions(baseId, topic),
          threshold: 0.75,
        }
        levelItems[level].push(baseId)
      } else if (text.includes('variété') && !seenAdvanced.has(t.id)) {
        seenAdvanced.add(t.id)
        const advId = `n${level}-lex-${t.id}-avance`
        catalog[advId] = {
          id: advId,
          level,
          skill: 'lex',
          kind: 'lexique',
          titleZh: t.titleZh + '（深入）',
          words: topic.words,
          questions: buildLexiqueQuestions(advId, topic),
          threshold: 1,
        }
        levelItems[level].push(advId)
      }
    }
  }
}

// Listening / reading indicator checks ----------------------------------------
function addIndicatorItems(catalog, levelItems) {
  for (const skill of ['listening', 'reading']) {
    const bank = skill === 'listening' ? LISTENING_CHECKS : READING_CHECKS
    for (let level = 1; level <= 12; level++) {
      const checks = bank[level] || []
      const lvl = ECHELLE_LEVELS[skill].find(l => l.level === level)
      if (!lvl) continue
      checks.forEach((check, i) => {
        const id = `n${level}-${skill}-${i}`
        const indicator = lvl.indicators[i]
        catalog[id] = {
          id,
          level,
          skill,
          kind: 'indicator',
          titleZh: (indicator ? `指标 ${i + 1}` : `练习 ${i + 1}`),
          descriptionFr: indicator?.fr,
          text: check.text,
          audioText: skill === 'listening' ? check.text : undefined,
          questions: toQuestions(id, check.questions),
          threshold: 1,
        }
        levelItems[level].push(id)
      })
    }
  }
}

// Production checks ------------------------------------------------------------
function addProductionItems(catalog, levelItems) {
  for (const task of WRITING_TASKS) {
    const id = `n${task.level}-writing-production`
    catalog[id] = {
      id,
      level: task.level,
      skill: 'writing',
      kind: 'production',
      titleZh: '书面表达',
      promptZh: task.promptZh,
      promptFr: task.promptFr,
      wordMin: task.wordMin,
      selfChecks: task.selfChecks,
    }
    levelItems[task.level].push(id)
  }
  for (const task of SPEAKING_TASKS) {
    const id = `n${task.level}-speaking-production`
    catalog[id] = {
      id,
      level: task.level,
      skill: 'speaking',
      kind: 'production',
      titleZh: '口语表达',
      promptZh: task.promptZh,
      promptFr: task.promptFr,
      secondsMin: task.secondsMin,
      selfChecks: task.selfChecks,
    }
    levelItems[task.level].push(id)
  }
}

// Build catalog ----------------------------------------------------------------
const catalog = {}
const levelItems = Array.from({ length: 13 }, () => [])

addGrammarItems(catalog, levelItems)
addLexiqueItems(catalog, levelItems)
addIndicatorItems(catalog, levelItems)
addProductionItems(catalog, levelItems)

// Sort each level deterministically: by skill order, then by item id.
const SKILL_ORDER = { listening: 0, reading: 1, writing: 2, speaking: 3, lex: 4, gr: 5 }
for (let level = 1; level <= 12; level++) {
  levelItems[level].sort((a, b) => {
    const pa = parseEchelleItemId(a)
    const pb = parseEchelleItemId(b)
    const oa = SKILL_ORDER[pa.skill] ?? 99
    const ob = SKILL_ORDER[pb.skill] ?? 99
    if (oa !== ob) return oa - ob
    return a.localeCompare(b)
  })
}

export const ECHELLE_ITEM_CATALOG = Object.freeze(catalog)
export const ECHELLE_LEVEL_ITEMS = Object.freeze(levelItems)

export function getEchelleLevelItems(level) {
  if (level < 1 || level > 12) return []
  return ECHELLE_LEVEL_ITEMS[level]
}

export function getEchelleItem(itemId) {
  return ECHELLE_ITEM_CATALOG[itemId] || null
}

// Scoring ---------------------------------------------------------------------
export function scoreEchelleItem(itemId, answers, meta = {}) {
  const item = getEchelleItem(itemId)
  if (!item) return null

  if (item.kind === 'production') {
    const selfChecks = meta.selfChecks || []
    const allChecks = selfChecks.length >= (item.selfChecks?.length || 0) && selfChecks.every(Boolean)
    let passed = allChecks
    if (item.skill === 'writing') {
      const wordCount = typeof meta.wordCount === 'number' ? meta.wordCount : 0
      passed = passed && wordCount >= item.wordMin
    } else if (item.skill === 'speaking') {
      const seconds = typeof meta.seconds === 'number' ? meta.seconds : 0
      passed = passed && seconds >= item.secondsMin
    }
    return {
      kind: 'production',
      correctCount: passed ? 1 : 0,
      totalQuestions: 1,
      score: passed ? 1 : 0,
      mastered: passed,
      wordCount: item.skill === 'writing' ? (meta.wordCount || 0) : undefined,
      seconds: item.skill === 'speaking' ? (meta.seconds || 0) : undefined,
    }
  }

  const userAnswers = Array.isArray(answers) ? answers : []
  const questions = item.questions || []
  let correct = 0
  for (let i = 0; i < questions.length; i++) {
    if (userAnswers[i] === questions[i].answer) correct++
  }
  const score = questions.length ? correct / questions.length : 0
  const threshold = typeof item.threshold === 'number' ? item.threshold : 1
  const mastered = questions.length ? score >= threshold : false
  return {
    kind: item.kind,
    correctCount: correct,
    totalQuestions: questions.length,
    score,
    mastered,
  }
}

// Level progress --------------------------------------------------------------
export function summarizeEchelleLevel(level, masteredIds) {
  const items = getEchelleLevelItems(level)
  const masteredSet =
    masteredIds instanceof Set
      ? masteredIds
      : new Set(Array.isArray(masteredIds) ? masteredIds : [])
  const skillSummary = {}
  for (const id of items) {
    const parsed = parseEchelleItemId(id)
    if (!skillSummary[parsed.skill]) skillSummary[parsed.skill] = { total: 0, mastered: 0 }
    skillSummary[parsed.skill].total++
    if (masteredSet.has(id)) skillSummary[parsed.skill].mastered++
  }
  const total = items.length
  const mastered = items.filter(id => masteredSet.has(id)).length
  return {
    level,
    passed: total > 0 && mastered === total,
    total,
    mastered,
    skills: skillSummary,
  }
}

export function summarizeEchelleProgress(masteredIds) {
  const masteredSet = new Set(Array.isArray(masteredIds) ? masteredIds : [])
  const levels = []
  let currentLevel = 1
  for (let level = 1; level <= 12; level++) {
    const s = summarizeEchelleLevel(level, masteredSet)
    levels.push(s)
    if (!s.passed && currentLevel === level) currentLevel = level
    else if (s.passed && currentLevel === level) currentLevel = level + 1
  }
  return { levels, currentLevel: Math.min(currentLevel, 12) }
}
