import { LoadingUI } from './Loading'
import SignInCard from './SignInCard'
import { AUTH_STATUS_CACHE_KEY, isGuestMode } from '@/services/guestMode'
import { authStatusAtom } from '@/store/auth'
import { useAtomValue } from 'jotai'
import type React from 'react'

const readCachedStatus = (): 'open' | 'locked' | null => {
  try {
    const cached = window.localStorage.getItem(AUTH_STATUS_CACHE_KEY)
    if (cached === 'open' || cached === 'locked') return cached
    return null
  } catch {
    return null
  }
}

export interface RequireAccountProps {
  children: React.ReactNode
  pageName: string
}

export default function RequireAccount({ children, pageName }: RequireAccountProps) {
  const authStatus = useAtomValue(authStatusAtom)

  // Real status known from backend
  if (authStatus !== null) {
    const isGuest = authStatus.enabled && authStatus.required && !authStatus.signedIn
    if (isGuest) {
      return (
        <main className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center px-4 py-8">
          <SignInCard
            title={`登录后使用「${pageName}」`}
            description="学习进度与复习计划将保存在你的个人账号中。"
            showOpenFeatures
          />
        </main>
      )
    }
    return <>{children}</>
  }

  // Status not yet loaded from backend: use cache to avoid flash
  const cached = readCachedStatus()
  if (cached === 'locked' || isGuestMode()) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] w-full items-center justify-center px-4 py-8">
        <SignInCard
          title={`登录后使用「${pageName}」`}
          description="学习进度与复习计划将保存在你的个人账号中。"
          showOpenFeatures
        />
      </main>
    )
  }

  if (cached === 'open') {
    return <>{children}</>
  }

  // Unknown status (initial visit before status arrives)
  return (
    <div className="flex h-full min-h-[16rem] items-center justify-center">
      <LoadingUI />
    </div>
  )
}
