import { REAL_READING_PASSAGES } from './echelle-variants/real-reading.mjs'

/**
 * Return metadata for real reading passages at a given level (or all if omitted).
 * Text and questions/answers are excluded.
 */
export function listRealReading(level) {
  const filtered =
    typeof level === 'number'
      ? REAL_READING_PASSAGES.filter((p) => p.level === level)
      : REAL_READING_PASSAGES

  return filtered.map((p) => ({
    id: p.id,
    level: p.level,
    site: p.site,
    title: p.title,
    url: p.url,
    historyUrl: p.historyUrl,
    revisionId: p.revisionId,
    licenceName: p.licenceName,
    licenceUrl: p.licenceUrl,
    retrievedAt: p.retrievedAt,
    words: p.text.trim().split(/\s+/).filter(Boolean).length,
    wordCount: p.text.trim().split(/\s+/).filter(Boolean).length,
    justificationFr: p.justificationFr,
    paragraphsKept: p.paragraphsKept,
    disagreement: Boolean(p.disagreement),
  }))
}

/**
 * Retrieve a full passage by ID (including text and questions).
 */
export function getRealReading(id) {
  const passage = REAL_READING_PASSAGES.find((p) => p.id === id)
  if (!passage) return null
  return { ...passage }
}

/**
 * Score answers for a real reading passage.
 * Returns the same shape as quiz scoring result.
 */
export function scoreRealReading(id, answers) {
  const passage = getRealReading(id)
  if (!passage) return null

  const userAnswers = Array.isArray(answers) ? answers : []
  const questions = passage.questions || []
  let correctCount = 0
  const perQuestion = []

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    const correctAnswer = q[1]
    const userChoice = userAnswers[i]
    const isCorrect =
      userChoice === correctAnswer ||
      (typeof userChoice === 'number' && userChoice === 0)
    if (isCorrect) correctCount++
    perQuestion.push(Boolean(isCorrect))
  }

  const score = questions.length ? correctCount / questions.length : 0
  const mastered = questions.length ? score >= 1 : false

  return {
    kind: 'real-reading',
    correctCount,
    totalQuestions: questions.length,
    score,
    mastered,
    results: perQuestion,
    perQuestion,
  }
}

/**
 * Format the exact required attribution credit line for a real reading passage:
 * « Source : « <title> », <Vikidia|Wikipédia> (<url>), auteurs : <historyUrl>, licence <licenceName> (<licenceUrl>).
 *   Texte reproduit sans modification. Questions © Qwerty Français, diffusées sous la même licence. »
 */
export function formatRealReadingAttribution(passage) {
  if (!passage) return ''
  const siteDisplay = passage.site === 'wikipedia' ? 'Wikipédia' : 'Vikidia'
  return `Source : « ${passage.title} », ${siteDisplay} (${passage.url}), auteurs : ${passage.historyUrl}, licence ${passage.licenceName} (${passage.licenceUrl}). Texte reproduit sans modification. Questions © Qwerty Français, diffusées sous la même licence.`
}

export const getRealReadingAttribution = formatRealReadingAttribution
