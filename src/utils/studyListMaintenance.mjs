// Decisions for study-list Chinese gaps, custom-list supplements, and versioned practice-list URLs.
// Dump parsing and network calls stay outside this module.

const CHINESE = /[\u3400-\u9fff]/u

export function hasChineseText(text) {
  return typeof text === 'string' && CHINESE.test(text)
}

/** Apostrophe variants of one headword. Accents stay, so fermé is not ferme. */
export function foldApostrophe(word) {
  return String(word ?? '')
    .normalize('NFC')
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function isCompoundHeadword(word) {
  return (
    foldApostrophe(word)
      .split(/[\s-]+/)
      .filter((part) => part.length > 1).length > 1
  )
}

export function partGlossOnly(headword, gloss, partGlosses = []) {
  if (!isCompoundHeadword(headword)) return false
  const cleaned = String(gloss ?? '').trim()
  return partGlosses.some((item) => String(item ?? '').trim() === cleaned)
}

/** Article-stripped token is the lemma, or its regular plural (`maisons` → `maison`). */
function articleNounMatchesLemma(noun, source) {
  if (!noun || noun === source) return noun === source && noun.length > 0
  if (/[\s-]/.test(noun) || !noun.startsWith(source)) return false
  const ending = noun.slice(source.length)
  return ending === 's' || ending === 'x'
}

/** A compound lookup may supply Chinese only for that whole headword.
 *  A leading article may use the noun, including the lemma of a plural (`les maisons` → `maison`).
 */
export function supplementSourceAllowed(headword, sourceWord) {
  const head = foldApostrophe(headword).toLocaleLowerCase('fr')
  const source = foldApostrophe(sourceWord).toLocaleLowerCase('fr')
  if (!isCompoundHeadword(headword) || head === source) return true
  const noun = head.replace(/^(?:le|la|les|un|une|des) /u, '')
  if (noun === head) return false
  return articleNounMatchesLemma(noun, source)
}

/**
 * Keep a direct Chinese gloss for this part of speech.
 * A mismatched example is dropped. A compound is not stored as only a component's gloss.
 */
export function acceptDirectGloss({ headword, pos, glosses = [], partGlosses = [], example, examplePos } = {}) {
  if (!headword || !pos || pos === 'unknown') return null
  const zh = []
  for (const gloss of glosses) {
    if (!hasChineseText(gloss)) continue
    const text = gloss.replace(/\s+/g, ' ').trim()
    if (!text || partGlossOnly(headword, text, partGlosses) || zh.includes(text)) continue
    zh.push(text)
  }
  if (!zh.length) return null
  const keptExample = typeof example === 'string' && example.trim() && (!examplePos || examplePos === pos) ? example.trim() : undefined
  return { pos, zh, example: keptExample }
}

/** Fill an empty part-of-speech row. An existing Chinese array is returned unchanged. */
export function applyDirectChinese(rows, candidate) {
  if (!candidate?.zh?.length) return { rows, changed: false }
  const index = rows.findIndex((row) => row[0] === candidate.pos)
  if (index === -1) return { rows, changed: false }
  if ((rows[index][4] ?? []).length) return { rows, changed: false }
  const next = rows.map((row, rowIndex) => (rowIndex === index ? [row[0], row[1], row[2], row[3], candidate.zh.slice()] : row))
  return { rows: next, changed: true }
}

export function directGlossFromTwin(word, pos, variants = []) {
  const folded = foldApostrophe(word)
  const exact = word.normalize('NFC')
  const glosses = []
  for (const variant of variants) {
    if (!variant?.word || foldApostrophe(variant.word) !== folded || variant.word.normalize('NFC') === exact) continue
    for (const row of variant.rows ?? []) {
      if (row[0] !== pos) continue
      for (const gloss of row[4] ?? []) {
        if (hasChineseText(gloss) && !glosses.includes(gloss)) glosses.push(gloss)
      }
    }
  }
  return glosses
}

export function fillMissingPosFromTwins(word, rows, variants = [], partGlosses = []) {
  let current = rows
  const filledPos = []
  for (const row of rows) {
    if ((row[4] ?? []).some(hasChineseText)) continue
    const accepted = acceptDirectGloss({
      headword: word,
      pos: row[0],
      glosses: directGlossFromTwin(word, row[0], variants),
      partGlosses,
    })
    const result = applyDirectChinese(current, accepted)
    if (result.changed) {
      current = result.rows
      filledPos.push(row[0])
    }
  }
  return { rows: current, filledPos }
}

/** One stored gloss list per part of speech. Each example stays with its own sense. */
export function assignSenseGlosses(headword, senses, partGlosses = []) {
  const byPos = new Map()
  for (const sense of senses ?? []) {
    const accepted = acceptDirectGloss({
      headword,
      pos: sense.pos,
      glosses: sense.glosses,
      partGlosses,
      example: sense.example,
      examplePos: sense.examplePos,
    })
    if (!accepted) continue
    const current = byPos.get(accepted.pos) ?? { pos: accepted.pos, zh: [], example: undefined }
    for (const gloss of accepted.zh) if (!current.zh.includes(gloss)) current.zh.push(gloss)
    if (accepted.example && !current.example) current.example = accepted.example
    byPos.set(accepted.pos, current)
  }
  return [...byPos.values()]
}

export function countMissingPracticeChinese(words) {
  const seen = new Set()
  let missing = 0
  for (const word of words ?? []) {
    if (!word?.name || seen.has(word.name)) continue
    seen.add(word.name)
    if (!(word.trans ?? []).some(hasChineseText)) missing += 1
  }
  return { headwords: seen.size, missing }
}

const rowLacksChinese = (row) => !(row[4] ?? []).some(hasChineseText)

/** Headwords that still have a part of speech without Chinese, before and after direct fills. */
export function summarizeGapFill(items) {
  let before = 0
  let after = 0
  const remainders = []
  const filled = []
  for (const item of items) {
    if (!item.rows.some(rowLacksChinese)) continue
    before += 1
    const result = fillMissingPosFromTwins(item.word, item.rows, item.variants ?? [], item.partGlosses ?? [])
    if (result.rows.some(rowLacksChinese)) {
      after += 1
      remainders.push({
        word: item.word,
        pos: result.rows.filter(rowLacksChinese).map((row) => row[0]),
      })
    }
    if (result.filledPos.length) filled.push({ word: item.word, pos: result.filledPos, rows: result.rows })
  }
  return { before, after, remainders, filled }
}

export function lacksCustomMeaning(name, trans) {
  const normalized = String(name ?? '')
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase('fr')
  return (trans ?? []).every((item) => {
    const text = String(item ?? '')
      .normalize('NFC')
      .trim()
    return !text || text.toLocaleLowerCase('fr') === normalized
  })
}

/** Empty-only batch fill. A line that already has a note or gloss is returned unchanged. */
export function emptyOnlyLine(line, name, trans, chinese) {
  if (!lacksCustomMeaning(name, trans)) return line
  const meaning = String(chinese ?? '').trim()
  if (!meaning) return line
  return `${name} = ${meaning}`
}

export function previewChineseSupplement(name, trans, chinese, maxLength = 300) {
  if (lacksCustomMeaning(name, trans)) return null
  const extra = String(chinese ?? '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!hasChineseText(extra)) return null
  const existing = (trans ?? [])
    .map((item) => String(item).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('；')
  if (!existing || existing.includes(extra)) return null
  const meaning = `${existing}；${extra}`
  if (meaning.length > maxLength) return null
  return { name, existing, chinese: extra, next: `${name} = ${meaning}` }
}

/** Chinese is written only when the preview is accepted, and the original note stays in the line. */
export function applyChineseSupplement(preview, accepted) {
  if (!accepted || !preview?.next || !preview.existing || !preview.next.includes(preview.existing)) return null
  return preview.next
}

export function practiceListUrl(url, buildToken, prefix = '') {
  if (typeof url !== 'string' || url.startsWith('custom:')) return url
  const cleanPath = url.replace(/^\.\//, '').replace(/^\//, '')
  const cut = cleanPath.indexOf('?')
  const path = cut === -1 ? cleanPath : cleanPath.slice(0, cut)
  const params = new URLSearchParams(cut === -1 ? '' : cleanPath.slice(cut + 1))
  params.set('v', buildToken)
  return `${prefix}/${path}?${params.toString().replace(/\+/g, '%20')}`
}

export function lexiconShardUrl(name, buildToken, prefix = '') {
  return `${prefix}/lexicon/fr/${name}.json?v=${encodeURIComponent(buildToken)}`
}
