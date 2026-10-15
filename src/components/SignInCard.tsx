import logo from '@/assets/logo.svg'
import AppleLogo from '@/components/AppleLogo'
import GoogleLogo from '@/components/GoogleLogo'
import { authErrorMessage, preloadFirebaseSdk, signInWithGoogle, startAppleSignIn } from '@/services/auth'
import { switchLocalProfile } from '@/services/localProfile'
import { authStatusAtom } from '@/store/auth'
import { useAtomValue } from 'jotai'
import type React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

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
  const appleEnabled = useAtomValue(authStatusAtom)?.appleEnabled === true

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
        <GoogleLogo className="h-5 w-5 shrink-0" />
        <span>{submitting ? '正在登录…' : '使用 Google 账号登录'}</span>
      </button>
      {appleEnabled && (
        <button
          type="button"
          data-testid="apple-sign-in"
          onClick={startAppleSignIn}
          disabled={submitting}
          className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border border-black bg-black py-2.5 text-base font-medium text-white shadow-sm transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <AppleLogo className="h-5 w-5 shrink-0" />
          <span>使用 Apple 账号登录</span>
        </button>
      )}
      {appleEnabled && <p className="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-400">中国大陆用户请使用 Apple 登录</p>}
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
