import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const SITE = 'https://french.paytonpei.top'
const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('sitemap.xml lists only public site URLs', async () => {
  const xml = await readText('public/sitemap.xml')
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)
  assert.match(xml.trimEnd(), /<\/urlset>$/)

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  assert.ok(locs.length > 0)
  assert.equal(xml.match(/<url>/g)?.length, locs.length)
  for (const loc of locs) {
    assert.ok(loc.startsWith(`${SITE}/`), `unexpected host: ${loc}`)
    assert.doesNotMatch(loc, /\/admin|\/api\/|\/auth/)
  }
  assert.ok(locs.includes(`${SITE}/`))
})

test('robots.txt allows crawling, blocks admin and api, and points to the sitemap', async () => {
  const robots = await readText('public/robots.txt')
  assert.match(robots, /^User-agent: \*$/m)
  assert.match(robots, /^Disallow: \/admin$/m)
  assert.match(robots, /^Disallow: \/api\/$/m)
  assert.match(robots, new RegExp(`^Sitemap: ${SITE}/sitemap\\.xml$`, 'm'))
})

test('nginx serves robots.txt and sitemap.xml as files, not index.html', async () => {
  const conf = await readText('public/default.conf')
  for (const [location, type] of [
    ['/robots.txt', 'text/plain'],
    ['/sitemap.xml', 'application/xml'],
  ]) {
    const block = conf.match(new RegExp(`location = ${location.replace('.', '\\.')} \\{([^}]*)\\}`))
    assert.ok(block, `missing exact location for ${location}`)
    assert.match(block[1], new RegExp(`default_type ${type.replace('/', '\\/')};`))
    assert.match(block[1], /try_files \$uri =404;/)
  }
})
