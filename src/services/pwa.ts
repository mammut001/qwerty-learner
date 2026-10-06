type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type PwaInstallState = {
  supported: boolean
  installed: boolean
  canInstall: boolean
  serviceWorkerReady: boolean
}

let installPrompt: InstallPromptEvent | null = null
let initialized = false
let state: PwaInstallState = {
  supported: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  installed: typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
  canInstall: false,
  serviceWorkerReady: false,
}
const listeners = new Set<(next: PwaInstallState) => void>()

const publish = (patch: Partial<PwaInstallState>) => {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener(state))
}

const cacheLoadedResources = async () => {
  if (!('serviceWorker' in navigator)) return
  const registration = await navigator.serviceWorker.ready
  const worker = registration.active
  if (!worker) return
  const urls = [
    window.location.href,
    ...performance
      .getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => {
        try {
          const parsed = new URL(url)
          return parsed.origin === window.location.origin && !parsed.pathname.startsWith('/api/')
        } catch {
          return false
        }
      }),
  ]
  await new Promise<void>((resolve) => {
    const channel = new MessageChannel()
    const timeout = window.setTimeout(resolve, 5000)
    channel.port1.onmessage = () => {
      window.clearTimeout(timeout)
      resolve()
    }
    worker.postMessage({ type: 'CACHE_URLS', urls: Array.from(new Set(urls)) }, [channel.port2])
  })
}

export async function registerStudyPwa() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    installPrompt = event as InstallPromptEvent
    publish({ canInstall: true })
  })

  window.addEventListener('appinstalled', () => {
    installPrompt = null
    publish({ installed: true, canInstall: false })
  })

  if (!('serviceWorker' in navigator)) return
  try {
    const swUrl = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.href)
    await navigator.serviceWorker.register(swUrl.pathname, { scope: import.meta.env.BASE_URL })
    await navigator.serviceWorker.ready
    await cacheLoadedResources()
    publish({ serviceWorkerReady: true })
  } catch {
    publish({ serviceWorkerReady: false })
  }
}

export function getPwaInstallState() {
  return { ...state }
}

export function subscribePwaInstallState(listener: (next: PwaInstallState) => void) {
  listeners.add(listener)
  listener(getPwaInstallState())
  return () => listeners.delete(listener)
}

export async function installStudyPwa() {
  if (!installPrompt) return false
  await installPrompt.prompt()
  const choice = await installPrompt.userChoice
  if (choice.outcome === 'accepted') {
    installPrompt = null
    publish({ canInstall: false })
    return true
  }
  return false
}
