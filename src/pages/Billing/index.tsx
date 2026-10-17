import Layout from '@/components/Layout'
import {
  BillingRequestError,
  type BillingStatus,
  getBillingStatus,
  openBillingPortal,
  startCheckout,
} from '@/services/billing'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const POLL_ATTEMPTS = 6
const POLL_INTERVAL_MS = 2000

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''

// The order matters: a past-due or cancel-at-period-end subscription is still "active" until its period ends.
function describePlan(status: BillingStatus): string {
  const entitlement = status.entitlement
  if (!entitlement) return '未订阅'
  const until = formatDate(entitlement.currentPeriodEnd)
  if (entitlement.status === 'past_due') return '扣款失败，请更新支付方式'
  if (entitlement.active && entitlement.cancelAtPeriodEnd) {
    return until ? `将于 ${until} 到期，不再续费` : '将于本期结束后到期，不再续费'
  }
  if (entitlement.active && entitlement.status === 'trialing') return until ? `试用中，至 ${until}` : '试用中'
  if (entitlement.active) return until ? `已订阅至 ${until}` : '已订阅'
  return '未订阅'
}

function messageFor(error: unknown): string {
  const code = error instanceof BillingRequestError ? error.code : ''
  if (code === 'LOGIN_REQUIRED') return '请先登录后再订阅。'
  if (code === 'BILLING_NOT_CONFIGURED') return '订阅功能尚未启用。'
  if (code === 'BILLING_ALREADY_ACTIVE') return '你已经订阅了 Pro。'
  if (code === 'BILLING_NO_CUSTOMER') return '还没有可管理的账单信息，请先完成订阅。'
  if (code === 'BILLING_RATE_LIMITED') return '操作太频繁，请稍后再试。'
  return '操作失败，请稍后再试。'
}

// Subscribing is in the page on purpose: this task only records entitlement and does not gate any feature.
export default function BillingPage() {
  const [searchParams] = useSearchParams()
  const returnStatus = searchParams.get('status')
  const [status, setStatus] = useState<BillingStatus | null>(null)
  const [loadError, setLoadError] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    let cancelled = false
    let attempts = 0
    let timer: number | undefined
    const refresh = async () => {
      try {
        const next = await getBillingStatus()
        if (cancelled) return
        setStatus(next)
        setLoadError('')
        attempts += 1
        // After a successful Checkout the webhook can arrive a little later, so poll briefly until Pro shows up.
        if (returnStatus === 'success' && !next.entitlement?.active && attempts < POLL_ATTEMPTS) {
          setConfirming(true)
          timer = window.setTimeout(refresh, POLL_INTERVAL_MS)
        } else {
          setConfirming(false)
        }
      } catch {
        if (cancelled) return
        setConfirming(false)
        setLoadError('暂时无法读取订阅状态，请稍后刷新页面。')
      }
    }
    void refresh()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [returnStatus])

  const runAction = async (action: () => Promise<void>) => {
    setBusy(true)
    setActionError('')
    try {
      await action()
    } catch (error) {
      setActionError(messageFor(error))
      setBusy(false)
    }
  }

  const entitlement = status?.entitlement ?? null
  const canManage = Boolean(entitlement && (entitlement.active || entitlement.status === 'past_due'))

  return (
    <Layout>
      <div className="w-full flex-1 overflow-y-auto px-4 pb-6">
        <section className="my-card mx-auto mt-6 max-w-md rounded-3xl bg-white p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Pro 订阅</h1>
            {status?.enabled && status.mode === 'test' && (
              <span
                data-testid="billing-test-mode-badge"
                className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
              >
                测试模式
              </span>
            )}
          </div>

          {returnStatus === 'success' && (
            <div role="status" className="mt-4 rounded-2xl bg-indigo-50 p-3 text-sm text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-200">
              {entitlement?.active ? '订阅已生效。' : confirming ? '支付已完成，正在确认订阅状态…' : '支付已完成。订阅状态可能需要几分钟才会更新，请稍后刷新页面。'}
            </div>
          )}
          {returnStatus === 'cancel' && (
            <div role="status" className="mt-4 rounded-2xl bg-gray-50 p-3 text-sm text-gray-700 dark:bg-white/5 dark:text-gray-300">
              已取消订阅流程，未产生任何扣款。
            </div>
          )}

          {!status && !loadError && <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">正在读取订阅状态…</p>}
          {loadError && <p role="alert" className="mt-5 text-sm text-red-600 dark:text-red-400">{loadError}</p>}

          {status && !status.enabled && (
            <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
              订阅功能尚未启用。这不影响任何学习功能，所有内容都可以照常使用。
            </p>
          )}

          {status?.enabled && !entitlement && (
            <p className="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-300">
              请先登录，然后再查看或管理订阅。
            </p>
          )}

          {status?.enabled && entitlement && (
            <div className="mt-5">
              <p data-testid="billing-plan-state" className="text-base font-medium text-gray-900 dark:text-white">
                {describePlan(status)}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {canManage ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void runAction(openBillingPortal)}
                    className="my-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
                  >
                    {busy ? '正在打开…' : '管理订阅'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void runAction(startCheckout)}
                    className="my-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
                  >
                    {busy ? '正在前往付款…' : '订阅 Pro'}
                  </button>
                )}
                {actionError && <p role="alert" className="text-center text-xs text-red-600 dark:text-red-400">{actionError}</p>}
              </div>
              <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
                付款与发票由 Stripe 处理。你可以在 Stripe 账单页面更新支付方式或取消续费。
              </p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}
