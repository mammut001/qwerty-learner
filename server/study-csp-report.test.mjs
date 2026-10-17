import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createStudyServer } from './study-plan.mjs'
import { studyPolicy } from './study-http.mjs'
import {
  extractCspReportFields,
  logCspReport,
  sanitizeBlockedUri,
  sanitizeDocumentPath,
} from './study-observability.mjs'

const ORIGIN = 'http://localhost:5173'

function setupTestServer(options = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'study-csp-test-'))
  const database = join(dir, 'study.sqlite')
  const server = createStudyServer({
    database,
    origin: ORIGIN,
    ...options,
  })
  return { dir, database, server }
}

test('studyPolicy: exempts POST csp-report from Origin, cross-site and content-type checks', () => {
  const config = { origin: ORIGIN, secure: false }
  const cspHeader = new Headers({ 'content-type': 'application/csp-report' })
  const jsonHeader = new Headers({ 'content-type': 'application/json' })
  const noOrigin = new Headers({ 'content-type': 'application/csp-report' })
  const crossSite = new Headers({
    'content-type': 'application/csp-report',
    origin: 'https://other.invalid',
    'sec-fetch-site': 'cross-site',
  })

  // Exempt with cspReport: true
  assert.equal(studyPolicy(config, { method: 'POST', headers: cspHeader }, { cspReport: true }).status, undefined)
  assert.equal(studyPolicy(config, { method: 'POST', headers: jsonHeader }, { cspReport: true }).status, undefined)
  assert.equal(studyPolicy(config, { method: 'POST', headers: noOrigin }, { cspReport: true }).status, undefined)
  assert.equal(studyPolicy(config, { method: 'POST', headers: crossSite }, { cspReport: true }).status, undefined)

  // Not exempt without cspReport option
  assert.equal(studyPolicy(config, { method: 'POST', headers: noOrigin }, {}).status, 403)
  assert.equal(studyPolicy(config, { method: 'POST', headers: crossSite }, {}).status, 403)

  // Other methods not exempt
  assert.equal(studyPolicy(config, { method: 'PUT', headers: cspHeader }, { cspReport: true }).status, 405)

  // Never adds CORS allow origin headers for csp-report
  const policy = studyPolicy(config, { method: 'POST', headers: crossSite }, { cspReport: true })
  assert.equal(policy.headers['Access-Control-Allow-Origin'], undefined)
})

test('sanitizeBlockedUri: extracts origin only and handles special schemes and keywords', () => {
  assert.equal(sanitizeBlockedUri('https://evil.example.com/bad.js?secret=token&user=admin'), 'https://evil.example.com')
  assert.equal(sanitizeBlockedUri('http://127.0.0.1:8080/path/to/script.js#frag'), 'http://127.0.0.1:8080')
  assert.equal(sanitizeBlockedUri('eval'), 'eval')
  assert.equal(sanitizeBlockedUri('inline'), 'inline')
  assert.equal(sanitizeBlockedUri('self'), 'self')
  assert.equal(sanitizeBlockedUri('wasm-eval'), 'wasm-eval')
  assert.equal(sanitizeBlockedUri('data:image/png;base64,iVBORw0KGgoAAAANSUhEUg'), 'data:')
  assert.equal(sanitizeBlockedUri('blob:https://french.paytonpei.top/7550301a-5408-4af7'), 'blob:')
  assert.equal(sanitizeBlockedUri(''), '')
  assert.equal(sanitizeBlockedUri(null), '')
})

test('sanitizeDocumentPath: strips query strings, fragments, and origins', () => {
  assert.equal(
    sanitizeDocumentPath('https://french.paytonpei.top/study-plan?user=123&token=secret#section'),
    '/study-plan',
  )
  assert.equal(sanitizeDocumentPath('/tcf-mock/session?q=french&attempt=99'), '/tcf-mock/session')
  assert.equal(sanitizeDocumentPath('/'), '/')
  assert.equal(sanitizeDocumentPath(''), '')
  assert.equal(sanitizeDocumentPath(null), '')
})

test('extractCspReportFields: parses CSP Level 2 and Reporting API formats and strips PII', () => {
  // CSP Level 2 standard format
  const level2 = {
    'csp-report': {
      'document-uri': 'https://french.paytonpei.top/study-plan?learner=secret_123',
      'violated-directive': 'script-src-elem',
      'blocked-uri': 'https://malicious.cdn.test/tracker.js?key=abc',
    },
  }
  const parsed2 = extractCspReportFields(level2)
  assert.equal(parsed2.directive, 'script-src-elem')
  assert.equal(parsed2.blockedOrigin, 'https://malicious.cdn.test')
  assert.equal(parsed2.documentPath, '/study-plan')

  // Reporting API format
  const reportingApi = [
    {
      type: 'csp-violation',
      body: {
        documentURL: 'https://french.paytonpei.top/tenses?filter=past',
        effectiveDirective: 'img-src',
        blockedURL: 'https://evil.test/pixel.png?tracking=1',
      },
    },
  ]
  const parsedReporting = extractCspReportFields(reportingApi)
  assert.equal(parsedReporting.directive, 'img-src')
  assert.equal(parsedReporting.blockedOrigin, 'https://evil.test')
  assert.equal(parsedReporting.documentPath, '/tenses')

  // Empty or invalid bodies
  assert.deepEqual(extractCspReportFields({}), { directive: '', blockedOrigin: '', documentPath: '' })
  assert.deepEqual(extractCspReportFields(null), { directive: '', blockedOrigin: '', documentPath: '' })
})

test('POST /api/study-plan/csp-report: accepts application/csp-report and application/json, logs compact line, returns 204', async () => {
  const { dir, server } = setupTestServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const url = `http://127.0.0.1:${port}/api/study-plan/csp-report`

  const logs = []
  const originalLog = console.log
  console.log = (line) => {
    try {
      logs.push(JSON.parse(line))
    } catch {
      logs.push(line)
    }
    originalLog(line)
  }

  try {
    // 1. application/csp-report (no Origin header)
    const report1 = {
      'csp-report': {
        'document-uri': 'https://french.paytonpei.top/study-plan?user=secret_456',
        'violated-directive': 'script-src',
        'blocked-uri': 'https://evil.com/leak.js?token=xyz',
      },
    }
    const res1 = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/csp-report' },
      body: JSON.stringify(report1),
    })
    assert.equal(res1.status, 204)
    assert.equal(await res1.text(), '')

    // Check log output
    const cspLog1 = logs.find((l) => l.event === 'csp_report')
    assert.ok(cspLog1, 'must log a csp_report event')
    assert.equal(cspLog1.directive, 'script-src')
    assert.equal(cspLog1.blockedOrigin, 'https://evil.com')
    assert.equal(cspLog1.documentPath, '/study-plan')
    assert.doesNotMatch(JSON.stringify(cspLog1), /secret_456/)
    assert.doesNotMatch(JSON.stringify(cspLog1), /xyz/)

    // 2. application/json with charset
    logs.length = 0
    const report2 = {
      'csp-report': {
        'document-uri': 'https://french.paytonpei.top/video-listening',
        'violated-directive': 'media-src',
        'blocked-uri': 'https://unknown-audio.test/sample.mp3',
      },
    }
    const res2 = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(report2),
    })
    assert.equal(res2.status, 204)

    const cspLog2 = logs.find((l) => l.event === 'csp_report')
    assert.ok(cspLog2)
    assert.equal(cspLog2.directive, 'media-src')
    assert.equal(cspLog2.blockedOrigin, 'https://unknown-audio.test')
    assert.equal(cspLog2.documentPath, '/video-listening')
  } finally {
    console.log = originalLog
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('POST /api/study-plan/csp-report: works when access gate is enabled without password cookie', async () => {
  const { dir, server } = setupTestServer({ accessKey: 'super-secret-password' })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const url = `http://127.0.0.1:${port}/api/study-plan/csp-report`

  try {
    const report = {
      'csp-report': {
        'document-uri': 'https://french.paytonpei.top/login',
        'violated-directive': 'connect-src',
        'blocked-uri': 'https://blocked.test/api',
      },
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/csp-report' },
      body: JSON.stringify(report),
    })
    assert.equal(res.status, 204, 'must allow CSP report even when site access password is required')
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('POST /api/study-plan/csp-report: enforces method, content-type, size limit, and valid json', async () => {
  const { dir, server } = setupTestServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const url = `http://127.0.0.1:${port}/api/study-plan/csp-report`

  try {
    // 1. Method not allowed: GET
    const getRes = await fetch(url, { method: 'GET' })
    assert.equal(getRes.status, 405)

    // 2. Unsupported Content-Type: text/plain
    const plainRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'hello',
    })
    assert.equal(plainRes.status, 415)

    // 3. Payload too large: > 8 KB
    const bigPayload = JSON.stringify({
      'csp-report': {
        'document-uri': '/test',
        'violated-directive': 'script-src',
        padding: 'A'.repeat(9000),
      },
    })
    const bigRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bigPayload,
    })
    assert.equal(bigRes.status, 413)

    // 4. Invalid JSON
    const malformedRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"csp-report": { not valid json',
    })
    assert.equal(malformedRes.status, 400)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})

test('POST /api/study-plan/csp-report: rate limits per actor (60 per minute cap)', async () => {
  const { dir, server } = setupTestServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const url = `http://127.0.0.1:${port}/api/study-plan/csp-report`

  try {
    for (let i = 0; i < 60; i += 1) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/csp-report' },
        body: JSON.stringify({ 'csp-report': { 'violated-directive': 'script-src', count: i } }),
      })
      assert.equal(res.status, 204, `request ${i} should succeed`)
    }
    // 61st request should be rate-limited
    const rateLimitedRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/csp-report' },
      body: JSON.stringify({ 'csp-report': { 'violated-directive': 'script-src' } }),
    })
    assert.equal(rateLimitedRes.status, 429)
    assert.ok(rateLimitedRes.headers.get('retry-after'))
  } finally {
    await new Promise((resolve) => server.close(resolve))
    rmSync(dir, { recursive: true, force: true })
  }
})
