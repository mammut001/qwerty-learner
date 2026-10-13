import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { test } from 'node:test'
import {
  BillingError,
  billingConfig,
  createCheckoutSession,
  createPortalSession,
  entitlementFromSubscription,
  reduceBillingEvent,
  verifyStripeSignature,
} from './study-billing.mjs'

const SECRET = 'whsec_test_unit_secret_value'
const NOW = 1_800_000_000
const PAYLOAD = JSON.stringify({ id: 'evt_1', type: 'invoice.payment_failed', created: NOW })

function sign(payload, secret = SECRET, timestamp = NOW) {
  const digest = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex')
  return `t=${timestamp},v1=${digest}`
}

const CONFIG = {
  enabled: true,
  secretKey: 'sk_test_unit_secret_never_leak',
  webhookSecret: SECRET,
  priceId: 'price_test_pro',
  mode: 'test',
}

function fakeFetch(handler) {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, options })
    return handler(url, options)
  }
  return { fetchImpl, calls }
}

const jsonResponse = (status, data) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
})

test('billingConfig is disabled unless all three secrets are present', () => {
  assert.equal(billingConfig({}).enabled, false)
  assert.equal(billingConfig({ STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_WEBHOOK_SECRET: 'whsec_x' }).enabled, false)
  assert.equal(billingConfig({ STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_PRICE_ID: 'price_x' }).enabled, false)
  assert.equal(billingConfig({ STRIPE_WEBHOOK_SECRET: 'whsec_x', STRIPE_PRICE_ID: 'price_x' }).enabled, false)

  const config = billingConfig({
    STRIPE_SECRET_KEY: '  sk_test_abc  ',
    STRIPE_WEBHOOK_SECRET: 'whsec_abc',
    STRIPE_PRICE_ID: 'price_abc',
  })
  assert.equal(config.enabled, true)
  assert.equal(config.secretKey, 'sk_test_abc')
  assert.equal(config.webhookSecret, 'whsec_abc')
  assert.equal(config.priceId, 'price_abc')
  assert.equal(config.mode, 'test')
})

test('billingConfig reports live mode only for sk_live_ keys', () => {
  const live = billingConfig({ STRIPE_SECRET_KEY: 'sk_live_abc', STRIPE_WEBHOOK_SECRET: 'whsec_abc', STRIPE_PRICE_ID: 'price_abc' })
  assert.equal(live.mode, 'live')
  const none = billingConfig({})
  assert.equal(none.mode, 'test')
})

test('verifyStripeSignature accepts a valid signature over the raw body', () => {
  assert.equal(verifyStripeSignature({ payload: PAYLOAD, header: sign(PAYLOAD), secret: SECRET, now: NOW }), true)
  assert.equal(
    verifyStripeSignature({ payload: Buffer.from(PAYLOAD, 'utf8'), header: sign(PAYLOAD), secret: SECRET, now: NOW }),
    true,
  )
})

test('verifyStripeSignature rejects a wrong secret', () => {
  const header = sign(PAYLOAD, 'whsec_someone_else')
  assert.equal(verifyStripeSignature({ payload: PAYLOAD, header, secret: SECRET, now: NOW }), false)
})

test('verifyStripeSignature rejects a tampered body', () => {
  const header = sign(PAYLOAD)
  const tampered = PAYLOAD.replace('invoice.payment_failed', 'checkout.session.completed')
  assert.equal(verifyStripeSignature({ payload: tampered, header, secret: SECRET, now: NOW }), false)
  assert.equal(verifyStripeSignature({ payload: Buffer.concat([Buffer.from(PAYLOAD), Buffer.from(' ')]), header, secret: SECRET, now: NOW }), false)
})

test('verifyStripeSignature rejects stale and far-future timestamps', () => {
  const stale = sign(PAYLOAD, SECRET, NOW - 301)
  assert.equal(verifyStripeSignature({ payload: PAYLOAD, header: stale, secret: SECRET, now: NOW }), false)
  const justInside = sign(PAYLOAD, SECRET, NOW - 300)
  assert.equal(verifyStripeSignature({ payload: PAYLOAD, header: justInside, secret: SECRET, now: NOW }), true)
  const future = sign(PAYLOAD, SECRET, NOW + 400)
  assert.equal(verifyStripeSignature({ payload: PAYLOAD, header: future, secret: SECRET, now: NOW }), false)
  const wide = sign(PAYLOAD, SECRET, NOW - 3600)
  assert.equal(verifyStripeSignature({ payload: PAYLOAD, header: wide, secret: SECRET, now: NOW, toleranceSeconds: 3600 }), true)
})

test('verifyStripeSignature rejects malformed headers', () => {
  const digest = createHmac('sha256', SECRET).update(`${NOW}.${PAYLOAD}`).digest('hex')
  const malformed = [
    '',
    'garbage',
    `v1=${digest}`, // no timestamp
    `t=${NOW}`, // no signature
    `t=abc,v1=${digest}`, // non-numeric timestamp
    `t=${NOW},t=${NOW},v1=${digest}`, // duplicate timestamp
    `t=${NOW},v1=not-hex`,
    `t=${NOW},v1=${digest.slice(0, 40)}`, // truncated signature
    `t=${NOW},v0=${digest}`, // only an unsupported scheme
  ]
  for (const header of malformed) {
    assert.equal(verifyStripeSignature({ payload: PAYLOAD, header, secret: SECRET, now: NOW }), false, `accepted: ${header}`)
  }
  assert.equal(verifyStripeSignature({ payload: PAYLOAD, header: sign(PAYLOAD), secret: '', now: NOW }), false)
  assert.equal(verifyStripeSignature({ payload: undefined, header: sign(PAYLOAD), secret: SECRET, now: NOW }), false)
})

test('verifyStripeSignature accepts when any of several v1 values matches', () => {
  const good = createHmac('sha256', SECRET).update(`${NOW}.${PAYLOAD}`).digest('hex')
  const wrong = createHmac('sha256', 'whsec_rotated_out').update(`${NOW}.${PAYLOAD}`).digest('hex')
  assert.equal(verifyStripeSignature({ payload: PAYLOAD, header: `t=${NOW},v1=${wrong},v1=${good}`, secret: SECRET, now: NOW }), true)
  assert.equal(verifyStripeSignature({ payload: PAYLOAD, header: `t=${NOW},v1=${good},v1=${wrong}`, secret: SECRET, now: NOW }), true)
  assert.equal(verifyStripeSignature({ payload: PAYLOAD, header: `t=${NOW},v1=${wrong},v1=${wrong}`, secret: SECRET, now: NOW }), false)
})

test('createCheckoutSession posts form-encoded subscription params with pinned version and idempotency key', async () => {
  const { fetchImpl, calls } = fakeFetch(() =>
    jsonResponse(200, { id: 'cs_test_1', url: 'https://checkout.stripe.com/c/pay/cs_test_1' }),
  )
  const result = await createCheckoutSession({
    config: CONFIG,
    fetchImpl,
    accountId: 'acct_123',
    customerEmail: 'learner@example.test',
    successUrl: 'https://study.example.test/billing?status=success',
    cancelUrl: 'https://study.example.test/billing?status=cancel',
    idempotencyKey: 'idem-1',
  })
  assert.deepEqual(result, { id: 'cs_test_1', url: 'https://checkout.stripe.com/c/pay/cs_test_1' })

  assert.equal(calls.length, 1)
  const { url, options } = calls[0]
  assert.equal(url, 'https://api.stripe.com/v1/checkout/sessions')
  assert.equal(options.method, 'POST')
  assert.equal(options.headers.Authorization, `Bearer ${CONFIG.secretKey}`)
  assert.equal(options.headers['Stripe-Version'], '2024-06-20')
  assert.equal(options.headers['Idempotency-Key'], 'idem-1')
  assert.equal(options.headers['Content-Type'], 'application/x-www-form-urlencoded')

  const params = new URLSearchParams(options.body)
  assert.equal(params.get('mode'), 'subscription')
  assert.equal(params.get('line_items[0][price]'), 'price_test_pro')
  assert.equal(params.get('line_items[0][quantity]'), '1')
  assert.equal(params.get('client_reference_id'), 'acct_123')
  assert.equal(params.get('subscription_data[metadata][account_id]'), 'acct_123')
  assert.equal(params.get('allow_promotion_codes'), 'true')
  assert.equal(params.get('customer_email'), 'learner@example.test')
  assert.equal(params.get('customer'), null)
  assert.equal(params.get('success_url'), 'https://study.example.test/billing?status=success')
})

test('createCheckoutSession reuses an existing customer instead of sending an email', async () => {
  const { fetchImpl, calls } = fakeFetch(() =>
    jsonResponse(200, { id: 'cs_test_2', url: 'https://checkout.stripe.com/c/pay/cs_test_2' }),
  )
  await createCheckoutSession({
    config: CONFIG,
    fetchImpl,
    accountId: 'acct_9',
    customerId: 'cus_existing',
    customerEmail: 'ignored@example.test',
    successUrl: 'https://s.example.test/a',
    cancelUrl: 'https://s.example.test/b',
  })
  const params = new URLSearchParams(calls[0].options.body)
  assert.equal(params.get('customer'), 'cus_existing')
  assert.equal(params.get('customer_email'), null)
  assert.ok(calls[0].options.headers['Idempotency-Key'], 'a random idempotency key is always sent')
})

test('createCheckoutSession maps upstream and network failures without leaking the key or upstream body', async () => {
  const rejected = fakeFetch(() => jsonResponse(401, { error: { message: `Invalid API Key provided: ${CONFIG.secretKey}` } }))
  await assert.rejects(
    createCheckoutSession({ config: CONFIG, fetchImpl: rejected.fetchImpl, accountId: 'a', successUrl: 'https://x', cancelUrl: 'https://y' }),
    (error) => {
      assert.ok(error instanceof BillingError)
      assert.equal(error.code, 'BILLING_UPSTREAM_REJECTED')
      assert.ok(!error.message.includes('sk_test'))
      assert.ok(!JSON.stringify(error.details).includes('sk_test'))
      return true
    },
  )

  const failing = fakeFetch(() => jsonResponse(500, {}))
  await assert.rejects(
    createCheckoutSession({ config: CONFIG, fetchImpl: failing.fetchImpl, accountId: 'a', successUrl: 'https://x', cancelUrl: 'https://y' }),
    (error) => error instanceof BillingError && error.code === 'BILLING_UPSTREAM_FAILED',
  )

  const network = fakeFetch(() => {
    throw new Error(`socket hang up for ${CONFIG.secretKey}`)
  })
  await assert.rejects(
    createCheckoutSession({ config: CONFIG, fetchImpl: network.fetchImpl, accountId: 'a', successUrl: 'https://x', cancelUrl: 'https://y' }),
    (error) => {
      assert.equal(error.code, 'BILLING_UPSTREAM_FAILED')
      assert.ok(!error.message.includes('sk_test'))
      return true
    },
  )
})

test('createCheckoutSession refuses an unexpected redirect host and an unconfigured billing setup', async () => {
  const evil = fakeFetch(() => jsonResponse(200, { id: 'cs_x', url: 'https://evil.example.test/pay' }))
  await assert.rejects(
    createCheckoutSession({ config: CONFIG, fetchImpl: evil.fetchImpl, accountId: 'a', successUrl: 'https://x', cancelUrl: 'https://y' }),
    (error) => error.code === 'BILLING_UPSTREAM_FAILED',
  )
  const disabled = fakeFetch(() => jsonResponse(200, {}))
  await assert.rejects(
    createCheckoutSession({ config: { ...CONFIG, enabled: false }, fetchImpl: disabled.fetchImpl, accountId: 'a', successUrl: 'https://x', cancelUrl: 'https://y' }),
    (error) => error.code === 'BILLING_NOT_CONFIGURED',
  )
  assert.equal(disabled.calls.length, 0)
})

test('createPortalSession posts the customer and returns the portal URL', async () => {
  const { fetchImpl, calls } = fakeFetch(() => jsonResponse(200, { url: 'https://billing.stripe.com/p/session/test_1' }))
  const result = await createPortalSession({ config: CONFIG, fetchImpl, customerId: 'cus_1', returnUrl: 'https://s.example.test/billing' })
  assert.deepEqual(result, { url: 'https://billing.stripe.com/p/session/test_1' })
  assert.equal(calls[0].url, 'https://api.stripe.com/v1/billing_portal/sessions')
  const params = new URLSearchParams(calls[0].options.body)
  assert.equal(params.get('customer'), 'cus_1')
  assert.equal(params.get('return_url'), 'https://s.example.test/billing')

  await assert.rejects(
    createPortalSession({ config: CONFIG, fetchImpl, customerId: '', returnUrl: 'https://s.example.test/billing' }),
    (error) => error.code === 'BILLING_REQUEST_INVALID',
  )
})

test('entitlementFromSubscription treats only active and trialing as active', () => {
  const base = { current_period_end: 1_900_000_000, cancel_at_period_end: false, items: { data: [{ price: { id: 'price_test_pro' } }] } }
  for (const status of ['active', 'trialing']) {
    assert.equal(entitlementFromSubscription({ ...base, status }).active, true, status)
  }
  for (const status of ['past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused']) {
    assert.equal(entitlementFromSubscription({ ...base, status }).active, false, status)
  }

  assert.deepEqual(entitlementFromSubscription({ ...base, status: 'active', cancel_at_period_end: true }), {
    status: 'active',
    active: true,
    currentPeriodEnd: new Date(1_900_000_000 * 1000).toISOString(),
    cancelAtPeriodEnd: true,
    priceId: 'price_test_pro',
  })
})

test('entitlementFromSubscription reads the period end from subscription items when not on the top level', () => {
  const sub = {
    status: 'trialing',
    items: { data: [{ current_period_end: 1_900_000_500, price: { id: 'price_items' } }] },
  }
  const entitlement = entitlementFromSubscription(sub)
  assert.equal(entitlement.currentPeriodEnd, new Date(1_900_000_500 * 1000).toISOString())
  assert.equal(entitlement.priceId, 'price_items')
  assert.equal(entitlement.cancelAtPeriodEnd, false)
  assert.equal(entitlementFromSubscription(null), null)
  assert.equal(entitlementFromSubscription({ status: 'active' }).currentPeriodEnd, null)
})

test('reduceBillingEvent normalises the five supported event types', () => {
  const checkout = reduceBillingEvent({
    type: 'checkout.session.completed',
    created: 10,
    data: { object: { mode: 'subscription', client_reference_id: 'acct_1', customer: 'cus_1', subscription: 'sub_1' } },
  })
  assert.deepEqual(checkout, { kind: 'checkout_completed', accountId: 'acct_1', customerId: 'cus_1', subscriptionId: 'sub_1', created: 10 })

  const created = reduceBillingEvent({
    type: 'customer.subscription.created',
    created: 11,
    data: { object: { id: 'sub_1', customer: 'cus_1', status: 'active', metadata: { account_id: 'acct_1' }, current_period_end: 1_900_000_000 } },
  })
  assert.equal(created.kind, 'subscription_changed')
  assert.equal(created.deleted, false)
  assert.equal(created.accountId, 'acct_1')
  assert.equal(created.subscriptionId, 'sub_1')
  assert.equal(created.entitlement.active, true)

  const deleted = reduceBillingEvent({
    type: 'customer.subscription.deleted',
    created: 12,
    data: { object: { id: 'sub_1', customer: 'cus_1', status: 'canceled', metadata: {} } },
  })
  assert.equal(deleted.deleted, true)
  assert.equal(deleted.accountId, '')
  assert.equal(deleted.entitlement.active, false)

  const payment = reduceBillingEvent({
    type: 'invoice.payment_failed',
    created: 13,
    data: { object: { customer: 'cus_1', subscription: 'sub_1' } },
  })
  assert.deepEqual(payment, { kind: 'payment_failed', customerId: 'cus_1', subscriptionId: 'sub_1', created: 13 })
})

test('reduceBillingEvent ignores unrelated and non-subscription events', () => {
  assert.deepEqual(reduceBillingEvent({ type: 'charge.succeeded', created: 1, data: { object: {} } }), { kind: 'ignored' })
  assert.deepEqual(reduceBillingEvent({ type: 'customer.created', created: 1, data: { object: {} } }), { kind: 'ignored' })
  assert.deepEqual(
    reduceBillingEvent({ type: 'checkout.session.completed', created: 1, data: { object: { mode: 'payment' } } }),
    { kind: 'ignored' },
  )
  assert.deepEqual(reduceBillingEvent({}), { kind: 'ignored' })
})
