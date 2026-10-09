import logo from '@/assets/logo.svg'
import { authErrorMessage, preloadFirebaseSdk, signInWithGoogle } from '@/services/auth'
import { switchLocalProfile } from '@/services/localProfile'
import type React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

const openFeatures = [
  { to: '/typing', label: '单词跟打' },
  { to: '/dictionary', label: '查词' },
  { to: '/grammar-session', label: '语法' },
  { to: '/conjugation', label: '动词变位' },
  { to: '/tcf-listening', label: 'TCF 听力' },
  { to: '/tcf-reading', label: 'TCF 阅读' },
  { to: '/word-lists', label: '我的词表' },
  { to: '/gallery', label: '词库' },
]

export interface SignInCardProps {
  title?: string
  description?: string
  showOpenFeatures?: boolean
  className?: string
  children?: React.ReactNode
}

export default function SignInCard({
  title = '登录后继续',
  description = '学习进度与复习计划将保存在你的个人账号中。',
  showOpenFeatures = false,
  className = '',
  children,
}: SignInCardProps) {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const warmSdk = () => void preloadFirebaseSdk().catch(() => undefined)

  const handleSignIn = async () => {
    if (submitting) return
    setSubmitting(true)
    setMessage('')
    try {
      const result = await signInWithGoogle()
      const target = `acct:${result.user.id}`
      const mode = result.created || result.adopted || result.linked ? 'keep' : 'swap'
      switchLocalProfile(target, mode)
      sessionStorage.removeItem('qfp:reconciled')
      window.location.reload()
    } catch (error) {
      const code = error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      setMessage(authErrorMessage(code))
      setSubmitting(false)
    }
  }

  return (
    <div
      data-testid="auth-gate"
      className={`my-card w-full max-w-sm rounded-3xl bg-white p-7 dark:bg-gray-800 ${className}`}
    >
      <div className="flex items-center gap-3 text-indigo-500">
        <img src={logo} className="h-10 w-10" alt="" />
        <div>
          <div className="text-xl font-bold leading-6">Qwerty Français</div>
          <div className="text-xs font-medium tracking-wide text-gray-500 dark:text-gray-400">TCF Canada</div>
        </div>
      </div>
      <h1 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
      <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
      <button
        type="button"
        data-testid="google-sign-in"
        onClick={handleSignIn}
        onMouseEnter={warmSdk}
        onFocus={warmSdk}
        disabled={submitting}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white py-2.5 text-base font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
      >
        <GoogleIcon className="h-5 w-5 shrink-0" />
        <span>{submitting ? '正在登录…' : '使用 Google 账号登录'}</span>
      </button>
      {message && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {message}
        </p>
      )}

      {showOpenFeatures && (
        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-700/60">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">无需登录也可以使用：</div>
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs">
            {openFeatures.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg bg-gray-100 px-2.5 py-1 text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
