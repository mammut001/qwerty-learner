const CACHE_NAME = 'qwerty-fr-pwa-v1'
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './favicon-32x32.png',
  './android-chrome-192x192.png',
  './android-chrome-512x512.png',
]

const scoped = (path) => new URL(path, self.registration.scope).href

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL.map(scoped)))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
      self.clients.claim(),
    ]),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS' || !Array.isArray(event.data.urls)) return
  const done = caches.open(CACHE_NAME).then(async (cache) => {
    for (const value of event.data.urls) {
      try {
        const url = new URL(value, self.registration.scope)
        if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) continue
        const response = await fetch(url.href, { credentials: 'same-origin' })
        if (response.ok) await cache.put(url.href, response.clone())
      } catch {
        // Best-effort warmup; individual asset failures must not break the service worker.
      }
    }
  }).finally(() => event.ports?.[0]?.postMessage({ cached: true }))
  event.waitUntil(done)
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME)
            await cache.put(request, response.clone())
          }
          return response
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME)
          return (
            (await cache.match(request)) ||
            (await cache.match(scoped('./'))) ||
            (await cache.match(scoped('./index.html'))) ||
            Response.error()
          )
        }),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then(async (response) => {
        if (response.ok && response.type === 'basic') {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(request, response.clone())
        }
        return response
      })
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url || scoped('./study-plan')
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          await client.navigate(target)
          return client.focus()
        }
      }
      return self.clients.openWindow ? self.clients.openWindow(target) : undefined
    }),
  )
})
