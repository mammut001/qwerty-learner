import { ECHELLE_LEVELS as RAW_LEVELS } from '../../server/echelle-data.mjs'
import type { EchelleLevel, EchelleSkill } from './echelleQuebecoise'

export const ECHELLE_LEVELS = RAW_LEVELS as Record<EchelleSkill, EchelleLevel[]>
