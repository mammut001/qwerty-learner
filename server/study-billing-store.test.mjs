import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'
import { reduceBillingEvent } from './study-billing.mjs'
import {
  STUDY_SCHEMA_VERSION,
  applyNodeBillingEvent,
  deleteNodeLearnerData,
  ensureNodeFeatureSchema,
  getNodeBilling,
  getNodeSchemaVersion,
} from './study-node-features.mjs'

function withDb(run) {
  const dir = mkdtempSync(join(tmpdir(), 'study-billing-store-'))
  const db = new DatabaseSync(join(dir, 'study.sqlite'))
  try {
    // Base tables normally created by createStudyServer before the feature schema runs.
    db.exec(`CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, state TEXT);
      CREATE TABLE IF NOT EXISTS mutations (learner TEXT, id TEXT, payload TEXT NOT NULL, PRIMARY KEY(learner,id));
      CREATE TABLE IF NOT EXISTS sync_keys (key_hash TEXT PRIMARY KEY, learner TEXT NOT NULL, created INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0);`)
    ensureNodeFeatureSchema(db)
    run(db)
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
}

function seedAccount(db, { accountId = 'acct_1', learner = 'learner_1' } = {}) {
  db.prepare('INSERT INTO learners(id,state) VALUES(?,NULL)').run(learner)
  db.prepare('INSERT INTO accounts(id,learner,user_handle,created_at) VALUES(?,?,?,?)').run(accountId, learner, `handle_${accountId}`, 1)
}

// Applies one Stripe event the way the route does: verified event -> reducer -> single transaction.
function deliver(db, event, nowMs = 1_000_000) {
  const action = reduceBillingEvent(event)
  db.exec('BEGIN IMMEDIATE')
  try {
    const outcome = applyNodeBillingEvent(db, { eventId: event.id, eventType: event.type, action, nowMs })
    db.exec('COMMIT')
    return outcome
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

const subEvent = (id, type, created, status, extra = {}) => ({
  id,
  type,
  created,
  data: {
    object: {
      id: 'sub_1',
      customer: 'cus_1',
      status,
      cancel_at_period_end: false,
      current_period_end: 1_900_000_000,
      items: { data: [{ price: { id: 'price_test_pro' } }] },
      metadata: { account_id: 'acct_1' },
      ...extra,
    },
  },
})

test('schema v11 creates the billing tables and migrates an existing v10 database forward', () => {
  assert.equal(STUDY_SCHEMA_VERSION, 12)
  withDb((db) => {
    seedAccount(db)
    db.exec('DROP TABLE billing_events; DROP TABLE billing_subscriptions;')
    db.prepare("UPDATE schema_meta SET value='10' WHERE key='schema_version'").run()
    db.prepare('INSERT INTO error_book(learner,item_id,kind,source_id,label,context,error_count,correct_streak,mastered,last_attempt_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
      .run('learner_1', 'i1', 'vocabulary', 's1', 'label', 'ctx', 1, 0, 0, 1, 1)

    ensureNodeFeatureSchema(db)

    assert.equal(getNodeSchemaVersion(db), 12)
    const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name))
    assert.ok(tables.has('billing_subscriptions'))
    assert.ok(tables.has('billing_events'))
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM error_book').get().n, 1, 'existing rows survive the forward migration')
  })
})

test('a database newer than this server is still refused', () => {
  withDb((db) => {
    db.prepare("UPDATE schema_meta SET value='13' WHERE key='schema_version'").run()
    assert.throws(() => ensureNodeFeatureSchema(db), /newer than server v12/)
  })
})

test('checkout completion links the account to its Stripe customer without granting access', () => {
  withDb((db) => {
    seedAccount(db)
    const outcome = deliver(db, {
      id: 'evt_checkout',
      type: 'checkout.session.completed',
      created: 100,
      data: { object: { mode: 'subscription', client_reference_id: 'acct_1', customer: 'cus_1', subscription: 'sub_1' } },
    })
    assert.equal(outcome, 'applied')
    const billing = getNodeBilling(db, 'acct_1')
    assert.equal(billing.customerId, 'cus_1')
    assert.equal(billing.subscriptionId, 'sub_1')
    assert.equal(billing.entitlement.active, false)
  })
})

test('a replayed event id is a no-op', () => {
  withDb((db) => {
    seedAccount(db)
    const created = subEvent('evt_created', 'customer.subscription.created', 200, 'active')
    assert.equal(deliver(db, created), 'applied')
    assert.equal(getNodeBilling(db, 'acct_1').entitlement.active, true)

    // Same id again with a different body must not change anything.
    const replay = subEvent('evt_created', 'customer.subscription.created', 300, 'canceled')
    assert.equal(deliver(db, replay), 'duplicate')
    assert.equal(getNodeBilling(db, 'acct_1').entitlement.status, 'active')
  })
})

test('an older event never overwrites newer subscription state', () => {
  withDb((db) => {
    seedAccount(db)
    assert.equal(deliver(db, subEvent('evt_newer', 'customer.subscription.updated', 500, 'active')), 'applied')
    // Delivered late: an older "canceled" state from before the renewal.
    assert.equal(deliver(db, subEvent('evt_older', 'customer.subscription.deleted', 400, 'canceled')), 'stale')
    const billing = getNodeBilling(db, 'acct_1')
    assert.equal(billing.entitlement.status, 'active')
    assert.equal(billing.entitlement.active, true)

    // Equal timestamps apply, so a later update at the same second is not lost.
    assert.equal(deliver(db, subEvent('evt_same_second', 'customer.subscription.updated', 500, 'past_due')), 'applied')
    assert.equal(getNodeBilling(db, 'acct_1').entitlement.status, 'past_due')
  })
})

test('payment failure moves only an entitled subscription to past_due, which is not active', () => {
  withDb((db) => {
    seedAccount(db)
    // No subscription yet: nothing to mark.
    assert.equal(
      deliver(db, { id: 'evt_fail_early', type: 'invoice.payment_failed', created: 10, data: { object: { customer: 'cus_1', subscription: 'sub_1' } } }),
      'unmatched',
    )
    deliver(db, subEvent('evt_active', 'customer.subscription.created', 20, 'active'))
    assert.equal(
      deliver(db, { id: 'evt_fail', type: 'invoice.payment_failed', created: 30, data: { object: { customer: 'cus_1', subscription: 'sub_1' } } }),
      'applied',
    )
    const billing = getNodeBilling(db, 'acct_1')
    assert.equal(billing.entitlement.status, 'past_due')
    assert.equal(billing.entitlement.active, false)

    // A canceled subscription is not moved back to past_due by a late payment failure.
    deliver(db, subEvent('evt_canceled', 'customer.subscription.deleted', 40, 'canceled'))
    assert.equal(
      deliver(db, { id: 'evt_fail_late', type: 'invoice.payment_failed', created: 50, data: { object: { customer: 'cus_1', subscription: 'sub_1' } } }),
      'ignored',
    )
    assert.equal(getNodeBilling(db, 'acct_1').entitlement.status, 'canceled')
  })
})

test('events for an unknown account or unrelated type are recorded and do nothing else', () => {
  withDb((db) => {
    seedAccount(db)
    assert.equal(
      deliver(db, subEvent('evt_orphan', 'customer.subscription.created', 10, 'active', { metadata: { account_id: 'acct_missing' } })),
      'unmatched',
    )
    assert.equal(getNodeBilling(db, 'acct_missing'), null)
    assert.equal(deliver(db, { id: 'evt_charge', type: 'charge.succeeded', created: 11, data: { object: {} } }), 'ignored')
    const recorded = db.prepare('SELECT COUNT(*) AS n FROM billing_events').get().n
    assert.equal(recorded, 2)
  })
})

test('a subscription event can find its account through the stored customer id', () => {
  withDb((db) => {
    seedAccount(db)
    deliver(db, subEvent('evt_first', 'customer.subscription.created', 10, 'active'))
    const withoutMetadata = subEvent('evt_second', 'customer.subscription.updated', 20, 'canceled', { metadata: {} })
    assert.equal(deliver(db, withoutMetadata), 'applied')
    assert.equal(getNodeBilling(db, 'acct_1').entitlement.status, 'canceled')
  })
})

test('deleting account data removes its billing row', () => {
  withDb((db) => {
    seedAccount(db)
    deliver(db, subEvent('evt_del', 'customer.subscription.created', 10, 'active'))
    assert.ok(getNodeBilling(db, 'acct_1'))
    deleteNodeLearnerData(db, 'learner_1')
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM billing_subscriptions WHERE account_id=?').get('acct_1').n, 0)
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM accounts WHERE id=?').get('acct_1').n, 0)
  })
})
