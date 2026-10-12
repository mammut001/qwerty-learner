declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, string | number | boolean>) => void
    }
  }
}

function getWebsiteId(overrideId?: string): string | undefined {
  if (typeof overrideId === 'string') {
    const trimmed = overrideId.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  const envId = import.meta.env?.VITE_UMAMI_WEBSITE_ID
  if (typeof envId === 'string') {
    const trimmed = envId.trim()
    if (trimmed.length > 0) return trimmed
  }
  if (typeof process !== 'undefined' && typeof process.env?.VITE_UMAMI_WEBSITE_ID === 'string') {
    const trimmed = process.env.VITE_UMAMI_WEBSITE_ID.trim()
    if (trimmed.length > 0) return trimmed
  }
  return undefined
}

export function isAnalyticsEnabled(overrideId?: string): boolean {
  try {
    return Boolean(getWebsiteId(overrideId))
  } catch {
    return false
  }
}

export function initAnalytics(overrideId?: string): void {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const websiteId = getWebsiteId(overrideId)
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
