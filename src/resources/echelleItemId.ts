import * as raw from '../../server/echelle-item-id.mjs'

export type EchelleItemSkill = 'listening' | 'reading' | 'writing' | 'speaking' | 'lex' | 'gr'

export const ECHELLE_ITEM_ID_REGEX = raw.ECHELLE_ITEM_ID_REGEX as RegExp

export const parseEchelleItemId = raw.parseEchelleItemId as (
  itemId: string,
) => { level: number; skill: EchelleItemSkill } | null
