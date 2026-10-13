import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initAnalytics, isAnalyticsEnabled, trackAnalyticsEvent } from './analytics'

interface MockScript {
  tagName: string
  defer: boolean
  src: string
  attributes: Record<string, string>
  setAttribute: (name: string, value: string) => void
  getAttribute: (name: string) => string | undefined
}

function withMockBrowser(
  options: {
    envId?: string
    doNotTrack?: string
    webdriver?: boolean
    umami?: { track: (name: string, data?: unknown) => void }
    existingScript?: boolean
  },
  fn: (ctx: { scripts: MockScript[]; head: { children: MockScript[] } }) => void,
) {
  const origWinDesc = Object.getOwnPropertyDescriptor(globalThis, 'window')
  const origDocDesc = Object.getOwnPropertyDescriptor(globalThis, 'document')
  const origNavDesc = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
  const originalEnv = process.env.VITE_UMAMI_WEBSITE_ID

  if (options.envId !== undefined) {
    process.env.VITE_UMAMI_WEBSITE_ID = options.envId
  } else {
    delete process.env.VITE_UMAMI_WEBSITE_ID
  }

  const scripts: MockScript[] = []

  const createScript = (): MockScript => {
    const s: MockScript = {
      tagName: 'script',
      defer: false,
      src: '',
      attributes: {},
      setAttribute(name: string, value: string) {
        s.attributes[name] = value
      },
      getAttribute(name: string) {
        return s.attributes[name]
      },
    }
    return s
  }

  const head = {
    children: [] as MockScript[],
    appendChild(child: MockScript) {
      head.children.push(child)
      scripts.push(child)
      return child
    },
  }

  if (options.existingScript) {
    const existing = createScript()
    existing.src = '/umami/script.js'
    existing.setAttribute('data-website-id', 'existing-id')
    head.children.push(existing)
    scripts.push(existing)
  }

  const mockDoc = {
    head,
    createElement(tag: string) {
      if (tag === 'script') {
        return createScript()
      }
      const elAttrs: Record<string, string> = {}
      return {
        tagName: tag,
        attributes: elAttrs,
        setAttribute(name: string, value: string) {
          elAttrs[name] = value
        },
        getAttribute(name: string) {
          return elAttrs[name]
        },
      }
    },
    querySelector(selector: string) {
      if (selector === 'script[data-website-id]') {
        return scripts.find((s) => s.attributes['data-website-id'] !== undefined) ?? null
      }
      if (selector === 'script[src="/umami/script.js"]') {
        return scripts.find((s) => s.src === '/umami/script.js') ?? null
      }
      return null
    },
  }

  const mockNav = {
    doNotTrack: options.doNotTrack ?? '0',
    webdriver: options.webdriver ?? false,
  }

  const mockWin = {
    location: {
      origin: 'https://french.paytonpei.top',
    },
    umami: options.umami,
  }

  Object.defineProperty(globalThis, 'window', { value: mockWin, configurable: true, writable: true })
  Object.defineProperty(globalThis, 'document', { value: mockDoc, configurable: true, writable: true })
  Object.defineProperty(globalThis, 'navigator', { value: mockNav, configurable: true, writable: true })

  try {
    fn({ scripts, head })
  } finally {
    if (origWinDesc) Object.defineProperty(globalThis, 'window', origWinDesc)
    else delete (globalThis as Record<string, unknown>).window

    if (origDocDesc) Object.defineProperty(globalThis, 'document', origDocDesc)
    else delete (globalThis as Record<string, unknown>).document

    if (origNavDesc) Object.defineProperty(globalThis, 'navigator', origNavDesc)
    else delete (globalThis as Record<string, unknown>).navigator

    if (originalEnv !== undefined) {
      process.env.VITE_UMAMI_WEBSITE_ID = originalEnv
    } else {
      delete process.env.VITE_UMAMI_WEBSITE_ID
    }
  }
}

test('no script injected without website id', () => {
  withMockBrowser({ envId: '' }, ({ scripts }) => {
    assert.equal(isAnalyticsEnabled(), false)
    initAnalytics()
    assert.equal(scripts.length, 0)
  })

  withMockBrowser({ envId: '   ' }, ({ scripts }) => {
    assert.equal(isAnalyticsEnabled(), false)
    initAnalytics()
    assert.equal(scripts.length, 0)
  })
})

test('one script with the right attributes injected when id is present', () => {
  withMockBrowser({ envId: 'test-uuid-1234' }, ({ scripts }) => {
    assert.equal(isAnalyticsEnabled(), true)
    initAnalytics()
    assert.equal(scripts.length, 1)

    const injected = scripts[0]
    assert.equal(injected.src, '/umami/script.js')
    assert.equal(injected.defer, true)
    assert.equal(injected.getAttribute('data-website-id'), 'test-uuid-1234')
    assert.equal(injected.getAttribute('data-host-url'), 'https://french.paytonpei.top/umami')
    assert.equal(injected.getAttribute('data-do-not-track'), 'true')
  })
})

test('idempotent: multiple calls inject only one script', () => {
  withMockBrowser({ envId: 'test-uuid-1234' }, ({ scripts }) => {
    initAnalytics()
    initAnalytics()
    initAnalytics()
    assert.equal(scripts.length, 1)
  })

  withMockBrowser({ envId: 'test-uuid-1234', existingScript: true }, ({ scripts }) => {
    assert.equal(scripts.length, 1)
    initAnalytics()
    assert.equal(scripts.length, 1)
  })
})

test('respects doNotTrack flag', () => {
  withMockBrowser({ envId: 'test-uuid-1234', doNotTrack: '1' }, ({ scripts }) => {
    initAnalytics()
    assert.equal(scripts.length, 0)
  })
})

test('respects navigator.webdriver under automated testing', () => {
  withMockBrowser({ envId: 'test-uuid-1234', webdriver: true }, ({ scripts }) => {
    initAnalytics()
    assert.equal(scripts.length, 0)
  })
})

test('trackAnalyticsEvent never throws without window.umami', () => {
  withMockBrowser({ umami: undefined }, () => {
    assert.doesNotThrow(() => {
      trackAnalyticsEvent('level_quiz_submit', { level: 3, skill: 'listening', passed: true })
      trackAnalyticsEvent('listening_play')
    })
  })
})

test('trackAnalyticsEvent forwards events to window.umami and catches errors', () => {
  const events: { name: string; data?: unknown }[] = []
  const mockUmami = {
    track: (name: string, data?: unknown) => {
      events.push({ name, data })
    },
  }

  withMockBrowser({ umami: mockUmami }, () => {
    trackAnalyticsEvent('speech_transcribe')
    trackAnalyticsEvent('level_quiz_submit', { level: 2, skill: 'reading', passed: false })

    assert.equal(events.length, 2)
    assert.deepEqual(events[0], { name: 'speech_transcribe', data: undefined })
    assert.deepEqual(events[1], {
      name: 'level_quiz_submit',
      data: { level: 2, skill: 'reading', passed: false },
    })
  })

  const throwingUmami = {
    track: () => {
      throw new Error('tracking failed')
    },
  }

  withMockBrowser({ umami: throwingUmami }, () => {
    assert.doesNotThrow(() => {
      trackAnalyticsEvent('issue_report')
    })
  })
})
