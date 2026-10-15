import assert from 'node:assert/strict'
import { test } from 'node:test'
import { trendCategoryLabel } from './trendLabels'

test('weekly buckets are labelled by their Monday, without shifting the day', () => {
  assert.equal(trendCategoryLabel('weekly', '2026-10-05'), '10/05 周')
  assert.equal(trendCategoryLabel('weekly', '2026-10-06'), '10/06 周')
  assert.equal(trendCategoryLabel('weekly', '2027-01-04'), '01/04 周')
})

test('daily buckets keep the calendar day they describe', () => {
  assert.equal(trendCategoryLabel('daily', '2026-10-09'), '10/09')
  assert.equal(trendCategoryLabel('daily', '2026-03-01'), '03/01')
})

test('monthly buckets show year and month', () => {
  assert.equal(trendCategoryLabel('monthly', '2026-10-01'), '2026-10')
  assert.equal(trendCategoryLabel('monthly', '2025-12-01'), '2025-12')
})
