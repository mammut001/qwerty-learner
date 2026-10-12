declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, string | number | boolean>) => void
    }
  }
}

export function isAnalyticsEnabled(): boolean {
  try {
    const id = import.meta.env?.VITE_UMAMI_WEBSITE_ID
    return typeof id === 'string' && id.trim().length > 0
  } catch {
    return false
  }
}

export function initAnalytics(): void {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const websiteId = import.meta.env?.VITE_UMAMI_WEBSITE_ID?.trim()
    if (!websiteId) return

    if (typeof navigator !== 'undefined') {
      if (navigator.doNotTrack === '1' || Boolean(navigator.webdriver)) {
        return
      }
    }

    if (
      document.querySelector('script[data-website-id]') ||
      document.querySelector('script[src="/umami/script.js"]')
    ) {
      return
    }

    const script = document.createElement('script')
    script.defer = true
    script.src = '/umami/script.js'
    script.setAttribute('data-website-id', websiteId)
    script.setAttribute('data-host-url', `${window.location.origin}/umami`)
    script.setAttribute('data-do-not-track', 'true')

    const target = document.head || document.documentElement
    target.appendChild(script)
  } catch {
    // Analytics must never throw or break app initialization
  }
}

export function trackAnalyticsEvent(
  name: string,
  data?: Record<string, string | number | boolean>,
): void {
  try {
    if (typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function') {
      window.umami.track(name, data)
    }
  } catch {
    // Analytics failures must never throw or impact caller logic
  }
}
