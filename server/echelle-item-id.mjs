// Item ID regex used server-side for validation.
export const ECHELLE_ITEM_ID_REGEX = /^n(\d{1,2})-(listening|reading|writing|speaking|lex|gr)-[a-z0-9-]{1,60}$/

export function parseEchelleItemId(itemId) {
  if (typeof itemId !== 'string') return null
  const m = itemId.match(ECHELLE_ITEM_ID_REGEX)
  if (!m) return null
  return { level: Number(m[1]), skill: m[2] }
}
