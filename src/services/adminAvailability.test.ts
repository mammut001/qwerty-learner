import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  adminProbeEndpoint,
  mapStatusToAdminAvailability,
  resolveAdminAvailability,
} from './adminAvailability'
import type { AdminAvailability } from './adminAvailability'

test('HTTP 200 maps to available', () => {
  const result: AdminAvailability = resolveAdminAvailability(200)
  assert.equal(result, 'available')
  assert.equal(mapStatusToAdminAvailability(200), 'available')
})

test('HTTP 404 maps to hidden', () => {
  assert.equal(resolveAdminAvailability(404), 'hidden')
  assert.equal(mapStatusToAdminAvailability(404), 'hidden')
})

test('HTTP 401 maps to hidden', () => {
  assert.equal(resolveAdminAvailability(401), 'hidden')
  assert.equal(mapStatusToAdminAvailability(401), 'hidden')
})

test('HTTP 500 maps to hidden', () => {
  assert.equal(resolveAdminAvailability(500), 'hidden')
  assert.equal(mapStatusToAdminAvailability(500), 'hidden')
})

test('HTTP 503 maps to hidden', () => {
  assert.equal(resolveAdminAvailability(503), 'hidden')
  assert.equal(mapStatusToAdminAvailability(503), 'hidden')
})

test('thrown network error maps to hidden', () => {
  const networkError = new Error('Network request failed')
  assert.equal(resolveAdminAvailability(networkError), 'hidden')
  assert.equal(mapStatusToAdminAvailability(networkError), 'hidden')

  const fetchTypeError = new TypeError('Failed to fetch')
  assert.equal(resolveAdminAvailability(fetchTypeError), 'hidden')
  assert.equal(mapStatusToAdminAvailability(fetchTypeError), 'hidden')
})

test('other non-OK statuses and invalid inputs map to hidden', () => {
  assert.equal(resolveAdminAvailability(403), 'hidden')
  assert.equal(resolveAdminAvailability(502), 'hidden')
  assert.equal(resolveAdminAvailability(null), 'hidden')
  assert.equal(resolveAdminAvailability(undefined), 'hidden')
  assert.equal(resolveAdminAvailability('UNKNOWN_ERROR'), 'hidden')
})

test('admin permission probes use protected endpoints instead of the public config route', () => {
  assert.equal(adminProbeEndpoint('/admin'), '/api/study-plan/admin/placement-cohort')
  assert.equal(adminProbeEndpoint('/admin/placement'), '/api/study-plan/admin/placement-cohort')
  assert.equal(adminProbeEndpoint('/admin/users'), '/api/study-plan/admin/users?limit=1')
  assert.equal(adminProbeEndpoint('/admin/recalls'), '/api/study-plan/admin/recalls/summary')
})
