import { practiceListUrl } from '../src/utils/studyListMaintenance.mjs'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import vm from 'node:vm'

test('a reload of the new page receives the new practice list, not the body cached for the previous build', async () => {
  const store = new Map()
  const listeners = {}
  const networkBodies = new Map()
  const sandbox = {
    self: {
      addEventListener(type, fn) {
        listeners[type] = fn
      },
      registration: { scope: 'https://french.paytonpei.top/' },
      location: { origin: 'https://french.paytonpei.top' },
      clients: {
        claim() {
          return Promise.resolve()
        },
        matchAll() {
          return Promise.resolve([])
        },
      },
      skipWaiting() {
        return Promise.resolve()
      },
    },
    caches: {
      async match(request) {
        const url = typeof request === 'string' ? request : request.url
        const body = store.get(url)
        return body === undefined ? undefined : new Response(body, { status: 200, headers: { 'content-type': 'application/json' } })
      },
      async open() {
        return {
          async put(request, response) {
            const url = typeof request === 'string' ? request : request.url
            store.set(url, await response.clone().text())
          },
          async addAll() {},
        }
      },
      async keys() {
        return []
      },
      async delete() {
        return true
      },
    },
    fetch: async (request) => {
      const url = typeof request === 'string' ? request : request.url
      const body = networkBodies.get(url)
      if (body === undefined) return new Response('missing', { status: 404 })
      return new Response(body, { status: 200, headers: { 'content-type': 'application/json' } })
    },
    Response,
    URL,
    console,
  }
  vm.createContext(sandbox)
  vm.runInContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), sandbox)

  const oldUrl = `https://french.paytonpei.top${practiceListUrl('./dicts/TCF_Canada_Foundation_01.json', 'old-build')}`
  const newUrl = `https://french.paytonpei.top${practiceListUrl('./dicts/TCF_Canada_Foundation_01.json', 'new-build')}`
  assert.notEqual(oldUrl, newUrl)
  store.set(oldUrl, 'OLD')
  networkBodies.set(newUrl, 'NEW')

  const request = (url) =>
    new Promise((resolve, reject) => {
      let pending
      sandbox.self.addEventListener
      listeners.fetch({
        request: { method: 'GET', url, mode: 'cors' },
        respondWith(value) {
          pending = value
        },
      })
      Promise.resolve(pending).then((response) => response.text().then(resolve), reject)
    })

  const first = await request(newUrl)
  const second = await request(newUrl)
  assert.equal(first, 'NEW')
  assert.equal(second, 'NEW')
  assert.notEqual(first, 'OLD')
  assert.equal(store.get(oldUrl), 'OLD')
  console.log(`cache first=${first} second=${second}`)
})
