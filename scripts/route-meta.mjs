import fs from 'node:fs/promises'
import path from 'node:path'
import { INTENSIVE_PASSAGES } from '../src/resources/intensiveListening.ts'
import { ROUTE_SEO, passageTitle, titleForPath } from '../src/resources/routeSeo.ts'

export { ROUTE_SEO, ROUTE_SEO as routeSeo, INTENSIVE_PASSAGES, passageTitle, titleForPath }

export const SITE_ORIGIN = 'https://french.paytonpei.top'

export function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function setMetaAttribute(html, attrName, attrValue, content) {
  const escapedContent = escapeHtml(content)
  const regex = new RegExp(`<meta(?=[^>]*\\b${attrName}=["']${attrValue}["'])[^>]*>`, 'i')
  if (regex.test(html)) {
    return html.replace(regex, `<meta ${attrName}="${attrValue}" content="${escapedContent}" />`)
  }
  return html.replace(/<\/head>/i, `    <meta ${attrName}="${attrValue}" content="${escapedContent}" />\n  </head>`)
}

function setCanonical(html, url) {
  const escapedUrl = escapeHtml(url)
  const regex = /<link(?=[^>]*\brel=["']canonical["'])[^>]*>/i
  if (regex.test(html)) {
    return html.replace(regex, `<link rel="canonical" href="${escapedUrl}" />`)
  }
  return html.replace(/<\/head>/i, `    <link rel="canonical" href="${escapedUrl}" />\n  </head>`)
}

export function setTitle(html, title) {
  const escapedTitle = escapeHtml(title)
  const regex = /<title[\s\S]*?<\/title>/i
  if (regex.test(html)) {
    return html.replace(regex, `<title>${escapedTitle}</title>`)
  }
  return html.replace(/<\/head>/i, `    <title>${escapedTitle}</title>\n  </head>`)
}

/**
 * Rewrites relative icon and manifest links (e.g. ./favicon-32x32.png, ./manifest.json)
 * to resolve against the app base on every route.
 * For relative base ('./') the hrefs are left relative.
 *
 * @param {string} html
 * @param {string} [base='/']
 * @returns {string}
 */
export function resolveRelativeIconLinks(html, base = '/') {
  if (!html || base === './') return html
  const prefix = base.endsWith('/') ? base : `${base}/`
  return html.replace(
    /(<link\s+[^>]*?\bhref=["'])\.\/(favicon[^"']*|apple-touch-icon[^"']*|manifest\.(?:json|webmanifest))(["'])/gi,
    `$1${prefix}$2$3`,
  )
}

export function renderRouteHtml(html, route, allRoutes = ROUTE_SEO, base = '/') {
  if (!html || !route) return html

  let result = resolveRelativeIconLinks(html, base)
  const normalizedPath = route.path === '/' ? '/' : (route.path.startsWith('/') ? route.path : `/${route.path}`)
  const canonicalUrl = `${SITE_ORIGIN}${normalizedPath}`

  // 1. Title and title-related tags:
  // Root index.html keeps its existing title without modification.
  if (route.path !== '/') {
    result = setTitle(result, route.title)
    result = setMetaAttribute(result, 'property', 'og:title', route.title)
    result = setMetaAttribute(result, 'name', 'twitter:title', route.title)
  }

  // 2. Meta descriptions
  if (route.description) {
    result = setMetaAttribute(result, 'name', 'description', route.description)
    result = setMetaAttribute(result, 'property', 'og:description', route.description)
    result = setMetaAttribute(result, 'name', 'twitter:description', route.description)
  }

  // 3. Canonical and URL meta tags
  result = setCanonical(result, canonicalUrl)
  result = setMetaAttribute(result, 'property', 'og:url', canonicalUrl)

  // 4. noscript block with h1, intro, and links to the other main pages
  let noscriptBlock = route.customNoscript
  if (!noscriptBlock) {
    const otherRoutes = (allRoutes || []).filter((r) => r.path !== route.path)
    const linkItems = otherRoutes
      .map((r) => `        <li><a href="${escapeHtml(r.path)}">${escapeHtml(r.title || r.h1 || r.path)}</a></li>`)
      .join('\n')

    noscriptBlock = [
      '    <noscript>',
      '      <div>你需要启用 JavaScript 来运行 Qwerty Français。</div>',
      `      <h1>${escapeHtml(route.h1)}</h1>`,
      `      <p>${escapeHtml(route.intro)}</p>`,
      '      <nav aria-label="页面导航">',
      '        <ul>',
      linkItems,
      '        </ul>',
      '      </nav>',
      '    </noscript>',
    ].filter(Boolean).join('\n')
  }

  if (/<noscript[\s\S]*?<\/noscript>/i.test(result)) {
    result = result.replace(/<noscript[\s\S]*?<\/noscript>/i, noscriptBlock.trim())
  } else if (/<div\s+id=["']root["'][^>]*>/i.test(result)) {
    result = result.replace(/<div\s+id=["']root["'][^>]*>/i, `${noscriptBlock.trim()}\n    $&`)
  } else if (/<body>/i.test(result)) {
    result = result.replace(/<body>/i, `<body>\n${noscriptBlock}`)
  } else {
    result += `\n${noscriptBlock}`
  }

  return result
}

export function passageDescription(passage, maxLen = 110) {
  const firstSentence = passage?.sentences?.[0]?.fr ?? ''
  const topic = passage?.topic || ''
  const level = passage?.level || ''
  const raw = topic && level ? `${topic}（${level}）：${firstSentence}`.trim() : firstSentence
  if (raw.length <= maxLen) return raw
  return `${raw.slice(0, maxLen - 1)}…`
}

export function renderPassageHtml(html, passage, base = '/') {
  if (!html || !passage) return html

  const title = passageTitle(passage)
  const description = passageDescription(passage)
  const canonicalPath = `/intensive-listening/${passage.id}`

  const sentencesHtml = (passage.sentences || [])
    .map(
      (s) =>
        `        <p>${escapeHtml(s.fr)}</p>\n        <p>${escapeHtml(s.zh)}</p>`,
    )
    .join('\n')

  const h1Text = passage.titleFr ? `${passage.title} — ${passage.titleFr}` : passage.title

  const customNoscript = [
    '    <noscript>',
    '      <div>你需要启用 JavaScript 来运行 Qwerty Français。</div>',
    `      <h1>${escapeHtml(h1Text)}</h1>`,
    sentencesHtml,
    '      <nav aria-label="页面导航">',
    '        <ul>',
    '          <li><a href="/intensive-listening">返回精听</a></li>',
    '        </ul>',
    '      </nav>',
    '    </noscript>',
  ].join('\n')

  const route = {
    path: canonicalPath,
    title,
    description,
    customNoscript,
  }

  return renderRouteHtml(html, route, [], base)
}

export function generateSitemapXml(
  baseXmlOrRoutes,
  passages = INTENSIVE_PASSAGES,
  buildDate = new Date().toISOString().slice(0, 10),
) {
  let staticEntries = ''
  if (typeof baseXmlOrRoutes === 'string') {
    const trimmed = baseXmlOrRoutes.trim()
    if (/<\/urlset>/i.test(trimmed)) {
      const passageEntries = (passages || [])
        .map(
          (p) =>
            `  <url><loc>${SITE_ORIGIN}/intensive-listening/${escapeHtml(p.id)}</loc><lastmod>${buildDate}</lastmod></url>`,
        )
        .join('\n')
      return trimmed.replace(/\s*<\/urlset>\s*$/i, `\n${passageEntries}\n</urlset>\n`)
    }
  } else if (Array.isArray(baseXmlOrRoutes)) {
    staticEntries = baseXmlOrRoutes
      .map((r) => {
        const path = r.path === '/' ? '/' : (r.path.startsWith('/') ? r.path : `/${r.path}`)
        return `  <url><loc>${SITE_ORIGIN}${escapeHtml(path)}</loc><lastmod>${buildDate}</lastmod></url>`
      })
      .join('\n')
  }

  const passageEntries = (passages || [])
    .map(
      (p) =>
        `  <url><loc>${SITE_ORIGIN}/intensive-listening/${escapeHtml(p.id)}</loc><lastmod>${buildDate}</lastmod></url>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticEntries ? staticEntries + '\n' : ''}${passageEntries}\n</urlset>\n`
}

export async function emitRouteStaticFiles({
  outDirAbs,
  resolvedBase = '/',
  routes = ROUTE_SEO,
  passages = INTENSIVE_PASSAGES,
  baseSitemapPath,
  buildDate = new Date().toISOString().slice(0, 10),
  fsMod = fs,
}) {
  if (resolvedBase !== '/') {
    return { writtenRoutes: [], writtenPassages: [], sitemapWritten: false }
  }

  const indexPath = path.resolve(outDirAbs, 'index.html')
  let baseHtml
  try {
    baseHtml = await fsMod.readFile(indexPath, 'utf-8')
  } catch {
    return { writtenRoutes: [], writtenPassages: [], sitemapWritten: false }
  }

  const writtenRoutes = []
  for (const route of routes) {
    const transformedHtml = renderRouteHtml(baseHtml, route, routes, resolvedBase)
    if (route.path === '/') {
      await fsMod.writeFile(indexPath, transformedHtml, 'utf-8')
      writtenRoutes.push('/')
    } else {
      const routeDir = path.resolve(outDirAbs, route.path.replace(/^\/+/, ''))
      await fsMod.mkdir(routeDir, { recursive: true })
      await fsMod.writeFile(path.resolve(routeDir, 'index.html'), transformedHtml, 'utf-8')
      writtenRoutes.push(route.path)
    }
  }

  const writtenPassages = []
  for (const passage of passages) {
    const passageHtml = renderPassageHtml(baseHtml, passage, resolvedBase)
    const passageDir = path.resolve(outDirAbs, 'intensive-listening', passage.id)
    await fsMod.mkdir(passageDir, { recursive: true })
    await fsMod.writeFile(path.resolve(passageDir, 'index.html'), passageHtml, 'utf-8')
    writtenPassages.push(passage.id)
  }

  let sitemapWritten = false
  if (baseSitemapPath) {
    try {
      const baseSitemapXml = await fsMod.readFile(baseSitemapPath, 'utf-8')
      const fullSitemapXml = generateSitemapXml(baseSitemapXml, passages, buildDate)
      await fsMod.writeFile(path.resolve(outDirAbs, 'sitemap.xml'), fullSitemapXml, 'utf-8')
      sitemapWritten = true
    } catch (err) {
      console.error('Failed to generate sitemap.xml', err)
    }
  }

  return { writtenRoutes, writtenPassages, sitemapWritten }
}

export default renderRouteHtml
