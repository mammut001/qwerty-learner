// Provider adapters for the Échelle scoring harness. Each adapter only turns
// `{ system, messages }` into the model's raw text; the harness owns the standard.
//
// Configuration (Node `process.env` or Worker `env`):
//   STUDY_AI_PROVIDER   openai | anthropic | mock   (unset = AI scoring disabled)
//   STUDY_AI_BASE_URL   OpenAI-compatible base URL (default https://api.openai.com/v1; works with
//                       DeepSeek, Qwen/DashScope, OpenRouter, Ollama, vLLM… )
//   STUDY_AI_API_KEY    API key
//   STUDY_AI_MODEL      model name
//   STUDY_AI_JSON_MODE  on | off — send response_format json_object (OpenAI-compatible only, default on)
//   STUDY_AI_TIMEOUT_MS request timeout, default 45000

import { CRITERION_IDS, countWords, frenchRatio } from './echelle-ai-harness.mjs'

const DEFAULT_TIMEOUT_MS = 45000

async function postJson(fetchImpl, url, headers, body, timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Provider HTTP ${response.status}`)
    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

export function openAiCompatibleProvider({ baseUrl = 'https://api.openai.com/v1', apiKey, model, jsonMode = true, timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch }) {
  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`
  return {
    name: 'openai-compatible',
    model,
    async complete({ system, messages }) {
      const data = await postJson(
        fetchImpl,
        url,
        apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        {
          model,
          temperature: 0,
          max_tokens: 2000,
          messages: [{ role: 'system', content: system }, ...messages],
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        },
        timeoutMs,
      )
      const content = data?.choices?.[0]?.message?.content
      if (typeof content !== 'string') throw new Error('Provider returned no content')
      return content
    },
  }
}

export function anthropicProvider({ baseUrl = 'https://api.anthropic.com/v1', apiKey, model, timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch }) {
  const url = `${baseUrl.replace(/\/+$/, '')}/messages`
  return {
    name: 'anthropic',
    model,
    async complete({ system, messages }) {
      const data = await postJson(
        fetchImpl,
        url,
        { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        { model, max_tokens: 2000, temperature: 0, system, messages },
        timeoutMs,
      )
      const content = Array.isArray(data?.content)
        ? data.content.filter((block) => block?.type === 'text').map((block) => block.text).join('')
        : ''
      if (!content) throw new Error('Provider returned no content')
      return content
    },
  }
}

const CONNECTORS = /\b(et|mais|parce que|donc|ensuite|puis|alors|quand|d'abord|enfin|cependant|pourtant|c'est pourquoi|de plus|en revanche|ainsi|bien que|même si|par contre|finalement)\b/gi

/**
 * Deterministic offline scorer for development, E2E tests and harness checks. It reads the
 * learner text out of the prompt like a real provider would and returns rubric-shaped JSON.
 */
export function mockProvider({ model = 'mock-heuristic-1' } = {}) {
  return {
    name: 'mock',
    model,
    async complete({ messages, rubric }) {
      const prompt = messages[0].content
      const match = /<production-([a-f0-9]+)>\n([\s\S]*)\n<\/production-\1>/.exec(prompt)
      const text = match ? match[2] : ''
      const sentences = text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.trim())
      const words = countWords(text)
      const french = frenchRatio(text) >= 0.12
      const connectors = new Set((text.match(CONNECTORS) ?? []).map((entry) => entry.toLowerCase())).size
      const distinct = new Set(text.toLowerCase().match(/[a-zà-ÿœæ']+/g) ?? []).size
      const minimum = rubric.task.wordMin ?? Math.max(3, Math.round((rubric.task.secondsMin ?? 10) / 4))
      const injected = /ignore|oublie|donne-moi|score\s*[:=]/i.test(text)
      const base = !french ? 0 : words >= minimum ? 3 : 2
      const expectedIds = rubric?.criteria ? rubric.criteria.map((c) => c.id) : CRITERION_IDS
      const scores = {
        tache: base,
        texte: !french ? 0 : rubric.level <= 2 || connectors >= Math.min(3, Math.ceil(rubric.level / 3)) ? base : 2,
        phrase: !french ? 0 : sentences.length >= Math.min(3, rubric.level) ? base : 2,
        lexique: !french ? 0 : distinct >= Math.min(words, 4 + rubric.level * 4) * 0.6 ? base : 2,
        phonologie: !french ? 0 : words >= minimum ? base : 2,
      }
      const evidence = (sentences[0] ?? text).slice(0, 120)
      return JSON.stringify({
        criteria: expectedIds.map((id) => ({
          id,
          score: scores[id] ?? base,
          evidence: (scores[id] ?? base) ? evidence : '',
          commentZh: (scores[id] ?? base) >= 3 ? '达到本级要求。' : '尚未达到本级要求。',
        })),
        estimatedLevel: Math.max(1, Math.min(12, rubric.level + (Object.values(scores).every((score) => score >= 3) ? 0 : -1))),
        feedbackZh: french ? '内容基本完成任务，继续加强连接词与句式变化。' : '请用法语完成任务。',
        strengthsZh: french ? ['能用法语表达主要信息'] : [],
        corrections: [],
        injectionDetected: injected,
      })
    },
  }
}

/** Builds the configured provider, or null when AI scoring is disabled. */
export function createAiProvider(env = {}, fetchImpl = globalThis.fetch) {
  const kind = String(env.STUDY_AI_PROVIDER || '').trim().toLowerCase()
  if (!kind) return null
  const timeoutMs = Number(env.STUDY_AI_TIMEOUT_MS) > 0 ? Number(env.STUDY_AI_TIMEOUT_MS) : DEFAULT_TIMEOUT_MS
  if (kind === 'mock') return mockProvider({ model: env.STUDY_AI_MODEL || undefined })
  if (!env.STUDY_AI_MODEL) throw new Error('STUDY_AI_MODEL is required when STUDY_AI_PROVIDER is set')
  if (kind === 'openai')
    return openAiCompatibleProvider({
      baseUrl: env.STUDY_AI_BASE_URL || undefined,
      apiKey: env.STUDY_AI_API_KEY || '',
      model: env.STUDY_AI_MODEL,
      jsonMode: String(env.STUDY_AI_JSON_MODE || 'on').toLowerCase() !== 'off',
      timeoutMs,
      fetchImpl,
    })
  if (kind === 'anthropic') {
    if (!env.STUDY_AI_API_KEY) throw new Error('STUDY_AI_API_KEY is required for the anthropic provider')
    return anthropicProvider({ baseUrl: env.STUDY_AI_BASE_URL || undefined, apiKey: env.STUDY_AI_API_KEY, model: env.STUDY_AI_MODEL, timeoutMs, fetchImpl })
  }
  throw new Error(`Unknown STUDY_AI_PROVIDER: ${kind}`)
}

/**
 * Spend guards, checked in order. Anyone can open a new anonymous learner, so the per-learner limit
 * alone cannot protect the API key: the per-IP and site-wide daily caps bound the total cost.
 */
export function aiRateLimits(env = {}) {
  const daily = Number(env.STUDY_AI_DAILY_LIMIT)
  return [
    { scope: 'learner', limit: 30, windowMs: 60 * 60_000, blockMs: 30 * 60_000 },
    { scope: 'actor', limit: 60, windowMs: 60 * 60_000, blockMs: 60 * 60_000 },
    { scope: 'global', limit: Number.isInteger(daily) && daily > 0 ? daily : 300, windowMs: 24 * 60 * 60_000, blockMs: 60 * 60_000 },
  ]
}

export function aiStatus(provider, rubricVersion) {
  return { enabled: Boolean(provider), provider: provider?.name ?? null, model: provider?.model ?? null, rubricVersion }
}
