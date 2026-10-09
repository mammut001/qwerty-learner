import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createMemoryStorage,
  getCurrentProfile,
  isDeviceLevelKey,
  recordDbName,
  repairInterruptedSwitch,
  switchLocalProfile,
  tcfAudioDbName,
} from '../src/services/localProfile.ts'

test('device-level keys are identified correctly', () => {
  // Device keys
  assert.equal(isDeviceLevelKey('qfp:current'), true)
  assert.equal(isDeviceLevelKey('qfp:data:anon:foo'), true)
  assert.equal(isDeviceLevelKey('qwerty-fr-access-granted'), true)
  assert.equal(isDeviceLevelKey('qwerty-fr-auth-status-v1'), true)
  assert.equal(isDeviceLevelKey('isOpenDarkModeAtom'), true)
  assert.equal(isDeviceLevelKey('keySoundsConfig'), true)
  assert.equal(isDeviceLevelKey('hintSoundsConfig'), true)
  assert.equal(isDeviceLevelKey('pronunciation'), true)
  assert.equal(isDeviceLevelKey('fontsize'), true)
  assert.equal(isDeviceLevelKey('phoneticConfig'), true)
  assert.equal(isDeviceLevelKey('randomConfig'), true)
  assert.equal(isDeviceLevelKey('wordDictationConfig'), true)
  assert.equal(isDeviceLevelKey('isShowPrevAndNextWord'), true)
  assert.equal(isDeviceLevelKey('isIgnoreCase'), true)
  assert.equal(isDeviceLevelKey('isShowAnswerOnHover'), true)
  assert.equal(isDeviceLevelKey('isTextSelectable'), true)
  assert.equal(isDeviceLevelKey('hasSeenEnhancedPromotion'), true)
  assert.equal(isDeviceLevelKey('qwerty-fr-dictionary-online-fr-zh'), true)

  // User-scoped keys
  assert.equal(isDeviceLevelKey('qwerty-fr-study-plan-v1'), false)
  assert.equal(isDeviceLevelKey('qwerty-study-admin-token-v1'), false)
  assert.equal(isDeviceLevelKey('currentDict'), false)
  assert.equal(isDeviceLevelKey('currentChapter'), false)
  assert.equal(isDeviceLevelKey('reviewModeInfo'), false)
  assert.equal(isDeviceLevelKey('qwerty-fr-custom-dicts-v1'), false)
  assert.equal(isDeviceLevelKey('qwerty-fr-tcf-writing-draft-v1'), false)
})

test('keep vs swap and multi-user isolation cycle', () => {
  const storage = createMemoryStorage()

  // 1. Initial anonymous user data
  storage.setItem('qwerty-fr-access-granted', '1') // device
  storage.setItem('isOpenDarkModeAtom', 'true') // device
  storage.setItem('currentDict', 'dict-anon-1') // user-scoped
  storage.setItem('qwerty-fr-study-plan-v1', '{"plan":"anon"}') // user-scoped

  assert.equal(getCurrentProfile(storage), 'anon')

  // Alice signs in fresh -> mode 'keep'
  switchLocalProfile('acct:alice', 'keep', storage)
  assert.equal(getCurrentProfile(storage), 'acct:alice')

  // Alice sees the kept data in place
  assert.equal(storage.getItem('currentDict'), 'dict-anon-1')
  assert.equal(storage.getItem('qwerty-fr-study-plan-v1'), '{"plan":"anon"}')
  assert.equal(storage.getItem('isOpenDarkModeAtom'), 'true')

  // Alice updates her study plan and dict
  storage.setItem('currentDict', 'dict-alice-only')
  storage.setItem('qwerty-fr-study-plan-v1', '{"plan":"alice"}')

  // Alice logs out -> mode 'swap' to 'anon'
  switchLocalProfile('anon', 'swap', storage)
  assert.equal(getCurrentProfile(storage), 'anon')

  // Alice's user-scoped keys are gone from view
  assert.equal(storage.getItem('currentDict'), null)
  assert.equal(storage.getItem('qwerty-fr-study-plan-v1'), null)

  // Device-level keys remain untouched
  assert.equal(storage.getItem('qwerty-fr-access-granted'), '1')
  assert.equal(storage.getItem('isOpenDarkModeAtom'), 'true')

  // Bob signs in on this browser (empty anon) -> mode 'keep'
  switchLocalProfile('acct:bob', 'keep', storage)
  assert.equal(getCurrentProfile(storage), 'acct:bob')

  // Bob writes his own study plan
  storage.setItem('currentDict', 'dict-bob-only')
  storage.setItem('qwerty-fr-study-plan-v1', '{"plan":"bob"}')

  // Bob logs out -> mode 'swap' to 'anon'
  switchLocalProfile('anon', 'swap', storage)
  assert.equal(getCurrentProfile(storage), 'anon')
  assert.equal(storage.getItem('currentDict'), null)
  assert.equal(storage.getItem('qwerty-fr-study-plan-v1'), null)

  // Alice returns and signs in -> mode 'swap' to 'acct:alice'
  switchLocalProfile('acct:alice', 'swap', storage)
  assert.equal(getCurrentProfile(storage), 'acct:alice')

  // Alice sees exactly her keys and none of Bob's
  assert.equal(storage.getItem('currentDict'), 'dict-alice-only')
  assert.equal(storage.getItem('qwerty-fr-study-plan-v1'), '{"plan":"alice"}')
})

test('interrupted switch is repaired idempotently', () => {
  const storage = createMemoryStorage()

  storage.setItem('qfp:current', 'anon')
  storage.setItem('currentDict', 'anon-dict')
  storage.setItem('qwerty-fr-study-plan-v1', 'anon-plan')
  storage.setItem('qfp:data:acct:alice:currentDict', 'alice-dict')
  storage.setItem('qfp:data:acct:alice:qwerty-fr-study-plan-v1', 'alice-plan')

  // Simulate an interrupted swap where switching flag was written and halfway interrupted
  storage.setItem(
    'qfp:switching',
    JSON.stringify({ from: 'anon', to: 'acct:alice', phase: 'swap' }),
  )

  // Call repairInterruptedSwitch
  repairInterruptedSwitch(storage)

  // Transition to acct:alice completed
  assert.equal(getCurrentProfile(storage), 'acct:alice')
  assert.equal(storage.getItem('currentDict'), 'alice-dict')
  assert.equal(storage.getItem('qwerty-fr-study-plan-v1'), 'alice-plan')
  assert.equal(storage.getItem('qfp:switching'), null)

  // Anon's data was stashed safely
  assert.equal(storage.getItem('qfp:data:anon:currentDict'), 'anon-dict')
  assert.equal(storage.getItem('qfp:data:anon:qwerty-fr-study-plan-v1'), 'anon-plan')

  // Running repair again is completely idempotent
  repairInterruptedSwitch(storage)
  assert.equal(getCurrentProfile(storage), 'acct:alice')
  assert.equal(storage.getItem('currentDict'), 'alice-dict')
})

test('db-name mapping rules: legacy name reused once, fresh names afterwards, keep transfers mapping', () => {
  const storage = createMemoryStorage()

  // 1. Legacy install: no qfp:db:* mapping exists yet
  const legacyDb = recordDbName('anon', storage)
  assert.equal(legacyDb, 'RecordDB', 'First profile in legacy install reuses RecordDB')
  assert.equal(storage.getItem('qfp:db:anon'), 'RecordDB')

  // Legacy tcf audio db mapping
  const legacyAudioDb = tcfAudioDbName('anon', storage)
  assert.equal(legacyAudioDb, 'qwerty-tcf-eo-audio-db', 'First profile reuses legacy audio db name')
  assert.equal(storage.getItem('qfp:db:tcfAudio:anon'), 'qwerty-tcf-eo-audio-db')

  // 2. Keep mode transfers the mapping to the new profile
  switchLocalProfile('acct:alice', 'keep', storage)
  assert.equal(storage.getItem('qfp:db:acct:alice'), 'RecordDB')
  assert.equal(storage.getItem('qfp:db:anon'), null, 'anon mapping removed on keep')
  assert.equal(storage.getItem('qfp:db:tcfAudio:acct:alice'), 'qwerty-tcf-eo-audio-db')
  assert.equal(storage.getItem('qfp:db:tcfAudio:anon'), null)

  // 3. Alice logs out -> swap to anon
  switchLocalProfile('anon', 'swap', storage)

  // 4. Now anon needs a DB: existing mappings exist for acct:alice, so anon gets a fresh name
  const anonDb = recordDbName('anon', storage)
  assert.match(anonDb, /^RecordDB-[a-z0-9]+$/)
  assert.notEqual(anonDb, 'RecordDB')

  const anonAudioDb = tcfAudioDbName('anon', storage)
  assert.match(anonAudioDb, /^qwerty-tcf-eo-audio-db-[a-z0-9]+$/)
  assert.notEqual(anonAudioDb, 'qwerty-tcf-eo-audio-db')

  // 5. Bob signs in with keep -> transfers anon's fresh db mapping to Bob
  switchLocalProfile('acct:bob', 'keep', storage)
  assert.equal(storage.getItem('qfp:db:acct:bob'), anonDb)
  assert.equal(storage.getItem('qfp:db:anon'), null)

  // Alice's mapping was never touched by Bob
  assert.equal(recordDbName('acct:alice', storage), 'RecordDB')
})

class LimitedStorage {
  constructor(byteLimit) {
    this.map = new Map()
    this.limit = byteLimit
  }

  _currentSize() {
    let size = 0
    for (const [k, v] of this.map.entries()) {
      size += k.length + v.length
    }
    return size
  }

  getItem(key) {
    return this.map.get(key) ?? null
  }

  setItem(key, value) {
    const strVal = String(value)
    const existing = this.map.get(key)
    const currentSize = this._currentSize()
    const addedSize = (key.length + strVal.length) - (existing ? (key.length + existing.length) : 0)
    if (currentSize + addedSize > this.limit) {
      const err = new Error('QuotaExceededError')
      err.name = 'QuotaExceededError'
      throw err
    }
    this.map.set(key, strVal)
  }

  removeItem(key) {
    this.map.delete(key)
  }

  key(index) {
    const keys = Array.from(this.map.keys())
    return index >= 0 && index < keys.length ? keys[index] : null
  }

  get length() {
    return this.map.size
  }
}

test('storage fake quota limit: swap hitting limit never loses data', () => {
  const storage = new LimitedStorage(200)
  storage.setItem('qfp:current', 'anon')
  storage.setItem('dict', 'dict-v1')
  storage.setItem('plan', 'plan-content-123456789012345678901234567890')
  storage.setItem('stats', 'stats-val')

  const initialPlanVal = storage.getItem('plan')
  const initialDictVal = storage.getItem('dict')
  const initialStatsVal = storage.getItem('stats')

  // Set the limit strictly just above initial size so stashing larger keys fails
  storage.limit = storage._currentSize() + 15

  const result = switchLocalProfile('acct:bob', 'swap', storage)

  assert.equal(typeof result, 'object')
  assert.ok(Array.isArray(result.failedKeys))

  // No value is lost: every original value is still readable in place or in stash
  const planVal = storage.getItem('plan') || storage.getItem('qfp:data:anon:plan')
  const dictVal = storage.getItem('dict') || storage.getItem('qfp:data:anon:dict')
  const statsVal = storage.getItem('stats') || storage.getItem('qfp:data:anon:stats')

  assert.equal(planVal, initialPlanVal, 'plan was not lost')
  assert.equal(dictVal, initialDictVal, 'dict was not lost')
  assert.equal(statsVal, initialStatsVal, 'stats was not lost')
})

test('interruption during restore phase does not mix profiles upon recovery', () => {
  const storage = createMemoryStorage()

  // Setup mid-restore state manually:
  // Alice stashed all keys
  storage.setItem('qfp:current', 'acct:alice')
  storage.setItem('qfp:data:acct:alice:plan', 'alice-plan')
  storage.setItem('qfp:data:acct:alice:dict', 'alice-dict')

  // Bob was partially restored: 'plan' already restored to root, 'dict' still in stash
  storage.setItem('plan', 'bob-plan')
  storage.setItem('qfp:data:acct:bob:dict', 'bob-dict')

  // Switching state recorded in 'restore' phase
  storage.setItem(
    'qfp:switching',
    JSON.stringify({ from: 'acct:alice', to: 'acct:bob', phase: 'restore' }),
  )

  // Repair
  const repairResult = repairInterruptedSwitch(storage)
  assert.equal(repairResult.switched, true)
  assert.equal(repairResult.failedKeys.length, 0)

  // Alice's data must NOT have received Bob's 'bob-plan'
  assert.equal(storage.getItem('qfp:data:acct:alice:plan'), 'alice-plan')
  assert.equal(storage.getItem('qfp:data:acct:alice:dict'), 'alice-dict')

  // Bob's data must now be fully in root
  assert.equal(storage.getItem('plan'), 'bob-plan')
  assert.equal(storage.getItem('dict'), 'bob-dict')
  assert.equal(storage.getItem('qfp:data:acct:bob:dict'), null)

  // Active profile is bob
  assert.equal(getCurrentProfile(storage), 'acct:bob')
  assert.equal(storage.getItem('qfp:switching'), null)
})

test('repair is idempotent when run twice and never overwrites existing non-empty stash', () => {
  const storage = createMemoryStorage()

  storage.setItem('qfp:current', 'acct:alice')
  storage.setItem('plan', 'new-plan-in-root')
  storage.setItem('qfp:data:acct:alice:plan', 'original-stashed-plan')
  storage.setItem('qfp:data:acct:bob:dict', 'bob-dict')

  storage.setItem(
    'qfp:switching',
    JSON.stringify({ from: 'acct:alice', to: 'acct:bob', phase: 'stash' }),
  )

  // First repair run
  const res1 = repairInterruptedSwitch(storage)
  assert.equal(storage.getItem('qfp:data:acct:alice:plan'), 'original-stashed-plan')
  assert.equal(storage.getItem('dict'), 'bob-dict')
  assert.equal(getCurrentProfile(storage), 'acct:bob')
  assert.equal(storage.getItem('qfp:switching'), null)

  // Second repair run (idempotent)
  const res2 = repairInterruptedSwitch(storage)
  assert.equal(res2.switched, true)
  assert.equal(res2.failedKeys.length, 0)
  assert.equal(storage.getItem('qfp:data:acct:alice:plan'), 'original-stashed-plan')
  assert.equal(storage.getItem('dict'), 'bob-dict')
  assert.equal(getCurrentProfile(storage), 'acct:bob')
  assert.equal(storage.getItem('qfp:switching'), null)
})

