import { studyApiBase } from './studyPlanSync'

const API_BASE = studyApiBase(import.meta.env?.VITE_STUDY_API_BASE_URL)

// The browser only follows redirects to Stripe's own hosts, so no server response can send the user elsewhere.
const STRIPE_REDIRECT_PREFIXES = ['https://checkout.stripe.com/', 'https://billing.stripe.com/'] as const

export type BillingEntitlement = {
  status: string
  active: boolean
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  priceId: string
}

export type BillingStatus = {
  enabled: boolean
  mode: 'test' | 'live'
  // null for anonymous learners and when billing is disabled.
  entitlement: BillingEntitlement | null
}

export class BillingRequestError extends Error {
  code: string

  constructor(code: string) {
    super(code)
    this.code = code
  }
}

export function isStripeRedirectUrl(url: unknown): url is string {
  return typeof url === 'string' && STRIPE_REDIRECT_PREFIXES.some((prefix) => url.startsWith(prefix))
}

async function billingRequest<T>(path: '' | '/checkout' | '/portal', method: 'GET' | 'POST'): Promise<T> {
  const response = await fetch(`${API_BASE}/api/study-plan/billing${path}`, {
    method,
    credentials: 'include',
    headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
    body: method === 'POST' ? '{}' : undefined,
  })
  const data = (await response.json().catch(() => null)) as (T & { code?: unknown }) | null
  if (!response.ok) {
    throw new BillingRequestError(typeof data?.code === 'string' ? data.code : 'BILLING_REQUEST_FAILED')
  }
  if (!data) throw new BillingRequestError('BILLING_REQUEST_FAILED')
  return data
}

export function getBillingStatus(): Promise<BillingStatus> {
  return billingRequest<BillingStatus>('', 'GET')
}

function redirectToStripe(url: unknown) {
  if (!isStripeRedirectUrl(url)) throw new BillingRequestError('BILLING_REDIRECT_BLOCKED')
  window.location.assign(url)
}

export async function startCheckout(): Promise<void> {
  const { url } = await billingRequest<{ url: string }>('/checkout', 'POST')
  redirectToStripe(url)
}

export async function openBillingPortal(): Promise<void> {
  const { url } = await billingRequest<{ url: string }>('/portal', 'POST')
  redirectToStripe(url)
}
