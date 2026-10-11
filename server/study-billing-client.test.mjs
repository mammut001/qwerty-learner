import assert from 'node:assert/strict'
import { register } from 'node:module'
import { test } from 'node:test'

try {
  register('./ts-extension-loader.mjs', import.meta.url)
} catch {
  // Already registered or unsupported
}

const billing = await import('../src/services/billing.ts')

async function withBrowser(run) {
  const originalFetch = globalThis.fetch
  const originalWindow = globalThis.window
  const assigned = []
  globalThis.window = { location: { assign: (url) => assigned.push(url) } }
  try {
    return await run({
      assigned,
      answer(status, data, calls = []) {
        globalThis.fetch = async (url, init) => {
          calls.push({ url, init })
          return { ok: status >= 200 && status < 300, status, json: async () => data }
        }
        return calls
      },
    })
  } finally {
    globalThis.fetch = originalFetch
    globalThis.window = originalWindow
  }
}

test('only Stripe-hosted https URLs are accepted for browser redirects', () => {
  assert.equal(billing.isStripeRedirectUrl('https://checkout.stripe.com/c/pay/cs_test_1'), true)
  assert.equal(billing.isStripeRedirectUrl('https://billing.stripe.com/p/session/test_1'), true)

  const refused = [
    'http://checkout.stripe.com/c/pay/cs_test_1',
    'https://checkout.stripe.com.evil.example.test/c/pay/cs_test_1',
    'https://evil.example.test/https://checkout.stripe.com/',
    'https://checkout.stripe.com@evil.example.test/',
    'javascript:alert(1)',
    '',
    null,
    undefined,
    42,
  ]
  for (const url of refused) assert.equal(billing.isStripeRedirectUrl(url), false, String(url))
})

test('getBillingStatus sends the session cookie to the billing status route', async () => {
  await withBrowser(({ answer }) => {
    const calls = answer(200, { enabled: true, mode: 'test', entitlement: null })
    return billing.getBillingStatus().then((status) => {
      assert.deepEqual(status, { enabled: true, mode: 'test', entitlement: null })
      assert.match(calls[0].url, /\/api\/study-plan\/billing$/)
      assert.equal(calls[0].init.method, 'GET')
      assert.equal(calls[0].init.credentials, 'include')
    })
  })
})

test('startCheckout redirects only to the Stripe URL the server returned', async () => {
  await withBrowser(async ({ assigned, answer }) => {
    const calls = answer(200, { url: 'https://checkout.stripe.com/c/pay/cs_test_ok' })
    await billing.startCheckout()
    assert.deepEqual(assigned, ['https://checkout.stripe.com/c/pay/cs_test_ok'])
    assert.equal(calls[0].init.method, 'POST')
    assert.equal(calls[0].init.credentials, 'include')
    assert.match(calls[0].url, /\/api\/study-plan\/billing\/checkout$/)
  })

  await withBrowser(async ({ assigned, answer }) => {
    answer(200, { url: 'https://evil.example.test/steal' })
    await assert.rejects(billing.startCheckout(), (error) => error.code === 'BILLING_REDIRECT_BLOCKED')
    assert.deepEqual(assigned, [], 'no navigation to a non-Stripe host')
  })
})

test('openBillingPortal maps server error codes and never navigates on failure', async () => {
  await withBrowser(async ({ assigned, answer }) => {
    answer(409, { code: 'BILLING_NO_CUSTOMER', error: 'No billing profile yet' })
    await assert.rejects(billing.openBillingPortal(), (error) => error.code === 'BILLING_NO_CUSTOMER')
    assert.deepEqual(assigned, [])
  })

  await withBrowser(async ({ assigned, answer }) => {
    answer(200, { url: 'https://billing.stripe.com/p/session/test_ok' })
    await billing.openBillingPortal()
    assert.deepEqual(assigned, ['https://billing.stripe.com/p/session/test_ok'])
  })
})
