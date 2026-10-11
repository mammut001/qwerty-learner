// Server entry point: eagerly registers all scenario variants for synchronous backend execution.
import * as core from './echelle-curriculum-core.mjs'
import { SCENARIO_REGISTRY as ALL_SCENARIOS } from './echelle-variants/index.mjs'

core.registerIndicatorScenarios(ALL_SCENARIOS)

export * from './echelle-curriculum-core.mjs'
