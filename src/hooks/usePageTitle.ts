import { ROUTE_SEO } from '@/resources/routeSeo'
import { useEffect } from 'react'

export function titleForPath(pathname: string): string {
  const defaultTitle = typeof document !== 'undefined' ? document.title : 'Qwerty Français — TCF Canada 法语打字背词'
  const normalized = pathname !== '/' ? pathname.replace(/\/+$/, '') : '/'

  if (normalized === '/') {
    return defaultTitle
  }

  const match = ROUTE_SEO.find((item) => item.path === normalized)
  if (match) {
    return match.title
  }

  if (normalized.startsWith('/tenses/')) {
    const tenses = ROUTE_SEO.find((item) => item.path === '/tenses')
    if (tenses) {
      return tenses.title
    }
  }

  return defaultTitle
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
