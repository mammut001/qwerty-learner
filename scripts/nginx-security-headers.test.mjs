import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readRepoText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

function parseLocationBlocks(conf) {
  const regex = /location\s+([^{]+)\s*\{([^}]*)\}/g
  const blocks = new Map()
  let match
  while ((match = regex.exec(conf)) !== null) {
    const specifier = match[1].trim()
    const body = match[2]
    blocks.set(specifier, body)
  }
  return blocks
}

test('default.conf has balanced braces and valid block nesting', async () => {
  const conf = await readRepoText('public/default.conf')
  let depth = 0
  for (let i = 0; i < conf.length; i += 1) {
    const char = conf[i]
    if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
      assert.ok(depth >= 0, `unbalanced closing brace at character index ${i}`)
    }
  }
  assert.equal(depth, 0, 'braces in public/default.conf must balance to 0')
})

test('default.conf app and static locations include required security headers with always', async () => {
  const conf = await readRepoText('public/default.conf')
  const blocks = parseLocationBlocks(conf)

  const appStaticLocations = [
    '^~ /.vite/',
    '= /robots.txt',
    '= /sitemap.xml',
    '= /sw.js',
    '/assets/',
    '/lexicon/',
    '/dicts/',
    '/voice-audio/',
    '/',
    '= /50x.html',
  ]

  const requiredHeaderRules = [
    {
      name: 'Strict-Transport-Security',
      pattern: /add_header\s+Strict-Transport-Security\s+"max-age=31536000"\s+always;/,
      forbidden: /includeSubDomains|preload/,
    },
    {
      name: 'X-Content-Type-Options',
      pattern: /add_header\s+X-Content-Type-Options\s+"nosniff"\s+always;/,
    },
    {
      name: 'X-Frame-Options',
      pattern: /add_header\s+X-Frame-Options\s+"SAMEORIGIN"\s+always;/,
    },
    {
      name: 'Referrer-Policy',
      pattern: /add_header\s+Referrer-Policy\s+"strict-origin-when-cross-origin"\s+always;/,
      forbidden: /no-referrer(?!\w)/,
    },
    {
      name: 'Permissions-Policy',
      pattern:
        /add_header\s+Permissions-Policy\s+"camera=\(\),\s*geolocation=\(\),\s*payment=\(\),\s*usb=\(\),\s*microphone=\(self\)"\s+always;/,
    },
  ]

  for (const location of appStaticLocations) {
    assert.ok(blocks.has(location), `location ${location} should exist in default.conf`)
    const body = blocks.get(location)

    for (const rule of requiredHeaderRules) {
      assert.match(
        body,
        rule.pattern,
        `location ${location} is missing required ${rule.name} header with 'always'`,
      )
      if (rule.forbidden) {
        assert.doesNotMatch(
          body,
          rule.forbidden,
          `location ${location} contains forbidden pattern ${rule.forbidden}`,
        )
      }
    }
  }
})

test('default.conf preserves existing Cache-Control headers', async () => {
  const conf = await readRepoText('public/default.conf')
  const blocks = parseLocationBlocks(conf)

  const expectedCacheControls = [
    { location: '= /robots.txt', pattern: /add_header\s+Cache-Control\s+"public, max-age=3600";/ },
    { location: '= /sitemap.xml', pattern: /add_header\s+Cache-Control\s+"public, max-age=3600";/ },
    {
      location: '= /sw.js',
      pattern: /add_header\s+Cache-Control\s+"no-cache, no-store, must-revalidate";/,
    },
    {
      location: '/assets/',
      pattern: /add_header\s+Cache-Control\s+"public, max-age=31536000, immutable";/,
    },
    {
      location: '/lexicon/',
      pattern: /add_header\s+Cache-Control\s+"public, max-age=31536000, immutable";/,
    },
    {
      location: '/dicts/',
      pattern: /add_header\s+Cache-Control\s+"public, max-age=31536000, immutable";/,
    },
    {
      location: '/voice-audio/',
      pattern: /add_header\s+Cache-Control\s+"public, max-age=31536000, immutable";/,
    },
  ]

  for (const { location, pattern } of expectedCacheControls) {
    const body = blocks.get(location)
    assert.ok(body, `missing location ${location}`)
    assert.match(body, pattern, `Cache-Control mismatch in ${location}`)
  }
})

test('default.conf sets Content-Security-Policy-Report-Only with report-uri and is not enforcing', async () => {
  const conf = await readRepoText('public/default.conf')
  const blocks = parseLocationBlocks(conf)

  // Enforcing header must NOT be set
  assert.doesNotMatch(conf, /add_header\s+Content-Security-Policy\s+/i, 'Content-Security-Policy must not be enforcing')

  // HTML response locations must include Content-Security-Policy-Report-Only
  const htmlLocations = ['/', '= /50x.html']
  for (const location of htmlLocations) {
    assert.ok(blocks.has(location), `location ${location} should exist in default.conf`)
    const body = blocks.get(location)
    assert.match(
      body,
      /add_header\s+Content-Security-Policy-Report-Only\s+"[^"]*report-uri\s+\/api\/study-plan\/csp-report[^"]*"\s+always;/,
      `location ${location} is missing Content-Security-Policy-Report-Only header with report-uri`,
    )
    assert.match(body, /default-src\s+'self'/, `location ${location} missing default-src 'self'`)
    assert.match(body, /object-src\s+'none'/, `location ${location} missing object-src 'none'`)
    assert.match(body, /base-uri\s+'self'/, `location ${location} missing base-uri 'self'`)
    assert.match(body, /frame-ancestors\s+'self'/, `location ${location} missing frame-ancestors 'self'`)
  }
})

test('default.conf leaves API proxy locations untouched and proxying to study-api', async () => {
  const conf = await readRepoText('public/default.conf')
  const blocks = parseLocationBlocks(conf)

  const proxyLocations = [
    '= /health',
    '= /api/study-plan/speech/transcribe',
    '/api/',
  ]

  for (const location of proxyLocations) {
    assert.ok(blocks.has(location), `proxy location ${location} should exist`)
    const body = blocks.get(location)
    assert.match(body, /proxy_pass\s+http:\/\/study-api:8787;/)
    assert.doesNotMatch(
      body,
      /add_header\s+Strict-Transport-Security/,
      `proxy location ${location} should not have static app HSTS header`,
    )
    assert.doesNotMatch(
      body,
      /add_header\s+X-Frame-Options/,
      `proxy location ${location} should not have static app X-Frame-Options header`,
    )
  }
})
