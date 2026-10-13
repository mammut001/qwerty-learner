import React from 'react'
import { handleChunkReload } from '@/utils/chunkReload'

export interface AppErrorBoundaryProps {
  children: React.ReactNode
  resetKey?: string
}

export interface AppErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error): void {
    handleChunkReload(error)
  }

  componentDidUpdate(prevProps: AppErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null })
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-1 items-center justify-center px-4 py-12">
          <div className="my-card w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-lg dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">页面出了点问题</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              可能是网站刚更新。请刷新页面重试。
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-indigo-500 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              刷新页面
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default AppErrorBoundary
