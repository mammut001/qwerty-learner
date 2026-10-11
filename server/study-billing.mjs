// Stripe subscription billing ("Pro"), test-mode ready and OFF unless the server is configured.
// This module only records who is entitled. It must never gate or hide an existing feature.
// Secrets rule: STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET must never be logged, printed, or returned to the client.
// Stripe is called through an injected fetch only; no test in this repository performs a network call.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

// Pinned API version. Keeps `current_period_end` on the top-level subscription object (later versions move it to items).
export const STRIPE_API_VERSION = '2024-06-20'
export const STRIPE_API_BASE = 'https://api.stripe.com'
export const CHECKOUT_HOST = 'https://checkout.stripe.com/'
export const PORTAL_HOST = 'https://billing.stripe.com/'
export const BILLING_EVENT_TYPES = Object.freeze([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_failed',
])

export class BillingError extends Error {
  constructor(code, message = code, details = {}) {
    super(message)
    this.code = code
    this.details = details
  }
}

/**
 * Reads billing configuration from the environment. Billing is enabled only when all three secrets are present.
 * mode comes from the secret key prefix: sk_live_ means live, anything else is reported as test.
 */
export function billingConfig(env = process.env) {
  const secretKey = String(env.STRIPE_SECRET_KEY || '').trim()
  const webhookSecret = String(env.STRIPE_WEBHOOK_SECRET || '').trim()
  const priceId = String(env.STRIPE_PRICE_ID || '').trim()
  return {
    enabled: Boolean(secretKey && webhookSecret && priceId),
    secretKey,
    webhookSecret,
    priceId,
    mode: secretKey.startsWith('sk_live_') ? 'live' : 'test',
  }
}

/**
 * Verifies a Stripe-Signature header against the RAW request body.
 * header: "t=<unix seconds>,v1=<hex>[,v1=<hex>...]" (other schemes such as v0 are ignored).
 * now: unix seconds (defaults to the current time). Returns true only when a v1 signature matches
 * and the timestamp is within toleranceSeconds of now.
 */
export function verifyStripeSignature({ payload, header, secret, toleranceSeconds = 300, now = Math.floor(Date.now() / 1000) }) {
  if (!secret || typeof header !== 'string' || header.length === 0 || header.length > 2000) return false
  if (typeof payload !== 'string' && !Buffer.isBuffer(payload)) return false

  let timestamp = null
  const signatures = []
  for (const part of header.split(',')) {
    const separator = part.indexOf('=')
    if (separator < 0) continue
    const key = part.slice(0, separator).trim()
    const value = part.slice(separator + 1).trim()
    if (key === 't') {
      if (timestamp !== null) return false
      timestamp = value
    } else if (key === 'v1') {
      signatures.push(value)
    }
  }
  if (!timestamp || !/^\d{1,16}$/.test(timestamp) || signatures.length === 0) return false

  const ageSeconds = Math.abs(Number(now) - Number(timestamp))
  if (!Number.isFinite(ageSeconds) || ageSeconds > toleranceSeconds) return false

  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf8')
  const expected = createHmac('sha256', secret).update(`${timestamp}.`).update(body).digest()
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false
    const supplied = Buffer.from(signature, 'hex')
    return supplied.length === expected.length && timingSafeEqual(supplied, expected)
  })
}

// Form-encodes [key, value] pairs. Nested Stripe keys such as line_items[0][price] are written literally.
async function stripeRequest({ config, fetchImpl, method = 'POST', path, pairs = [], idempotencyKey = '', timeoutMs = 15000 }) {
  if (!config?.enabled) throw new BillingError('BILLING_NOT_CONFIGURED', 'Billing is not configured')
  const headers = {
    Authorization: `Bearer ${config.secretKey}`,
    'Stripe-Version': STRIPE_API_VERSION,
  }
  let body
  if (method !== 'GET') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    body = new URLSearchParams(pairs).toString()
  }
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let res
  try {
    res = await fetchImpl(STRIPE_API_BASE + path, { method, headers, body, signal: controller.signal })
  } catch {
    throw new BillingError('BILLING_UPSTREAM_FAILED', 'Billing service is unavailable')
  } finally {
    clearTimeout(timer)
  }

  if (!res?.ok) {
    const status = Number(res?.status) || 0
    if (status === 401 || status === 403) throw new BillingError('BILLING_UPSTREAM_REJECTED', 'Billing service rejected the request', { status })
    throw new BillingError('BILLING_UPSTREAM_FAILED', 'Billing service returned an error', { status })
  }
  try {
    return await res.json()
  } catch {
    throw new BillingError('BILLING_UPSTREAM_FAILED', 'Failed to parse billing service response')
  }
}

/**
 * Creates a Stripe Checkout session for the single Pro subscription. The account id travels in
 * client_reference_id and subscription metadata so webhooks can map the subscription back to the account.
 */
export async function createCheckoutSession({
  config,
  fetchImpl = globalThis.fetch,
  customerId = '',
  customerEmail = '',
  accountId,
  successUrl,
  cancelUrl,
  idempotencyKey = randomBytes(16).toString('hex'),
}) {
  if (!accountId) throw new BillingError('BILLING_REQUEST_INVALID', 'Missing account')
  const pairs = [
    ['mode', 'subscription'],
    ['success_url', successUrl],
    ['cancel_url', cancelUrl],
    ['line_items[0][price]', config?.priceId],
    ['line_items[0][quantity]', '1'],
    ['client_reference_id', accountId],
    ['subscription_data[metadata][account_id]', accountId],
    ['allow_promotion_codes', 'true'],
  ]
  if (customerId) pairs.push(['customer', customerId])
  else if (customerEmail) pairs.push(['customer_email', customerEmail])

  const data = await stripeRequest({
    config,
    fetchImpl,
    path: '/v1/checkout/sessions',
    pairs,
    idempotencyKey,
  })
  if (typeof data?.id !== 'string' || typeof data?.url !== 'string' || !data.url.startsWith(CHECKOUT_HOST)) {
    throw new BillingError('BILLING_UPSTREAM_FAILED', 'Billing service returned an unexpected checkout response')
  }
  return { id: data.id, url: data.url }
}

/** Creates a Stripe Customer Portal session for an existing Stripe customer. */
export async function createPortalSession({ config, fetchImpl = globalThis.fetch, customerId, returnUrl }) {
  if (!customerId) throw new BillingError('BILLING_REQUEST_INVALID', 'Missing customer')
  const data = await stripeRequest({
    config,
    fetchImpl,
    path: '/v1/billing_portal/sessions',
    pairs: [
      ['customer', customerId],
      ['return_url', returnUrl],
    ],
  })
  if (typeof data?.url !== 'string' || !data.url.startsWith(PORTAL_HOST)) {
    throw new BillingError('BILLING_UPSTREAM_FAILED', 'Billing service returned an unexpected portal response')
  }
  return { url: data.url }
}

/**
 * Normalises a Stripe subscription object into the entitlement the app stores and shows.
 * active is true for "active" and "trialing" only. "past_due" is NOT active: the subscriber is shown
 * "扣款失败" and loses the Pro entitlement until Stripe moves the subscription back to active.
 * Other statuses (incomplete, incomplete_expired, unpaid, canceled, paused) are not active either.
 */
export function entitlementFromSubscription(sub) {
  if (!sub || typeof sub !== 'object') return null
  const status = typeof sub.status === 'string' ? sub.status : 'none'
  const item = Array.isArray(sub.items?.data) ? sub.items.data[0] : null
  const periodEndSeconds = Number(sub.current_period_end ?? item?.current_period_end) || 0
  return {
    status,
    active: status === 'active' || status === 'trialing',
    currentPeriodEnd: periodEndSeconds > 0 ? new Date(periodEndSeconds * 1000).toISOString() : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end === true,
    priceId: String(item?.price?.id || item?.plan?.id || sub.plan?.id || ''),
  }
}

/**
 * Maps one verified Stripe event to a normalised action. Unknown event types become { kind: 'ignored' }.
 * Actions carry Stripe ids and the event's `created` time; the persistence layer decides what to write.
 */
export function reduceBillingEvent(event) {
  const type = event?.type
  const object = event?.data?.object || {}
  const created = Number(event?.created) || 0

  if (type === 'checkout.session.completed') {
    if (object.mode !== 'subscription') return { kind: 'ignored' }
    return {
      kind: 'checkout_completed',
      accountId: String(object.client_reference_id || object.metadata?.account_id || ''),
      customerId: String(object.customer || ''),
      subscriptionId: String(object.subscription || ''),
      created,
    }
  }

  if (type === 'customer.subscription.created' || type === 'customer.subscription.updated' || type === 'customer.subscription.deleted') {
    return {
      kind: 'subscription_changed',
      deleted: type === 'customer.subscription.deleted',
      accountId: String(object.metadata?.account_id || ''),
      customerId: String(object.customer || ''),
      subscriptionId: String(object.id || ''),
      entitlement: entitlementFromSubscription(object),
      created,
    }
  }

  if (type === 'invoice.payment_failed') {
    return {
      kind: 'payment_failed',
      customerId: String(object.customer || ''),
      subscriptionId: String(object.subscription || ''),
      created,
    }
  }

  return { kind: 'ignored' }
}
