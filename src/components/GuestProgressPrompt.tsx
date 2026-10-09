import { authErrorMessage, preloadFirebaseSdk, signInWithGoogle } from '@/services/auth'
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
      className={`flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${className}`}
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
        {signingIn ? '登录中…' : '登录'}
      </button>
      {error && <span className="text-red-500">({error})</span>}
    </div>
  )
}
