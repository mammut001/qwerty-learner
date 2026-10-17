import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  INTENSIVE_PASSAGES,
  ROUTE_SEO,
  emitRouteStaticFiles,
  escapeHtml,
  generateSitemapXml,
  passageDescription,
  passageTitle,
  renderPassageHtml,
  renderRouteHtml,
  titleForPath,
} from './route-meta.mjs'

const readRepoText = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8')

const SAMPLE_TEMPLATE = `<!DOCTYPE html>
<html lang="zh-Hans">
  <head>
    <meta charset="UTF-8" />
    <title>Default Site Title</title>
    <meta name="description" content="Default site description." />
    <link rel="canonical" href="https://french.paytonpei.top/" />
    <meta property="og:url" content="https://french.paytonpei.top/" />
    <meta property="og:title" content="Default Site Title" />
    <meta property="og:description" content="Default site description." />
    <meta name="twitter:title" content="Default Site Title" />
    <meta name="twitter:description" content="Default site description." />
  </head>
  <body>
    <noscript>
      <div>你需要启用 JavaScript 来运行 Qwerty Français。</div>
    </noscript>
    <div id="root"></div>
  </body>
</html>`

test('renderRouteHtml replaces title/description/canonical/og:url for a non-root route', () => {
  const tapRoute = ROUTE_SEO.find((item) => item.path === '/tap')
  assert.ok(tapRoute, 'ROUTE_SEO must contain /tap')

  const rendered = renderRouteHtml(SAMPLE_TEMPLATE, tapRoute, ROUTE_SEO)

  assert.match(rendered, /<title>点选模式·手机背法语单词 — TCF Canada 法语｜Qwerty Français<\/title>/)
  assert.match(rendered, /<meta name="description" content="专为手机与平板触摸屏设计的法语点选背词模式/)
  assert.match(rendered, /<link rel="canonical" href="https:\/\/french\.paytonpei\.top\/tap" \/>/)
  assert.match(rendered, /<meta property="og:url" content="https:\/\/french\.paytonpei\.top\/tap" \/>/)
  assert.match(rendered, /<meta property="og:title" content="点选模式·手机背法语单词 — TCF Canada 法语｜Qwerty Français" \/>/)
  assert.match(rendered, /<meta property="og:description" content="专为手机与平板触摸屏设计的法语点选背词模式/)
  assert.match(rendered, /<meta name="twitter:title" content="点选模式·手机背法语单词 — TCF Canada 法语｜Qwerty Français" \/>/)
  assert.match(rendered, /<meta name="twitter:description" content="专为手机与平板触摸屏设计的法语点选背词模式/)
})

test('renderRouteHtml preserves root existing title for "/" while updating intro, description, and canonical', () => {
  const rootRoute = ROUTE_SEO.find((item) => item.path === '/')
  assert.ok(rootRoute, 'ROUTE_SEO must contain /')

  const rendered = renderRouteHtml(SAMPLE_TEMPLATE, rootRoute, ROUTE_SEO)

  // Root title in template must be preserved without change
  assert.match(rendered, /<title>Default Site Title<\/title>/)
  assert.match(rendered, /<link rel="canonical" href="https:\/\/french\.paytonpei\.top\/" \/>/)
  assert.match(rendered, /<meta property="og:url" content="https:\/\/french\.paytonpei\.top\/" \/>/)
  assert.match(rendered, new RegExp(`<h1>${escapeHtml(rootRoute.h1)}<\\/h1>`))
  assert.match(rendered, new RegExp(`<p>${escapeHtml(rootRoute.intro)}<\\/p>`))
})

test('renderRouteHtml escapes HTML special chars in metadata and content', () => {
  const unsafeRoute = {
    path: '/unsafe?param=1&foo="bar"',
    title: 'Title <with> & "quotes" \'and\' tags',
    description: 'Description <with> & "quotes" \'and\' tags',
    h1: 'Header <with> & "quotes" \'and\' tags',
    intro: 'Intro <with> & "quotes" \'and\' tags',
  }
  const otherRoute = {
    path: '/other?a=1&b=2',
    title: 'Other <title> & "more"',
    description: 'desc',
    h1: 'h1',
    intro: 'intro',
  }

  const rendered = renderRouteHtml(SAMPLE_TEMPLATE, unsafeRoute, [unsafeRoute, otherRoute])

  // Verify escaped entities
  assert.ok(!rendered.includes('<with>'), 'Unescaped <with> should not appear in HTML')
  assert.match(rendered, /&lt;with&gt; &amp; &quot;quotes&quot; &#39;and&#39; tags/)
  assert.match(rendered, /<title>Title &lt;with&gt; &amp; &quot;quotes&quot; &#39;and&#39; tags<\/title>/)
  assert.match(rendered, /<h1>Header &lt;with&gt; &amp; &quot;quotes&quot; &#39;and&#39; tags<\/h1>/)
  assert.match(rendered, /<p>Intro &lt;with&gt; &amp; &quot;quotes&quot; &#39;and&#39; tags<\/p>/)
  assert.match(rendered, /<a href="\/other\?a=1&amp;b=2">Other &lt;title&gt; &amp; &quot;more&quot;<\/a>/)
})

test('renderRouteHtml includes h1/intro and links to the other main pages inside noscript', () => {
  const tapRoute = ROUTE_SEO.find((item) => item.path === '/tap')
  const rendered = renderRouteHtml(SAMPLE_TEMPLATE, tapRoute, ROUTE_SEO)

  assert.match(rendered, /<noscript>/)
  assert.match(rendered, /<h1>点选模式·手机背法语单词<\/h1>/)
  assert.match(rendered, /<p>专为移动设备优化的快速点选背词模式，随时随地利用碎片时间刷 TCF Canada 核心词汇。<\/p>/)
  assert.match(rendered, /<nav aria-label="页面导航">/)

  // Other main pages must be linked
  assert.match(rendered, /<a href="\/">/)
  assert.match(rendered, /<a href="\/typing">/)
  assert.match(rendered, /<a href="\/gallery">/)
  assert.match(rendered, /<a href="\/dictionary">/)
  assert.match(rendered, /<a href="\/conjugation">/)
  assert.match(rendered, /<a href="\/tenses">/)
  assert.match(rendered, /<a href="\/recalls">/)
  assert.match(rendered, /<a href="\/tcf-listening">/)
  assert.match(rendered, /<a href="\/video-listening">/)
  assert.match(rendered, /<a href="\/intensive-listening">/)
  assert.match(rendered, /<a href="\/tcf-reading">/)

  // Current page should not be self-linked in the other pages list
  assert.doesNotMatch(rendered, /<li><a href="\/tap">/)
})

test('every sitemap URL has a routeSeo entry with valid length, fields and no forbidden terms', async () => {
  const xml = await readRepoText('public/sitemap.xml')
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  assert.ok(locs.length > 0)

  const sitemapPaths = locs.map((loc) => {
    const url = new URL(loc)
    return url.pathname
  })

  const routeMap = new Map(ROUTE_SEO.map((item) => [item.path, item]))

  for (const pathname of sitemapPaths) {
    const entry = routeMap.get(pathname)
    assert.ok(entry, `Missing routeSeo entry for sitemap path: ${pathname}`)
    assert.ok(entry.title?.trim(), `Empty title for ${pathname}`)
    assert.ok(entry.h1?.trim(), `Empty h1 for ${pathname}`)
    assert.ok(entry.intro?.trim(), `Empty intro for ${pathname}`)

    // Description requirement: Chinese, 60–120 chars, specific to that page
    const descLen = entry.description.length
    assert.ok(
      descLen >= 60 && descLen <= 120,
      `Description for ${pathname} must be 60-120 chars, got ${descLen} chars: "${entry.description}"`,
    )

    // Hard rule: Never mention forbidden brand terms
    const forbiddenPattern = /\u6caa\u6c5f|\u7eff\u5b9d\u4e66/
    assert.doesNotMatch(entry.title, forbiddenPattern)
    assert.doesNotMatch(entry.description, forbiddenPattern)
    assert.doesNotMatch(entry.h1, forbiddenPattern)
    assert.doesNotMatch(entry.intro, forbiddenPattern)
  }
})

test('default.conf contains the new try_files with $uri $uri/index.html /index.html', async () => {
  const conf = await readRepoText('public/default.conf')
  const locationBlock = conf.match(/location \/ \{([^}]*)\}/)
  assert.ok(locationBlock, 'default.conf must contain location / block')
  assert.match(
    locationBlock[1],
    /try_files \$uri \$uri\/index\.html \/index\.html;/,
    'try_files in location / must be "$uri $uri/index.html /index.html;"',
  )
})

test('rendered route HTML for base "/" resolves icon and manifest links to root (no "./")', async () => {
  const indexHtml = await readRepoText('index.html')
  const intensiveRoute = ROUTE_SEO.find((item) => item.path === '/intensive-listening')
  assert.ok(intensiveRoute, 'ROUTE_SEO must contain /intensive-listening')

  const rendered = renderRouteHtml(indexHtml, intensiveRoute, ROUTE_SEO, '/')

  assert.match(rendered, /<link rel="icon" type="image\/png" sizes="32x32" href="\/favicon-32x32\.png" \/>/)
  assert.match(rendered, /<link rel="icon" href="\/favicon\.ico" \/>/)
  assert.match(rendered, /<link rel="apple-touch-icon" sizes="180x180" href="\/apple-touch-icon\.png" \/>/)
  assert.match(rendered, /<link rel="icon" type="image\/png" sizes="16x16" href="\/favicon-16x16\.png" \/>/)
  assert.match(rendered, /<link rel="manifest" href="\/manifest\.json" \/>/)
  assert.doesNotMatch(rendered, /href="\.\/favicon-32x32\.png"/)
  assert.doesNotMatch(rendered, /href="\.\/manifest\.json"/)
})

test('rendered route HTML preserves relative icon links for base "./" and prefixes for subpath base', async () => {
  const indexHtml = await readRepoText('index.html')
  const intensiveRoute = ROUTE_SEO.find((item) => item.path === '/intensive-listening')

  const renderedRelative = renderRouteHtml(indexHtml, intensiveRoute, ROUTE_SEO, './')
  assert.match(renderedRelative, /<link rel="icon" type="image\/png" sizes="32x32" href="\.\/favicon-32x32\.png" \/>/)

  const renderedSubpath = renderRouteHtml(indexHtml, intensiveRoute, ROUTE_SEO, '/qwerty-learner/')
  assert.match(renderedSubpath, /<link rel="icon" type="image\/png" sizes="32x32" href="\/qwerty-learner\/favicon-32x32\.png" \/>/)
})

test('per-passage HTML contains the canonical, escaped title, first sentence', () => {
  for (const passage of INTENSIVE_PASSAGES) {
    const html = renderPassageHtml(SAMPLE_TEMPLATE, passage, '/')
    const expectedTitle = escapeHtml(passageTitle(passage))
    const expectedCanonical = `https://french.paytonpei.top/intensive-listening/${passage.id}`
    const firstSentence = escapeHtml(passage.sentences[0].fr)

    assert.ok(html.includes(expectedCanonical), `canonical missing for passage ${passage.id}`)
    assert.ok(html.includes(expectedTitle), `escaped title missing for passage ${passage.id}`)
    assert.ok(html.includes(firstSentence), `first sentence missing for passage ${passage.id}`)

    // Check noscript contains h1 with title zh and titleFr
    assert.ok(
      html.includes(`<h1>${escapeHtml(passage.title)} — ${escapeHtml(passage.titleFr)}</h1>`),
      `h1 missing for passage ${passage.id}`,
    )
    // Check all French and Chinese translations are included
    for (const sent of passage.sentences) {
      assert.ok(html.includes(escapeHtml(sent.fr)), `french sentence missing: ${sent.fr}`)
      assert.ok(html.includes(escapeHtml(sent.zh)), `chinese translation missing: ${sent.zh}`)
    }
    // Check backlink to /intensive-listening
    assert.match(html, /<a href="\/intensive-listening">/)
  }
})

test('renderPassageHtml escapes HTML special characters in passage metadata and sentences', () => {
  const unsafePassage = {
    id: 'test-unsafe',
    title: 'Unsafe <title> & "more"',
    titleFr: 'Titre <fr> & "test"',
    level: 'B1',
    topic: 'Topic <topic> & "test"',
    sentences: [
      { fr: 'Sentence <1> & "fr"', zh: '句子 <1> & "中"' },
    ],
    vocab: [],
  }

  const html = renderPassageHtml(SAMPLE_TEMPLATE, unsafePassage, '/')
  assert.doesNotMatch(html, /<title>Unsafe <title>/)
  assert.doesNotMatch(html, /Titre <fr>/)
  assert.doesNotMatch(html, /Sentence <1>/)
  assert.match(html, /&lt;title&gt; &amp; &quot;more&quot;/)
  assert.match(html, /&lt;fr&gt; &amp; &quot;test&quot;/)
  assert.match(html, /&lt;1&gt; &amp; &quot;fr&quot;/)
})

test('sitemap contains every passage URL', async () => {
  const baseXml = await readRepoText('public/sitemap.xml')
  const buildDate = '2026-10-17'
  const xml = generateSitemapXml(baseXml, INTENSIVE_PASSAGES, buildDate)

  for (const passage of INTENSIVE_PASSAGES) {
    const expectedUrl = `https://french.paytonpei.top/intensive-listening/${passage.id}`
    assert.ok(xml.includes(`<loc>${expectedUrl}</loc>`), `missing URL for passage: ${passage.id}`)
    assert.ok(
      xml.includes(`<loc>${expectedUrl}</loc><lastmod>${buildDate}</lastmod>`),
      `missing lastmod buildDate for passage: ${passage.id}`,
    )
  }
})

test("base './' build writes no per-route folders", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pseo-test-relative-'))
  try {
    await fs.writeFile(path.join(tempDir, 'index.html'), SAMPLE_TEMPLATE, 'utf-8')
    const result = await emitRouteStaticFiles({
      outDirAbs: tempDir,
      resolvedBase: './',
      routes: ROUTE_SEO,
      passages: INTENSIVE_PASSAGES,
      baseSitemapPath: path.resolve('public/sitemap.xml'),
    })

    assert.equal(result.writtenRoutes.length, 0)
    assert.equal(result.writtenPassages.length, 0)
    const files = await fs.readdir(tempDir)
    assert.deepEqual(files, ['index.html'])
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})

test("base '/' build writes per-route folders, passage pages, and sitemap.xml", async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pseo-test-root-'))
  try {
    await fs.writeFile(path.join(tempDir, 'index.html'), SAMPLE_TEMPLATE, 'utf-8')
    const result = await emitRouteStaticFiles({
      outDirAbs: tempDir,
      resolvedBase: '/',
      routes: ROUTE_SEO,
      passages: INTENSIVE_PASSAGES,
      baseSitemapPath: path.resolve('public/sitemap.xml'),
      buildDate: '2026-10-17',
    })

    assert.ok(result.writtenRoutes.length > 0)
    assert.equal(result.writtenPassages.length, INTENSIVE_PASSAGES.length)
    assert.equal(result.sitemapWritten, true)

    for (const passage of INTENSIVE_PASSAGES) {
      const passageHtml = await fs.readFile(
        path.join(tempDir, 'intensive-listening', passage.id, 'index.html'),
        'utf-8',
      )
      assert.ok(passageHtml.includes(escapeHtml(passageTitle(passage))))
      assert.ok(passageHtml.includes(`https://french.paytonpei.top/intensive-listening/${passage.id}`))
      assert.ok(passageHtml.includes(escapeHtml(passage.sentences[0].fr)))
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
})

test('titleForPath returns passage title for /intensive-listening/:id', () => {
  for (const passage of INTENSIVE_PASSAGES) {
    assert.equal(
      titleForPath(`/intensive-listening/${passage.id}`),
      passageTitle(passage),
    )
    assert.equal(
      titleForPath(`/intensive-listening/${passage.id}/`),
      passageTitle(passage),
    )
  }
  assert.equal(
    titleForPath('/intensive-listening'),
    ROUTE_SEO.find((r) => r.path === '/intensive-listening')?.title,
  )
})
