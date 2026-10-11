import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { ECHELLE_LEVELS } from './echelle-data.mjs'
import { SCENARIO_REGISTRY } from './echelle-variants/index.mjs'

describe('Échelle québécoise scenario registry alignment (levels 1–12)', () => {
  it('aligns every listening/reading indicator with SCENARIO_REGISTRY, covers situations 0 and 1, and contains no orphaned keys', () => {
    const registryKeys = new Set(Object.keys(SCENARIO_REGISTRY))
    const expectedKeys = new Set()
    let totalExpectedIndicators = 0

    for (let level = 1; level <= 12; level++) {
      const listeningInds = ECHELLE_LEVELS.listening.find((l) => l.level === level)?.indicators || []
      const readingInds = ECHELLE_LEVELS.reading.find((l) => l.level === level)?.indicators || []
      const levelTotal = listeningInds.length + readingInds.length

      assert.ok(listeningInds.length > 0, `Niveau ${level} has no listening indicators in ECHELLE_LEVELS`)
      assert.ok(readingInds.length > 0, `Niveau ${level} has no reading indicators in ECHELLE_LEVELS`)

      for (let i = 0; i < listeningInds.length; i++) {
        const itemId = `n${level}-listening-${i}`
        expectedKeys.add(itemId)
        const scenarios = SCENARIO_REGISTRY[itemId]
        assert.ok(scenarios && scenarios.length > 0, `Registry is missing scenarios for ${itemId}`)
        const situations = new Set(scenarios.map((s) => s.situation))
        assert.ok(situations.has(0), `${itemId} is missing situation 0`)
        assert.ok(situations.has(1), `${itemId} is missing situation 1`)
      }

      for (let i = 0; i < readingInds.length; i++) {
        const itemId = `n${level}-reading-${i}`
        expectedKeys.add(itemId)
        const scenarios = SCENARIO_REGISTRY[itemId]
        assert.ok(scenarios && scenarios.length > 0, `Registry is missing scenarios for ${itemId}`)
        const situations = new Set(scenarios.map((s) => s.situation))
        assert.ok(situations.has(0), `${itemId} is missing situation 0`)
        assert.ok(situations.has(1), `${itemId} is missing situation 1`)
      }

      totalExpectedIndicators += levelTotal
      console.log(
        `Niveau ${String(level).padStart(2, ' ')}: ${listeningInds.length} listening + ${readingInds.length} reading = ${levelTotal} indicators aligned (situations 0 & 1 present)`
      )
    }

    // Verify no registry key exists that does not correspond to an existing indicator
    for (const key of registryKeys) {
      assert.ok(expectedKeys.has(key), `Registry contains extra key not in ECHELLE_LEVELS: ${key}`)
    }

    // Verify the total count of indicators with scenarios equals the total number in ECHELLE_LEVELS
    assert.strictEqual(
      registryKeys.size,
      totalExpectedIndicators,
      `Registry size (${registryKeys.size}) does not match total indicators in ECHELLE_LEVELS (${totalExpectedIndicators})`
    )
    assert.strictEqual(registryKeys.size, expectedKeys.size)
  })
})
