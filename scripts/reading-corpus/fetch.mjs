// Fetches plain-text extracts and page metadata for the reading-corpus pilot from the two public
// MediaWiki APIs (fr.vikidia.org and fr.wikipedia.org). Anonymous GET only.
//
// Limits enforced here:
//   - at most 1 request per second (sleep between requests);
//   - at most 80 requests in total, counted in cache/fetch-log.json across runs;
//   - a descriptive User-Agent; no cookies, no credentials, no LLM calls.
// Results are stored raw under cache/ (git-ignored). Cached responses are reused and cost no request.
// If a request fails it is recorded in the log and never invented.
//
// Run: node scripts/reading-corpus/fetch.mjs

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const CACHE = join(here, 'cache')
const LOG_PATH = join(CACHE, 'fetch-log.json')
const MAX_REQUESTS = 80
const MIN_INTERVAL_MS = 1100
const USER_AGENT = 'tcf-canada-reading-pilot/0.1 (offline corpus pilot for French reading passages; anonymous GET; contact: repository owner)'

const titles = JSON.parse(readFileSync(join(here, 'titles.json'), 'utf8'))

function slugify(s) {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function loadLog() {
  if (existsSync(LOG_PATH)) return JSON.parse(readFileSync(LOG_PATH, 'utf8'))
  return { requestsMade: 0, requests: [] }
}

function saveLog(log) {
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + '\n', 'utf8')
}

let lastRequestAt = 0
async function apiGet(log, host, params, label) {
  if (log.requestsMade >= MAX_REQUESTS) {
    throw new Error(`request budget exhausted (${MAX_REQUESTS})`)
  }
  const wait = lastRequestAt + MIN_INTERVAL_MS - Date.now()
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  const qs = new URLSearchParams({ ...params, format: 'json', formatversion: '2' })
  const url = `https://${host}/w/api.php?${qs.toString()}`
  const retrievedAt = new Date().toISOString()
  lastRequestAt = Date.now()
  log.requestsMade += 1
  const entry = { n: log.requestsMade, label, host, params, retrievedAt }
  log.requests.push(entry)
  saveLog(log)
  let res
  try {
    res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } })
  } catch (err) {
    entry.error = String(err && err.message || err)
    saveLog(log)
    return { ok: false, error: entry.error, url, retrievedAt }
  }
  entry.status = res.status
  if (!res.ok) {
    entry.error = `HTTP ${res.status}`
    saveLog(log)
    return { ok: false, error: entry.error, url, retrievedAt }
  }
  const body = await res.json()
  saveLog(log)
  return { ok: true, body, url, retrievedAt }
}

async function fetchSiteInfo(log, siteKey, host) {
  const file = join(CACHE, `siteinfo-${siteKey}.json`)
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))
  const r = await apiGet(log, host, { action: 'query', meta: 'siteinfo', siprop: 'rightsinfo' }, `${siteKey}:siteinfo`)
  const record = r.ok
    ? { ok: true, host, request: r.url, retrievedAt: r.retrievedAt, rightsinfo: r.body?.query?.rightsinfo ?? null, raw: r.body }
    : { ok: false, host, request: r.url, retrievedAt: r.retrievedAt, error: r.error }
  mkdirSync(CACHE, { recursive: true })
  writeFileSync(file, JSON.stringify(record, null, 2) + '\n', 'utf8')
  return record
}

async function fetchArticle(log, siteKey, host, entry) {
  const dir = join(CACHE, siteKey)
  mkdirSync(dir, { recursive: true })
  const file = join(dir, `${slugify(entry.title)}.json`)
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))
  const r = await apiGet(log, host, {
    action: 'query',
    prop: 'extracts|info',
    explaintext: '1',
    exlimit: '1',
    inprop: 'url',
    redirects: '1',
    titles: entry.title,
  }, `${siteKey}:${entry.title}`)
  const record = { site: siteKey, requestedTitle: entry.title, topic: entry.topic, retrievedAt: r.retrievedAt, requestUrl: r.url }
  if (!r.ok) {
    record.ok = false
    record.error = r.error
  } else {
    const page = r.body?.query?.pages?.[0] ?? null
    record.ok = Boolean(page && !page.missing && page.extract)
    record.raw = r.body
    if (!record.ok) record.error = page?.missing ? 'missing page' : 'no extract returned'
  }
  writeFileSync(file, JSON.stringify(record, null, 2) + '\n', 'utf8')
  return record
}

async function main() {
  mkdirSync(CACHE, { recursive: true })
  const log = loadLog()
  const summary = {}
  for (const [siteKey, site] of Object.entries(titles.sites)) {
    const info = await fetchSiteInfo(log, siteKey, site.host)
    summary[siteKey] = { siteinfo: info.ok ? 'ok' : `failed: ${info.error}`, articles: { ok: 0, failed: [] } }
    for (const entry of site.titles) {
      const rec = await fetchArticle(log, siteKey, site.host, entry)
      if (rec.ok) summary[siteKey].articles.ok += 1
      else summary[siteKey].articles.failed.push({ title: entry.title, error: rec.error })
    }
  }
  console.log(JSON.stringify({ requestsMade: log.requestsMade, maxRequests: MAX_REQUESTS, summary }, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
