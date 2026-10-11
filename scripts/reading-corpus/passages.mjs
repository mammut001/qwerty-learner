// Pure passage selection for the offline reading corpus. No network, no LLM, no rewriting.
//
// A passage is a run of consecutive whole paragraphs taken verbatim from a plain-text extract
// (MediaWiki action=query&prop=extracts&explaintext=1). The only transformations are:
//   - dropping whole lines (section headers, list items, lines that look like formulas or tables,
//     the "Notes et références" / "Voir aussi" / "Bibliographie" / "Liens externes" tail);
//   - trimming leading and trailing whitespace of each line.
// Nothing inside a paragraph is changed, so every paragraph is a substring of the extract.

import { tokenize } from './level.mjs'

export const PASSAGE_MIN_WORDS = 80
export const PASSAGE_MAX_WORDS = 300
export const MAX_PASSAGES_PER_ARTICLE = 3

const SECTION_STOP = /^(notes et références|références|bibliographie|voir aussi|articles connexes|liens externes|annexes|notes|sources?|pour approfondir|vikiliens sur le logement|vikiliens.*)$/i
const LIST_LINE = /^\s*(?:[*#•·–-]|\d+[.)])\s/
const FORMULA_OR_TABLE = /[{}|\\<>^=_~]/
const MARKUP_IN_TEXT = /[\[\]{}<>|*\\^]|''|https?:|&[a-z]+;|\bthumb\b|\bfile:/i
const SENTENCE_END = /[.!?…][»”"”)]*$/
const SENTENCE_START = /^[A-ZÀ-ÖØ-Þ«“"(0-9]/u
// Opening words that make a paragraph depend on what precedes it (anaphora guard).
const ANAPHORIC_START = /^(il|elle|ils|elles|ce|cet|cette|ces|celui|celle|ceux|celles|cela|ça|ceci|cependant|toutefois|ainsi|malgré|ensuite|enfin|par ailleurs|en outre|dans ce|dans cette|pour cela)\b/i
const BACK_REFERENCE = /\b(ci-dessus|ci-dessous|susmentionn\p{L}+|précité\p{L}*|plus haut)\b/iu

// Splits the extract into candidate paragraphs. Returns { paragraphs, droppedLines }.
export function cleanExtract(extract) {
  const paragraphs = []
  const dropped = { headings: 0, lists: 0, formulas: 0, sectionTail: 0 }
  const lines = String(extract ?? '').split('\n')
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    const heading = /^=+\s*(.*?)\s*=+$/.exec(line)
    if (heading) {
      if (SECTION_STOP.test(heading[1].trim())) {
        dropped.sectionTail += 1
        break
      }
      dropped.headings += 1
      continue
    }
    if (LIST_LINE.test(line)) {
      dropped.lists += 1
      continue
    }
    if (FORMULA_OR_TABLE.test(line)) {
      dropped.formulas += 1
      continue
    }
    paragraphs.push(line)
  }
  return { paragraphs, droppedLines: dropped }
}

export function countWords(text) {
  return tokenize(text).length
}

// Paragraph-level checks. A paragraph is "usable" when it is a complete, unbroken sentence block.
export function paragraphProblems(p) {
  const problems = []
  if (countWords(p) < 5) problems.push('too-short')
  if (!SENTENCE_END.test(p)) problems.push('truncated-end')
  if (!SENTENCE_START.test(p)) problems.push('truncated-start')
  if (MARKUP_IN_TEXT.test(p)) problems.push('leftover-markup')
  if (count(p, '«') !== count(p, '»')) problems.push('unbalanced-guillemets')
  if (count(p, '(') !== count(p, ')')) problems.push('unbalanced-parentheses')
  return problems
}

function count(s, ch) {
  let n = 0
  for (const c of s) if (c === ch) n++
  return n
}

// Passage-level checks on a list of verbatim paragraphs. Returns [] when acceptable.
export function passageProblems(paragraphs) {
  const problems = []
  const words = paragraphs.reduce((s, p) => s + countWords(p), 0)
  if (words < PASSAGE_MIN_WORDS || words > PASSAGE_MAX_WORDS) problems.push('length')
  for (const p of paragraphs) {
    for (const pr of paragraphProblems(p)) {
      if (!problems.includes(pr)) problems.push(pr)
    }
  }
  if (paragraphs.length && ANAPHORIC_START.test(paragraphs[0])) problems.push('anaphoric-start')
  const joined = paragraphs.join('\n\n')
  if (BACK_REFERENCE.test(joined)) problems.push('back-reference')
  const raw = joined.split(/\s+/).filter(Boolean)
  const withDigits = raw.filter((t) => /\d/.test(t)).length
  if (raw.length && withDigits / raw.length > 0.05) problems.push('too-many-numbers')
  const parens = count(joined, '(')
  if (words && (parens / words) * 100 > 3) problems.push('too-many-parentheses')
  return problems
}

// Selects up to MAX_PASSAGES_PER_ARTICLE non-overlapping passages, earliest first.
// Returns { passages: [{ text, paragraphs, words, firstParagraph, lastParagraph }], rejected: {reason: count}, paragraphCount, droppedLines }.
export function selectPassages(extract, { maxPassages = MAX_PASSAGES_PER_ARTICLE } = {}) {
  const { paragraphs, droppedLines } = cleanExtract(extract)
  const rejected = {}
  const bump = (r) => { rejected[r] = (rejected[r] || 0) + 1 }
  const passages = []
  let i = 0
  while (i < paragraphs.length && passages.length < maxPassages) {
    let found = null
    for (let start = i; start < paragraphs.length && !found; start++) {
      let words = 0
      let bestEnd = -1
      const reasons = new Set()
      for (let end = start; end < paragraphs.length; end++) {
        const pr = paragraphs.slice(start, end + 1)
        words = pr.reduce((s, p) => s + countWords(p), 0)
        if (words > PASSAGE_MAX_WORDS) break
        if (words >= PASSAGE_MIN_WORDS) {
          const problems = passageProblems(pr)
          if (problems.length === 0) bestEnd = end
          else problems.forEach((p) => reasons.add(p))
        }
      }
      if (bestEnd >= 0) {
        found = { start, end: bestEnd }
      } else if (reasons.size) {
        // Record only the first failing window per start paragraph to keep counts comparable.
        bump([...reasons][0])
      }
    }
    if (!found) break
    const pr = paragraphs.slice(found.start, found.end + 1)
    passages.push({
      text: pr.join('\n\n'),
      paragraphs: pr,
      words: pr.reduce((s, p) => s + countWords(p), 0),
      firstParagraph: found.start,
      lastParagraph: found.end,
    })
    i = found.end + 1
  }
  return { passages, rejected, paragraphCount: paragraphs.length, droppedLines }
}
