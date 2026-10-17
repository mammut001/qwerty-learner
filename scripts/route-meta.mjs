import { ROUTE_SEO } from '../src/resources/routeSeo.ts'

export { ROUTE_SEO, ROUTE_SEO as routeSeo }

const SITE_ORIGIN = 'https://french.paytonpei.top'

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

function setTitle(html, title) {
  const escapedTitle = escapeHtml(title)
  const regex = /<title[\s\S]*?<\/title>/i
  if (regex.test(html)) {
    return html.replace(regex, `<title>${escapedTitle}</title>`)
  }
  return html.replace(/<\/head>/i, `    <title>${escapedTitle}</title>\n  </head>`)
}

export function renderRouteHtml(html, route, allRoutes = ROUTE_SEO) {
  if (!html || !route) return html

  let result = html
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
  const otherRoutes = (allRoutes || []).filter((r) => r.path !== route.path)
  const linkItems = otherRoutes
    .map((r) => `        <li><a href="${escapeHtml(r.path)}">${escapeHtml(r.title || r.h1 || r.path)}</a></li>`)
    .join('\n')

  const noscriptBlock = [
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

export default renderRouteHtml
