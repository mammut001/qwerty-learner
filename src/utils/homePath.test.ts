import assert from 'node:assert/strict'
import { test } from 'node:test'
import { resolveHomePath } from './homePath'
import type { AuthStatus } from '@/services/auth'

const mockUser = {
  id: 'usr_test',
  email: 'learner@example.com',
  name: 'Learner',
  picture: 'https://example.com/avatar.png',
}

test('query string -> /typing?...', () => {
  assert.equal(
    resolveHomePath({ search: '?dict=tcf-canada-foundation-01' }),
    '/typing?dict=tcf-canada-foundation-01',
  )
  assert.equal(
    resolveHomePath({ search: '?chapter=2&dict=tcf' }),
    '/typing?chapter=2&dict=tcf',
  )

  // Query string takes precedence even if user is signed in
  const signedInStatus: AuthStatus = {
    enabled: true,
    appleEnabled: false,
    required: true,
    signedIn: true,
    user: mockUser,
  }
  assert.equal(
    resolveHomePath({ search: '?dict=tcf-canada-foundation-01', authStatus: signedInStatus }),
    '/typing?dict=tcf-canada-foundation-01',
  )
})

test('signed-in -> /study-plan', () => {
  const signedInStatus: AuthStatus = {
    enabled: true,
    appleEnabled: false,
    required: true,
    signedIn: true,
    user: mockUser,
  }
  assert.equal(resolveHomePath({ authStatus: signedInStatus }), '/study-plan')
  assert.equal(resolveHomePath({ search: '', authStatus: signedInStatus }), '/study-plan')
})

test('sign-in not required -> /study-plan', () => {
  const disabledStatus: AuthStatus = {
    enabled: false,
    appleEnabled: false,
    required: false,
    signedIn: false,
    user: null,
  }
  assert.equal(resolveHomePath({ authStatus: disabledStatus }), '/study-plan')

  const optionalStatus: AuthStatus = {
    enabled: true,
    appleEnabled: false,
    required: false,
    signedIn: false,
    user: null,
  }
  assert.equal(resolveHomePath({ authStatus: optionalStatus }), '/study-plan')
})

test('guest by backend status -> /typing', () => {
  const guestStatus: AuthStatus = {
    enabled: true,
    appleEnabled: false,
    required: true,
    signedIn: false,
    user: null,
  }
  assert.equal(resolveHomePath({ authStatus: guestStatus }), '/typing')
})

test("status unknown + cached 'locked' -> /typing", () => {
  assert.equal(resolveHomePath({ authStatus: null, cachedStatus: 'locked' }), '/typing')
  assert.equal(resolveHomePath({ authStatus: null, cachedStatus: 'locked', guestMode: true }), '/typing')
  assert.equal(resolveHomePath({ cachedStatus: 'locked' }), '/typing')
})

test("status unknown + cached 'open' -> /study-plan", () => {
  assert.equal(resolveHomePath({ authStatus: null, cachedStatus: 'open' }), '/study-plan')
  assert.equal(resolveHomePath({ authStatus: null, cachedStatus: 'open', guestMode: false }), '/study-plan')
  assert.equal(resolveHomePath({ cachedStatus: 'open' }), '/study-plan')
})

test('status unknown + no cache -> /typing', () => {
  assert.equal(resolveHomePath({ authStatus: null, cachedStatus: null }), '/typing')
  assert.equal(resolveHomePath({ authStatus: null, cachedStatus: null, guestMode: false }), '/typing')
  assert.equal(resolveHomePath({ authStatus: null }), '/typing')
  assert.equal(resolveHomePath({}), '/typing')
  assert.equal(resolveHomePath(), '/typing')
})
