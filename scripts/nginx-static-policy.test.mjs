import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import http from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { gunzipSync } from 'node:zlib'

const execFileAsync = promisify(execFile)
const repoRoot = new URL('..', import.meta.url)
const shippedConf = new URL('../public/default.conf', import.meta.url)
const YEAR_SECONDS = 31536000

function run(command, args, options = {}) {
  return execFileAsync(command, args, { maxBuffer: 8 * 1024 * 1024, ...options })
}

function request(url, acceptEncoding) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers: { 'Accept-Encoding': acceptEncoding } }, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks),
        })
      })
    })
    req.on('error', reject)
  })
}

function header(headers, name) {
  const value = headers[name]
  if (Array.isArray(value)) return value.join(', ')
  return value || ''
}

function maxAge(cacheControl) {
  const match = String(cacheControl).match(/(?:^|[,;\s])max-age=(\d+)/i)
  return match ? Number(match[1]) : null
}

function isYearLongPublic(cacheControl) {
  return /\bpublic\b/i.test(cacheControl) && (maxAge(cacheControl) ?? 0) >= YEAR_SECONDS
}

async function dockerLogs(name) {
  try {
    const { stdout, stderr } = await run('docker', ['logs', name])
    return `${stdout}\n${stderr}`
  } catch (error) {
    return error.stderr || error.message
  }
}

test('shipped frontend nginx gzips static files and splits cache lifetimes', { timeout: 300_000 }, async () => {
  const stamp = `${process.pid}-${Date.now()}`
  const network = `npolicy-${stamp}`
  const upstreamName = `npolicy-api-${stamp}`
  const nginxName = `npolicy-web-${stamp}`
  const work = join(tmpdir(), `nginx-static-policy-${stamp}`)
  const app = join(work, 'app')
  const upstreamConf = join(work, 'upstream.conf')
  const removeAll = async () => {
    await run('docker', ['rm', '-f', nginxName, upstreamName]).catch(() => {})
    await run('docker', ['network', 'rm', network]).catch(() => {})
    await rm(work, { recursive: true, force: true }).catch(() => {})
  }

  try {
    await run('docker', ['info'])
    await mkdir(join(app, 'assets'), { recursive: true })
    await mkdir(join(app, 'lexicon', 'fr'), { recursive: true })
    await mkdir(join(app, 'dicts'), { recursive: true })

    const text = (label) => `${label}\n`.repeat(4000)
    const files = {
      'index.html': `<!doctype html><html><body>${text('fixture-index-html')}</body></html>\n`,
      'sw.js': `self.addEventListener('fetch', function () {});\n${text('fixture-sw')}`,
      'robots.txt': `${text('fixture-robots')}`,
      'assets/app.js': text('fixture-app-js'),
      'assets/app.css': text('fixture-app-css'),
      'assets/icon.svg': `<svg xmlns="http://www.w3.org/2000/svg">${text('fixture-svg')}</svg>\n`,
      'lexicon/fr/de.json': JSON.stringify({ words: text('fixture-lexicon') }),
      'dicts/sample.json': JSON.stringify({ words: text('fixture-dict') }),
    }
    await Promise.all(Object.entries(files).map(([name, contents]) => writeFile(join(app, name), contents)))
    const upstreamBody = JSON.stringify({
      ok: true,
      storage: 'sqlite',
      schemaVersion: 13,
      via: 'study-api-fixture',
      pad: 'bonjour '.repeat(400),
    })
    await writeFile(
      upstreamConf,
      [
        'server {',
        '    listen 8787;',
        '    location / {',
        '        default_type application/json;',
        `        add_header Cache-Control "no-store" always;`,
        `        return 200 '${upstreamBody}';`,
        '    }',
        '}',
        '',
      ].join('\n'),
    )

    await run('docker', ['network', 'create', network])
    await run('docker', [
      'run',
      '-d',
      '--name',
      upstreamName,
      '--network',
      network,
      '--network-alias',
      'study-api',
      '-v',
      `${upstreamConf}:/etc/nginx/conf.d/default.conf:ro`,
      'nginx:alpine',
    ])
    await run('docker', [
      'run',
      '-d',
      '--name',
      nginxName,
      '--network',
      network,
      '-p',
      '127.0.0.1::5173',
      '-v',
      `${fileURLToPath(shippedConf)}:/etc/nginx/conf.d/default.conf:ro`,
      '-v',
      `${app}:/app:ro`,
      'nginx:alpine',
    ])

    const state = async (name) => (await run('docker', ['inspect', '-f', '{{.State.Status}} {{.State.ExitCode}}', name])).stdout.trim()
    const upstreamState = await state(upstreamName)
    const nginxState = await state(nginxName)
    if (!upstreamState.startsWith('running') || !nginxState.startsWith('running')) {
      throw new Error(
        `containers did not stay up\nupstream ${upstreamState}\n${await dockerLogs(upstreamName)}\nnginx ${nginxState}\n${await dockerLogs(
          nginxName,
        )}`,
      )
    }

    const loaded = (await run('docker', ['exec', nginxName, 'cat', '/etc/nginx/conf.d/default.conf'])).stdout
    assert.equal(loaded, await readFile(shippedConf, 'utf8'))
    const syntax = await run('docker', ['exec', nginxName, 'nginx', '-t'])
    assert.match(`${syntax.stdout}\n${syntax.stderr}`, /syntax is ok/i)

    const portLine = (await run('docker', ['port', nginxName, '5173'])).stdout
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.startsWith('127.0.0.1:'))
    assert.ok(portLine, `nginx did not publish on 127.0.0.1 (${portLine})`)
    const port = portLine.slice('127.0.0.1:'.length)
    const origin = `http://127.0.0.1:${port}`

    const fetchPair = async (path) => {
      let identity
      let gzipped
      let lastError
      for (let attempt = 0; attempt < 40; attempt += 1) {
        try {
          identity = await request(`${origin}${path}`, 'identity')
          gzipped = await request(`${origin}${path}`, 'gzip')
          if (identity.status) break
        } catch (error) {
          lastError = error
          await new Promise((resolve) => setTimeout(resolve, 250))
        }
      }
      if (!identity || !gzipped) throw lastError || new Error(`no response for ${path}`)
      return { identity, gzipped }
    }

    const report = async (path, { expectGzip, expectYearCache }) => {
      const { identity, gzipped } = await fetchPair(path)
      const encoding = header(gzipped.headers, 'content-encoding')
      const cacheControl = header(gzipped.headers, 'cache-control')
      const type = header(gzipped.headers, 'content-type')
      const ratio = identity.body.length === 0 ? 1 : gzipped.body.length / identity.body.length
      console.log(
        [
          path,
          `status=${gzipped.status}`,
          `type=${type}`,
          `encoding=${encoding || '-'}`,
          `cache=${cacheControl || '-'}`,
          `identity=${identity.body.length}`,
          `gzip=${gzipped.body.length}`,
          `ratio=${ratio.toFixed(4)}`,
        ].join(' '),
      )
      assert.equal(identity.status, 200, path)
      assert.equal(gzipped.status, 200, path)
      assert.equal(header(identity.headers, 'content-encoding'), '', `${path} identity encoding`)
      if (expectGzip) {
        assert.equal(encoding, 'gzip', path)
        assert.ok(gzipped.body.length <= identity.body.length * 0.45, `${path} ratio ${ratio}`)
        assert.deepEqual(gunzipSync(gzipped.body), identity.body, `${path} gunzip`)
      } else {
        assert.equal(encoding, '', `${path} should not be gzipped`)
        assert.deepEqual(gzipped.body, identity.body, path)
      }
      if (expectYearCache) {
        assert.equal(cacheControl, 'public, max-age=31536000, immutable')
      } else {
        assert.equal(isYearLongPublic(cacheControl), false, `${path} cache ${cacheControl}`)
        assert.ok((maxAge(cacheControl) ?? 0) < YEAR_SECONDS, `${path} max-age ${cacheControl}`)
      }
      return { identity, gzipped, cacheControl }
    }

    await report('/assets/app.js', { expectGzip: true, expectYearCache: true })
    await report('/assets/app.css', { expectGzip: true, expectYearCache: true })
    await report('/assets/icon.svg', { expectGzip: true, expectYearCache: true })
    await report('/lexicon/fr/de.json', { expectGzip: true, expectYearCache: true })
    await report('/dicts/sample.json', { expectGzip: true, expectYearCache: true })

    const sw = await report('/sw.js', { expectGzip: true, expectYearCache: false })
    assert.equal(sw.cacheControl, 'no-cache, no-store, must-revalidate')
    assert.equal(sw.identity.body.toString('utf8'), files['sw.js'])

    const home = await report('/', { expectGzip: true, expectYearCache: false })
    assert.equal(home.identity.body.toString('utf8'), files['index.html'])
    assert.equal(header(home.gzipped.headers, 'cache-control').includes('31536000'), false)

    const robots = await report('/robots.txt', { expectGzip: false, expectYearCache: false })
    assert.equal(robots.identity.body.toString('utf8'), files['robots.txt'])

    const apiPaths = ['/api/health', '/health', '/api/study-plan/speech/transcribe']
    for (const path of apiPaths) {
      const { gzipped } = await fetchPair(path)
      const cacheControl = header(gzipped.headers, 'cache-control')
      const encoding = header(gzipped.headers, 'content-encoding')
      const apiBody = gzipped.body.toString('utf8')
      console.log(
        `${path} status=${gzipped.status} encoding=${encoding || '-'} cache=${cacheControl || '-'} bytes=${
          gzipped.body.length
        } via=${apiBody.includes('study-api-fixture')}`,
      )
      assert.equal(gzipped.status, 200, path)
      assert.equal(encoding, '', `${path} should stay an uncompressed reverse proxy`)
      assert.match(gzipped.body.toString('utf8'), /"via":"study-api-fixture"/)
      assert.match(gzipped.body.toString('utf8'), /"schemaVersion":13/)
      assert.match(cacheControl, /no-store/)
      assert.equal(isYearLongPublic(cacheControl), false, cacheControl)
    }
  } finally {
    await removeAll()
  }
})
