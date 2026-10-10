// Scenario registry for Échelle québécoise indicators across levels.
// Merges level-specific scenarios into a central registry.

import { N01_02_SCENARIOS } from './n01-02.mjs'
import { N03_04_SCENARIOS } from './n03-04.mjs'
import { N05_06_SCENARIOS } from './n05-06.mjs'
import { N07_08_SCENARIOS } from './n07-08.mjs'
import { N09_10_SCENARIOS } from './n09-10.mjs'
import { N11_12_SCENARIOS } from './n11-12.mjs'

export const SCENARIO_REGISTRY = {
  ...N01_02_SCENARIOS,
  ...N03_04_SCENARIOS,
  ...N05_06_SCENARIOS,
  ...N07_08_SCENARIOS,
  ...N09_10_SCENARIOS,
  ...N11_12_SCENARIOS,
}

export function getIndicatorScenarios(itemId) {
  return SCENARIO_REGISTRY[itemId] || null
}
