import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { studyPolicy } from './study-http.mjs'
import { createStudyServer } from './study-plan.mjs'

const ORIGIN = 'http://localhost:5173'
const SECRET_KEY = 'sk_test_api_secret_must_never_leak'
const WEBHOOK_SECRET = 'whsec_api_secret_must_never_leak'
const BILLING_ON = {
  enabled: true,
  secretKey: SECRET_KEY,
  webhookSecret: WEBHOOK_SECRET,
  priceId: 'price_test_pro',
  mode: 'test',
}
const BILLING_OFF = { enabled: false, secretKey: '', webhookSecret: '', priceId: '', mode: 'test' }

function createMockVerifier() {
  const users = { 'token-alice': { uid: 'uid-alice', email: 'alice@example.test', name: 'Alice', picture: '' } }
  return {
    async verify(token) {
      const user = users[token]
      if (!user) throw new Error('FIREBASE_TOKEN_INVALID')
      return { ...user }
    },
  }
}

// Fake Stripe: records every call and answers the two REST endpoints the server uses. No network.
function fakeStripe() {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, options, params: new URLSearchParams(options.body || '') })
    if (url.endsWith('/v1/checkout/sessions')) {
      return { ok: true, status: 200, json: async () => ({ id: 'cs_test_api', url: 'https://checkout.stripe.com/c/pay/cs_test_api' }) }
    }
    if (url.endsWith('/v1/billing_portal/sessions')) {
      return { ok: true, status: 200, json: async () => ({ url: 'https://billing.stripe.com/p/session/test_api' }) }
    }
    return { ok: false, status: 404, json: async () => ({}) }
  }
  return { calls, fetchImpl }
}

function signedWebhook(event, { secret = WEBHOOK_SECRET, timestamp = Math.floor(Date.now() / 1000) } = {}) {
  const payload = JSON.stringify(event)
  const digest = createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex')
  return { payload, header: `t=${timestamp},v1=${digest}` }
}

const subscriptionEvent = (id, type, created, { accountId = '', status = 'active' } = {}) => ({
  id,
  object: 'event',
  type,
  created,
  data: {
    object: {
      id: 'sub_test_1',
      object: 'subscription',
      customer: 'cus_test_1',
      status,
      cancel_at_period_end: false,
      current_period_end: created + 2_592_000,
      items: { data: [{ price: { id: 'price_test_pro' } }] },
      metadata: accountId ? { account_id: accountId } : {},
    },
  },
})

async function withServer(options, run) {
  const dir = mkdtempSync(join(tmpdir(), 'study-billing-api-'))
  const server = createStudyServer({
    database: join(dir, 'study.sqlite'),
    origin: ORIGIN,
    slowRequestMs: 0,
    firebaseVerifier: createMockVerifier(),
    ...options,
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  // Every response body and header is kept so tests can prove the secrets never reach a client.
  const transcript = []

  const call = async (method, path, { body, cookie = '', origin = ORIGIN, contentType, headers = {} } = {}) => {
    const requestHeaders = { ...headers }
    if (origin) requestHeaders.Origin = origin
    if (cookie) requestHeaders.Cookie = cookie
    let payload
    if (body !== undefined) {
      payload = typeof body === 'string' ? body : JSON.stringify(body)
      requestHeaders['Content-Type'] = contentType || 'application/json'
    }
    const response = await fetch(base + path, { method, headers: requestHeaders, body: payload })
    const text = await response.text()
    transcript.push(text, JSON.stringify([...response.headers.entries()]))
    let data = null
    try {
      data = JSON.parse(text)
    } catch {}
    const setCookie = response.headers.get('set-cookie') || ''
    return { status: response.status, data, text, headers: response.headers, cookie: setCookie.split(';')[0] }
  }

  const signIn = async () => {
    const res = await call('POST', '/api/study-plan/auth/firebase', { body: { idToken: 'token-alice' } })
    assert.equal(res.status, 200)
    assert.ok(res.cookie.startsWith('study_session='))
    return res.cookie
  }

  const postWebhook = (event, signing = {}, extra = {}) => {
    const signed = signedWebhook(event, signing)
    return call('POST', '/api/study-plan/billing/webhook', {
      origin: null,
      body: signed.payload,
      contentType: 'application/json',
      headers: { 'Stripe-Signature': signing.header ?? signed.header, ...(extra.headers || {}) },
    })
  }

  try {
    await run({ call, signIn, postWebhook, transcript })
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
}

test('billing is disabled and invisible when Stripe is not configured', async () => {
  const stripe = fakeStripe()
  await withServer({ billing: BILLING_OFF, billingFetchImpl: stripe.fetchImpl }, async ({ call, signIn }) => {
    const status = await call('GET', '/api/study-plan/billing')
    assert.equal(status.status, 200)
    assert.deepEqual(status.data, { enabled: false, mode: 'test', entitlement: null })

    const cookie = await signIn()
    const checkout = await call('POST', '/api/study-plan/billing/checkout', { body: {}, cookie })
    assert.equal(checkout.status, 503)
    assert.equal(checkout.data.code, 'BILLING_NOT_CONFIGURED')

    const portal = await call('POST', '/api/study-plan/billing/portal', { body: {}, cookie })
    assert.equal(portal.status, 503)
    assert.equal(portal.data.code, 'BILLING_NOT_CONFIGURED')

    const webhook = await call('POST', '/api/study-plan/billing/webhook', { origin: null, body: '{}', contentType: 'application/json' })
    assert.equal(webhook.status, 503)
    assert.equal(webhook.data.code, 'BILLING_NOT_CONFIGURED')
  })
  assert.equal(stripe.calls.length, 0, 'no Stripe call when billing is disabled')
})

test('checkout requires a signed-in account, not an anonymous learner', async () => {
  const stripe = fakeStripe()
  await withServer({ billing: BILLING_ON, billingFetchImpl: stripe.fetchImpl }, async ({ call }) => {
    const anonymous = await call('POST', '/api/study-plan/billing/checkout', { body: {} })
    assert.equal(anonymous.status, 401)
    assert.equal(anonymous.data.code, 'LOGIN_REQUIRED')

    // An anonymous learner with a plan session is still not an account.
    const plan = await call('GET', '/api/study-plan')
    const learnerCookie = plan.cookie
    const withPlan = await call('POST', '/api/study-plan/billing/checkout', { body: {}, cookie: learnerCookie })
    assert.equal(withPlan.status, 401)
    assert.equal(withPlan.data.code, 'LOGIN_REQUIRED')

    const status = await call('GET', '/api/study-plan/billing', { cookie: learnerCookie })
    assert.deepEqual(status.data, { enabled: true, mode: 'test', entitlement: null })
  })
  assert.equal(stripe.calls.length, 0)
})

test('signed-in checkout returns the URL from Stripe with the configured return URLs only', async () => {
  const stripe = fakeStripe()
  await withServer({ billing: BILLING_ON, billingFetchImpl: stripe.fetchImpl }, async ({ call, signIn }) => {
    const cookie = await signIn()
    const status = await call('GET', '/api/study-plan/billing', { cookie })
    assert.equal(status.data.enabled, true)
    assert.equal(status.data.entitlement.active, false)
    assert.equal(status.data.entitlement.status, 'none')

    // Request input cannot steer the return URLs: extra keys are rejected and the Origin header is only an allow-list check.
    const injected = await call('POST', '/api/study-plan/billing/checkout', {
      body: { successUrl: 'https://evil.example.test/win', cancelUrl: 'https://evil.example.test/lose' },
      cookie,
    })
    assert.equal(injected.status, 400)
    assert.equal(injected.data.code, 'BILLING_REQUEST_INVALID')
    assert.equal(stripe.calls.length, 0)

    const checkout = await call('POST', '/api/study-plan/billing/checkout', {
      body: {},
      cookie,
      headers: { 'X-Forwarded-Host': 'evil.example.test' },
    })
    assert.equal(checkout.status, 200)
    assert.deepEqual(checkout.data, { url: 'https://checkout.stripe.com/c/pay/cs_test_api' })

    assert.equal(stripe.calls.length, 1)
    const { url, options, params } = stripe.calls[0]
    assert.equal(url, 'https://api.stripe.com/v1/checkout/sessions')
    assert.equal(options.headers.Authorization, `Bearer ${SECRET_KEY}`)
    assert.equal(params.get('mode'), 'subscription')
    assert.equal(params.get('line_items[0][price]'), 'price_test_pro')
    assert.equal(params.get('success_url'), `${ORIGIN}/billing?status=success`)
    assert.equal(params.get('cancel_url'), `${ORIGIN}/billing?status=cancel`)
    assert.ok(params.get('client_reference_id'), 'checkout is tied to the account')
    assert.equal(params.get('subscription_data[metadata][account_id]'), params.get('client_reference_id'))
  })
})

test('checkout is rate limited per account', async () => {
  const stripe = fakeStripe()
  await withServer({ billing: BILLING_ON, billingFetchImpl: stripe.fetchImpl }, async ({ call, signIn }) => {
    const cookie = await signIn()
    for (let i = 0; i < 6; i++) {
      const ok = await call('POST', '/api/study-plan/billing/checkout', { body: {}, cookie })
      assert.equal(ok.status, 200, `attempt ${i + 1}`)
    }
    const blocked = await call('POST', '/api/study-plan/billing/checkout', { body: {}, cookie })
    assert.equal(blocked.status, 429)
    assert.equal(blocked.data.code, 'BILLING_RATE_LIMITED')
  })
  assert.equal(stripe.calls.length, 6)
})

test('a verified webhook activates the entitlement and blocks a second checkout with 409', async () => {
  const stripe = fakeStripe()
  await withServer({ billing: BILLING_ON, billingFetchImpl: stripe.fetchImpl }, async ({ call, signIn, postWebhook }) => {
    const cookie = await signIn()
    const first = await call('POST', '/api/study-plan/billing/checkout', { body: {}, cookie })
    assert.equal(first.status, 200)
    const accountId = stripe.calls[0].params.get('client_reference_id')

    const delivered = await postWebhook(subscriptionEvent('evt_api_created', 'customer.subscription.created', 1_000, { accountId }))
    assert.equal(delivered.status, 200)
    assert.deepEqual(delivered.data, { received: true })

    const status = await call('GET', '/api/study-plan/billing', { cookie })
    assert.equal(status.data.entitlement.active, true)
    assert.equal(status.data.entitlement.status, 'active')
    assert.equal(status.data.entitlement.priceId, 'price_test_pro')

    const again = await call('POST', '/api/study-plan/billing/checkout', { body: {}, cookie })
    assert.equal(again.status, 409)
    assert.equal(again.data.code, 'BILLING_ALREADY_ACTIVE')
  })
})

test('portal needs a Stripe customer and returns the portal URL once one exists', async () => {
  const stripe = fakeStripe()
  await withServer({ billing: BILLING_ON, billingFetchImpl: stripe.fetchImpl }, async ({ call, signIn, postWebhook }) => {
    const cookie = await signIn()
    const early = await call('POST', '/api/study-plan/billing/portal', { body: {}, cookie })
    assert.equal(early.status, 409)
    assert.equal(early.data.code, 'BILLING_NO_CUSTOMER')

    const anonymous = await call('POST', '/api/study-plan/billing/portal', { body: {} })
    assert.equal(anonymous.status, 401)
    assert.equal(anonymous.data.code, 'LOGIN_REQUIRED')

    const checkout = await call('POST', '/api/study-plan/billing/checkout', { body: {}, cookie })
    assert.equal(checkout.status, 200)
    const accountId = stripe.calls[0].params.get('client_reference_id')
    await postWebhook(subscriptionEvent('evt_api_portal_2', 'customer.subscription.created', 1_001, { accountId }))

    const portal = await call('POST', '/api/study-plan/billing/portal', { body: {}, cookie })
    assert.equal(portal.status, 200)
    assert.deepEqual(portal.data, { url: 'https://billing.stripe.com/p/session/test_api' })
    const portalCall = stripe.calls.find((entry) => entry.url.endsWith('/v1/billing_portal/sessions'))
    assert.equal(portalCall.params.get('customer'), 'cus_test_1')
    assert.equal(portalCall.params.get('return_url'), `${ORIGIN}/billing`)
  })
})

test('webhook requires a valid signature over the raw body and a fresh timestamp', async () => {
  await withServer({ billing: BILLING_ON }, async ({ call, signIn, postWebhook }) => {
    const cookie = await signIn()
    const event = subscriptionEvent('evt_sig', 'customer.subscription.created', 1_000, { accountId: 'x' })
    const signed = signedWebhook(event)

    const missing = await call('POST', '/api/study-plan/billing/webhook', { origin: null, body: signed.payload, contentType: 'application/json' })
    assert.equal(missing.status, 400)
    assert.equal(missing.data.code, 'BILLING_SIGNATURE_INVALID')

    const wrongSecret = await postWebhook(event, { secret: 'whsec_wrong' })
    assert.equal(wrongSecret.status, 400)
    assert.equal(wrongSecret.data.code, 'BILLING_SIGNATURE_INVALID')

    const stale = await postWebhook(event, { timestamp: Math.floor(Date.now() / 1000) - 3600 })
    assert.equal(stale.status, 400)

    const tampered = await call('POST', '/api/study-plan/billing/webhook', {
      origin: null,
      body: signed.payload.replace('"active"', '"canceled"').replace('cus_test_1', 'cus_other'),
      contentType: 'application/json',
      headers: { 'Stripe-Signature': signed.header },
    })
    assert.equal(tampered.status, 400)

    const status = await call('GET', '/api/study-plan/billing', { cookie })
    assert.equal(status.data.entitlement.status, 'none', 'no rejected event changed state')
  })
})

test('webhook works without a session cookie or Origin, and does not need a JSON content type', async () => {
  await withServer({ billing: BILLING_ON }, async ({ call, signIn, postWebhook }) => {
    await signIn()
    const event = subscriptionEvent('evt_no_cookie', 'customer.subscription.created', 1_000, { accountId: 'unknown' })
    const res = await postWebhook(event)
    assert.equal(res.status, 200, 'an unknown account is acknowledged so Stripe stops retrying')
    assert.equal(res.cookie, '', 'the webhook never sets a cookie')

    const signed = signedWebhook(subscriptionEvent('evt_plain', 'customer.subscription.updated', 1_001, {}))
    const plain = await call('POST', '/api/study-plan/billing/webhook', {
      origin: null,
      body: signed.payload,
      contentType: 'text/plain',
      headers: { 'Stripe-Signature': signed.header },
    })
    assert.equal(plain.status, 200)

    const wrongMethod = await call('GET', '/api/study-plan/billing/webhook', { origin: null })
    assert.equal(wrongMethod.status, 405)
  })
})

// The account id is internal, so tests read it from the client_reference_id that the fake Stripe received.
async function checkoutAccountId(call, stripe, cookie) {
  const res = await call('POST', '/api/study-plan/billing/checkout', { body: {}, cookie })
  assert.equal(res.status, 200)
  return stripe.calls[stripe.calls.length - 1].params.get('client_reference_id')
}

test('a replayed event id is answered 200 and changes nothing', async () => {
  const stripe = fakeStripe()
  await withServer({ billing: BILLING_ON, billingFetchImpl: stripe.fetchImpl }, async ({ call, signIn, postWebhook }) => {
    const cookie = await signIn()
    const accountId = await checkoutAccountId(call, stripe, cookie)

    const created = subscriptionEvent('evt_replay', 'customer.subscription.created', 1_000, { accountId })
    assert.equal((await postWebhook(created)).status, 200)
    assert.equal((await call('GET', '/api/study-plan/billing', { cookie })).data.entitlement.active, true)

    // Same event id, body now claiming cancellation. It must be ignored entirely.
    const replay = subscriptionEvent('evt_replay', 'customer.subscription.deleted', 2_000, { accountId, status: 'canceled' })
    const res = await postWebhook(replay)
    assert.equal(res.status, 200)
    assert.deepEqual(res.data, { received: true })
    assert.equal((await call('GET', '/api/study-plan/billing', { cookie })).data.entitlement.active, true)
  })
})

test('an out-of-order subscription event never overwrites newer state', async () => {
  const stripe = fakeStripe()
  await withServer({ billing: BILLING_ON, billingFetchImpl: stripe.fetchImpl }, async ({ call, signIn, postWebhook }) => {
    const cookie = await signIn()
    const accountId = await checkoutAccountId(call, stripe, cookie)
    assert.equal((await postWebhook(subscriptionEvent('evt_new', 'customer.subscription.updated', 2_000, { accountId }))).status, 200)
    const older = await postWebhook(subscriptionEvent('evt_old', 'customer.subscription.deleted', 1_000, { accountId, status: 'canceled' }))
    assert.equal(older.status, 200)
    assert.equal((await call('GET', '/api/study-plan/billing', { cookie })).data.entitlement.status, 'active')
  })
})

test('other routes still enforce the Origin and content-type policy', async () => {
  const stripe = fakeStripe()
  await withServer({ billing: BILLING_ON, billingFetchImpl: stripe.fetchImpl }, async ({ call, signIn }) => {
    const cookie = await signIn()

    const noOrigin = await call('POST', '/api/study-plan/billing/checkout', { body: {}, cookie, origin: null })
    assert.equal(noOrigin.status, 403)

    const crossOrigin = await call('POST', '/api/study-plan/billing/portal', { body: {}, cookie, origin: 'https://evil.example.test' })
    assert.equal(crossOrigin.status, 403)

    const textPlain = await call('POST', '/api/study-plan/billing/checkout', { body: '{}', cookie, contentType: 'text/plain' })
    assert.equal(textPlain.status, 403)

    const planWrite = await call('POST', '/api/study-plan', { body: { state: {} }, cookie, origin: null })
    assert.equal(planWrite.status, 403, 'the general plan write keeps its Origin requirement')

    const planText = await call('POST', '/api/study-plan', { body: '{}', cookie, contentType: 'text/plain' })
    assert.equal(planText.status, 403)

    // The read-only status route stays reachable without an Origin, as GET routes always were.
    const status = await call('GET', '/api/study-plan/billing', { cookie, origin: null })
    assert.equal(status.status, 200)
  })
  assert.equal(stripe.calls.length, 0)
})

test('the secret key and webhook secret never appear in any response, header or captured log', async () => {
  const stripe = fakeStripe()
  const logged = []
  const originalLog = console.log
  const originalError = console.error
  console.log = (...args) => logged.push(args.join(' '))
  console.error = (...args) => logged.push(args.join(' '))
  try {
    await withServer({ billing: BILLING_ON, billingFetchImpl: stripe.fetchImpl }, async ({ call, signIn, postWebhook, transcript }) => {
      const cookie = await signIn()
      await call('GET', '/api/study-plan/billing', { cookie })
      await call('POST', '/api/study-plan/billing/checkout', { body: {}, cookie })
      const accountId = stripe.calls[0].params.get('client_reference_id')
      await postWebhook(subscriptionEvent('evt_leak_1', 'customer.subscription.created', 1_000, { accountId }))
      await postWebhook(subscriptionEvent('evt_leak_2', 'customer.subscription.created', 1_000, { accountId }), { secret: 'whsec_wrong' })
      await call('POST', '/api/study-plan/billing/portal', { body: {}, cookie })
      await call('POST', '/api/study-plan/billing/webhook', { origin: null, body: '{not json', contentType: 'application/json' })

      const haystack = [...transcript, ...logged].join('\n')
      assert.ok(haystack.length > 0)
      assert.ok(!haystack.includes(SECRET_KEY), 'secret key leaked')
      assert.ok(!haystack.includes(WEBHOOK_SECRET), 'webhook secret leaked')
      assert.ok(!haystack.includes('whsec_wrong'), 'an attacker-supplied secret is not echoed back')
    })
  } finally {
    console.log = originalLog
    console.error = originalError
  }
})

test('the request policy exempts only the POST webhook path, and only from Origin and content-type checks', () => {
  const config = { origin: ORIGIN, secure: false }
  const plainText = new Headers({ 'content-type': 'text/plain' })
  const evil = new Headers({ 'content-type': 'text/plain', origin: 'https://evil.example.test' })

  // Exempt: POST with the webhook option, whatever Origin or content type it carries.
  assert.equal(studyPolicy(config, { method: 'POST', headers: plainText }, { webhook: true }).status, undefined)
  assert.equal(studyPolicy(config, { method: 'POST', headers: evil }, { webhook: true }).status, undefined)

  // Not exempt: the same request without the webhook option is rejected as before.
  assert.equal(studyPolicy(config, { method: 'POST', headers: plainText }, { webhook: false }).status, 403)
  assert.equal(studyPolicy(config, { method: 'POST', headers: evil }, {}).status, 403)

  // Not exempt for other methods: PUT is still outside the allowed method list.
  assert.equal(studyPolicy(config, { method: 'PUT', headers: plainText }, { webhook: true }).status, 405)
  // The exemption never adds CORS headers.
  assert.equal(studyPolicy(config, { method: 'POST', headers: evil }, { webhook: true }).headers['Access-Control-Allow-Origin'], undefined)
})
