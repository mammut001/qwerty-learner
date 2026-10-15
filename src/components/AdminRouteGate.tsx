import { LoadingUI } from './Loading'
import {
  getAdminTokenForRoute,
  probeAdminAvailability,
  saveAdminTokenForRoute,
  useAdminAvailability,
} from '@/services/adminAvailability'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export interface AdminRouteGateProps {
  children?: React.ReactNode
}

export default function AdminRouteGate({ children }: AdminRouteGateProps) {
  const { pathname } = useLocation()
  const autoAvailability = useAdminAvailability(pathname)
  const [manual, setManual] = useState<{ path: string; status: 'pending' | 'available' | 'hidden' } | null>(null)
  const [tokenInput, setTokenInput] = useState(() => getAdminTokenForRoute(pathname))
  const [error, setError] = useState('')

  useEffect(() => {
    setTokenInput(getAdminTokenForRoute(pathname))
    setManual(null)
    setError('')
  }, [pathname])

  const availability = manual?.path === pathname ? manual.status : autoAvailability

  const verify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const token = tokenInput.trim()
    if (!token) return
    setError('')
    setManual({ path: pathname, status: 'pending' })
    const result = await probeAdminAvailability(pathname, token)
    if (result === 'available') {
      saveAdminTokenForRoute(pathname, token)
      setManual({ path: pathname, status: 'available' })
    } else {
      setManual({ path: pathname, status: 'hidden' })
      setError('管理员令牌无效或没有此页面的权限。')
    }
  }

  if (availability === 'available') return <>{children}</>

  if (availability === 'pending') {
    return (
      <div className="flex h-full min-h-[12rem] items-center justify-center">
        <LoadingUI />
      </div>
    )
  }

  return (
    <main data-testid="admin-access-denied" className="flex min-h-[20rem] flex-1 items-center justify-center px-4 py-8">
      <form onSubmit={(event) => void verify(event)} className="my-card w-full max-w-md rounded-2xl bg-white p-7 dark:bg-gray-800">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">管理员权限验证</h1>
        <p role="status" className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
          此页面仅限持有有效管理员令牌的用户访问。普通登录账号没有管理员权限。
        </p>
        <label className="mt-5 block text-sm text-gray-700 dark:text-gray-200">
          管理员令牌
          <input
            type="password"
            autoComplete="off"
            value={tokenInput}
            onChange={(event) => setTokenInput(event.target.value)}
            className="ui-input mt-2 w-full"
          />
        </label>
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={!tokenInput.trim()} className="ui-btn-primary mt-4 px-5 py-2">
          验证管理员权限
        </button>
      </form>
    </main>
  )
}
