import AppleLogo from '@/components/AppleLogo'
import { authErrorMessage, preloadFirebaseSdk, signInWithGoogle, startAppleSignIn } from '@/services/auth'
import { isGuestMode } from '@/services/guestMode'
import { switchLocalProfile } from '@/services/localProfile'
import { authStatusAtom } from '@/store/auth'
import { useAtomValue } from 'jotai'
import { useState } from 'react'

export interface GuestProgressPromptProps {
  className?: string
}

export default function GuestProgressPrompt({ className = '' }: GuestProgressPromptProps) {
  const authStatus = useAtomValue(authStatusAtom)
  const isGuest = authStatus ? (authStatus.enabled && authStatus.required && !authStatus.signedIn) : isGuestMode()
  const appleEnabled = authStatus?.appleEnabled === true
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')

  if (!isGuest) return null

  const warmSdk = () => void preloadFirebaseSdk().catch(() => undefined)

  const handleSignIn = async () => {
    if (signingIn) return
    setSigningIn(true)
    setError('')
    try {
      const result = await signInWithGoogle()
      const target = `acct:${result.user.id}`
      const mode = result.created || result.adopted || result.linked ? 'keep' : 'swap'
      switchLocalProfile(target, mode)
      sessionStorage.removeItem('qfp:reconciled')
      window.location.reload()
    } catch (err) {
      const code = err instanceof Error ? err.message : 'UNKNOWN_ERROR'
      setError(authErrorMessage(code))
      setSigningIn(false)
    }
  }

  return (
    <div
      data-testid="guest-progress-prompt"
      className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400 ${className}`}
    >
      <span>登录后可保存学习进度</span>
      <button
        type="button"
        data-testid="guest-progress-sign-in"
        onClick={handleSignIn}
        onMouseEnter={warmSdk}
        onFocus={warmSdk}
        disabled={signingIn}
        className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400 disabled:opacity-50"
      >
        {signingIn ? '登录中…' : '使用 Google 账号登录'}
      </button>
      {appleEnabled && (
        <button
          type="button"
          data-testid="guest-progress-apple-sign-in"
          onClick={startAppleSignIn}
          disabled={signingIn}
          className="inline-flex items-center gap-1 font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300 disabled:opacity-50"
        >
          <AppleLogo className="h-3.5 w-3.5 shrink-0" />
          <span>使用 Apple 账号登录</span>
        </button>
      )}
      {appleEnabled && <span className="basis-full text-center text-[11px]">中国大陆用户请使用 Apple 登录</span>}
      {error && <span className="text-red-500">({error})</span>}
    </div>
  )
}
