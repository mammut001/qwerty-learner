function isLoopbackOrPrivate(hostname) {
  return (
    ['localhost', '127.0.0.1', '[::1]'].includes(hostname) ||
    /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/.test(hostname)
  )
}

export function studyPolicy({ origin, secure, sameSite = 'strict' }, { method, headers }, health = false) {
  const responseHeaders = { Vary: 'Origin', 'Cache-Control': 'no-store' }
  const originList = String(origin || '').split(',').map((s) => s.trim()).filter(Boolean)
  if (originList.length === 0) return { status: 503, headers: responseHeaders }

  for (const o of originList) {
    let url
    try { url = new URL(o) } catch { return { status: 503, headers: responseHeaders } }
    if (url.origin !== o || !(url.protocol === 'https:' || (url.protocol === 'http:' && isLoopbackOrPrivate(url.hostname))) ||
        !['strict', 'none'].includes(sameSite) || (sameSite === 'none' && !secure))
      return { status: 503, headers: responseHeaders }
  }

  const requestOrigin = headers.get('origin')
  const isMatch = requestOrigin && originList.includes(requestOrigin)

  if ((requestOrigin && !isMatch) || (headers.get('sec-fetch-site') === 'cross-site' && sameSite !== 'none'))
    return { status: 403, headers: responseHeaders }
  if (isMatch) {
    responseHeaders['Access-Control-Allow-Origin'] = requestOrigin
    responseHeaders['Access-Control-Allow-Credentials'] = 'true'
  }
  const methods = health ? ['GET'] : ['GET', 'POST', 'PATCH', 'DELETE']
  if (method === 'OPTIONS') {
    const requested = (headers.get('access-control-request-headers') || '').toLowerCase().split(',').map((value) => value.trim()).filter(Boolean)
    if (!isMatch || !methods.includes(headers.get('access-control-request-method')) || requested.some((name) => name !== 'content-type'))
      return { status: 403, headers: responseHeaders }
    return { status: 204, headers: { ...responseHeaders, 'Access-Control-Allow-Methods': methods.join(', '), 'Access-Control-Allow-Headers': 'Content-Type' } }
  }
  if (!methods.includes(method)) return { status: 405, headers: { ...responseHeaders, Allow: methods.join(', ') } }
  if (method !== 'GET' && (!isMatch || headers.get('content-type')?.split(';')[0] !== 'application/json'))
    return { status: 403, headers: responseHeaders }
  return { headers: responseHeaders }
}

export function sessionCookie(token, { secure, sameSite = 'strict' }) {
  return `study_session=${token}; Path=/api; HttpOnly; SameSite=${sameSite === 'none' ? 'None' : 'Strict'}; Max-Age=31536000${secure ? '; Secure' : ''}`
}
