import { track } from '@vercel/analytics'

type GtagFunction = (command: 'event', eventName: string, params?: Record<string, unknown>) => void

export const trackPromotionEvent = (event: string, properties: Record<string, string>) => {
  track(event, properties)

  if (typeof window !== 'undefined') {
    const gtag = (window as Window & typeof globalThis & { gtag?: GtagFunction }).gtag
    if (!gtag) return
    try {
      gtag('event', event, { ...properties })
      if (properties.action_detail) gtag('event', properties.action_detail)
    } catch (error) {
      console.error(error)
    }
  }
}
