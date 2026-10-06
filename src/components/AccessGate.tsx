import Loading from './Loading'
import logo from '@/assets/logo.svg'
import { getAccessStatus, unlockAccess } from '@/services/accessGate'
import type React from 'react'
import { useEffect, useState } from 'react'

// Remembered so a device that was let in renders immediately (and keeps working offline) while the server is re-checked.
const GRANTED_KEY = 'qwerty-fr-access-granted'

const readGranted = () => {
  try {
    return window.localStorage.getItem(GRANTED_KEY) === '1'
  } catch {
    return false
  }
}

const writeGranted = (granted: boolean) => {
  try {
    if (granted) window.localStorage.setItem(GRANTED_KEY, '1')
    else window.localStorage.removeItem(GRANTED_KEY)
  } catch {
    // Only costs a brief loading state on the next visit.
  }
}

/** Shows a password screen instead of the app when the server requires an access password. */
export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'checking' | 'open' | 'locked'>(() => (readGranted() ? 'open' : 'checking'))
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAccessStatus()
      .then((status) => {
        if (cancelled) return
        const locked = status.required && !status.granted
        writeGranted(!locked)
        setPhase(locked ? 'locked' : 'open')
      })
      .catch(() => {
        // Backend unreachable: the data routes stay protected server-side, so the offline app may open.
        if (!cancelled) setPhase('open')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!password || submitting) return
    setSubmitting(true)
    setMessage('')
    try {
      const result = await unlockAccess(password)
      if (result.ok) {
        writeGranted(true)
        // Restart so every data service begins with the access cookie in place.
        window.location.reload()
        return
      }
      setMessage(
        result.reason === 'wrong'
          ? '口令不对，再试一次。'
          : `尝试次数太多，请 ${Math.max(1, Math.ceil(result.retryAfterSeconds / 60))} 分钟后再试。`,
      )
    } catch {
      setMessage('连不上服务器，请检查网络后重试。')
    }
    setSubmitting(false)
  }

  if (phase === 'open') return <>{children}</>
  if (phase === 'checking') return <Loading />

  return (
    <main className="flex min-h-screen w-full items-center justify-center px-4">
      <form onSubmit={submit} data-testid="access-gate" className="my-card w-full max-w-sm rounded-3xl bg-white p-7 dark:bg-gray-800">
        <div className="flex items-center gap-3 text-indigo-500">
          <img src={logo} className="h-10 w-10" alt="" />
          <div>
            <div className="text-xl font-bold leading-6">Qwerty Français</div>
            <div className="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">TCF Canada</div>
          </div>
        </div>
        <h1 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">这是私人站点</h1>
        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">输入访问口令后才能使用。这台设备解锁一次后会保持 90 天。</p>
        <label className="mt-5 block">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">访问口令</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            autoComplete="current-password"
            maxLength={200}
            aria-label="访问口令"
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 outline-none focus:border-indigo-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </label>
        {message && (
          <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={!password || submitting}
          className="my-btn-primary mt-5 w-full py-2.5 text-base disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? '正在验证…' : '解锁'}
        </button>
      </form>
    </main>
  )
}
