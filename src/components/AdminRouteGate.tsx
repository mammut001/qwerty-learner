import { LoadingUI } from './Loading'
import { useAdminAvailability } from '@/services/adminAvailability'
import type React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

export interface AdminRouteGateProps {
  children?: React.ReactNode
}

export default function AdminRouteGate({ children }: AdminRouteGateProps) {
  const availability = useAdminAvailability()

  if (availability === 'hidden') {
    return <Navigate to="/" replace />
  }

  if (availability === 'available') {
    return <>{children ?? <Outlet />}</>
  }

  return (
    <div className="flex h-full min-h-[12rem] items-center justify-center">
      <LoadingUI />
    </div>
  )
}
