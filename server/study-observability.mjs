const statusClass = (status) => {
  const group = Math.floor(Number(status) / 100)
  return group >= 1 && group <= 5 ? `${group}xx` : 'other'
}

export function createStudyMetrics() {
  const state = {
    requests: new Map(),
    errors: 0,
    slow: 0,
    durationSeconds: 0,
    durationCount: 0,
  }

  return {
    observe(status, durationMs, slowThresholdMs = 1000) {
      const group = statusClass(status)
      state.requests.set(group, (state.requests.get(group) ?? 0) + 1)
      if (Number(status) >= 500) state.errors += 1
      if (durationMs >= slowThresholdMs) state.slow += 1
      state.durationSeconds += Math.max(0, durationMs) / 1000
      state.durationCount += 1
    },
    render() {
      const lines = [
        '# HELP qwerty_study_http_requests_total HTTP requests by status class.',
        '# TYPE qwerty_study_http_requests_total counter',
      ]
      for (const group of ['2xx','3xx','4xx','5xx','other'])
        lines.push(`qwerty_study_http_requests_total{status_class="${group}"} ${state.requests.get(group) ?? 0}`)
      lines.push(
        '# HELP qwerty_study_http_errors_total Server-side HTTP errors.',
        '# TYPE qwerty_study_http_errors_total counter',
        `qwerty_study_http_errors_total ${state.errors}`,
        '# HELP qwerty_study_http_slow_requests_total Requests at or above the slow-request threshold.',
        '# TYPE qwerty_study_http_slow_requests_total counter',
        `qwerty_study_http_slow_requests_total ${state.slow}`,
        '# HELP qwerty_study_http_request_duration_seconds Request duration.',
        '# TYPE qwerty_study_http_request_duration_seconds summary',
        `qwerty_study_http_request_duration_seconds_sum ${state.durationSeconds.toFixed(6)}`,
        `qwerty_study_http_request_duration_seconds_count ${state.durationCount}`,
      )
      return lines.join('\n') + '\n'
    },
    snapshot() {
      return {
        requests: Object.fromEntries(state.requests),
        errors: state.errors,
        slow: state.slow,
        durationSeconds: state.durationSeconds,
        durationCount: state.durationCount,
      }
    },
  }
}

export function studyRequestId(headers) {
  const supplied = headers?.get?.('x-request-id')
  return supplied && /^[A-Za-z0-9._:-]{8,128}$/.test(supplied) ? supplied : crypto.randomUUID()
}

export function logStudyRequest({ requestId, method, path, status, durationMs, storage, slowThresholdMs = 1000 }) {
  const payload = {
    timestamp: new Date().toISOString(),
    level: status >= 500 ? 'error' : durationMs >= slowThresholdMs ? 'warn' : 'info',
    event: status >= 500 ? 'http_error' : durationMs >= slowThresholdMs ? 'slow_request' : 'http_request',
    requestId,
    method,
    path,
    status,
    durationMs: Math.round(durationMs * 100) / 100,
    storage,
  }
  console.log(JSON.stringify(payload))
}

export function sanitizeBlockedUri(raw) {
  if (typeof raw !== 'string' || !raw) return ''
  const trimmed = raw.trim()
  if (['eval', 'inline', 'self', 'wasm-eval'].includes(trimmed)) return trimmed
  if (trimmed.startsWith('data:')) return 'data:'
  if (trimmed.startsWith('blob:')) return 'blob:'
  try {
    const url = new URL(trimmed)
    if (url.origin && url.origin !== 'null') return url.origin
    return url.protocol || ''
  } catch {
    return trimmed.split('?')[0].split('#')[0].slice(0, 100)
  }
}

export function sanitizeDocumentPath(raw) {
  if (typeof raw !== 'string' || !raw) return ''
  try {
    const url = new URL(raw, 'http://localhost')
    return url.pathname || '/'
  } catch {
    return raw.split('?')[0].split('#')[0].slice(0, 100) || '/'
  }
}

export function extractCspReportFields(body) {
  const report =
    body?.['csp-report'] ||
    (Array.isArray(body) ? body[0]?.body : null) ||
    (body && typeof body === 'object' ? body : {})
  const directive =
    report['violated-directive'] ||
    report['effective-directive'] ||
    report['violatedDirective'] ||
    report['effectiveDirective'] ||
    ''
  const blockedUri =
    report['blocked-uri'] ||
    report['blockedURI'] ||
    report['blockedURL'] ||
    report['blocked-url'] ||
    ''
  const documentUri =
    report['document-uri'] ||
    report['documentURI'] ||
    report['documentURL'] ||
    report['url'] ||
    ''
  return {
    directive: String(directive).trim(),
    blockedOrigin: sanitizeBlockedUri(blockedUri),
    documentPath: sanitizeDocumentPath(documentUri),
  }
}

export function logCspReport({ requestId, directive, blockedOrigin, documentPath }) {
  const payload = {
    timestamp: new Date().toISOString(),
    level: 'info',
    event: 'csp_report',
    requestId,
    directive: String(directive || '').slice(0, 100),
    blockedOrigin: String(blockedOrigin || '').slice(0, 200),
    documentPath: String(documentPath || '').slice(0, 200),
  }
  console.log(JSON.stringify(payload))
}

export function bearerMatches(header, token) {
  if (!token || typeof header !== 'string') return false
  const expected = 'Bearer ' + token
  if (header.length !== expected.length) return false
  let different = 0
  for (let index = 0; index < expected.length; index++)
    different |= header.charCodeAt(index) ^ expected.charCodeAt(index)
  return different === 0
}

export function loopbackAddress(value) {
  return value === '127.0.0.1' || value === '::1' || value === '::ffff:127.0.0.1'
}
