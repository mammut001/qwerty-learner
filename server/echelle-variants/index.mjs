// Scenario registry for Échelle québécoise indicators across levels.
// Merges level-specific scenarios into a central registry.
// To add future level packs (e.g. n03-04.mjs), import and spread into SCENARIO_REGISTRY.

import { N01_02_SCENARIOS } from './n01-02.mjs'

export const SCENARIO_REGISTRY = {
  ...N01_02_SCENARIOS,
}

export function getIndicatorScenarios(itemId) {
  return SCENARIO_REGISTRY[itemId] || null
}
