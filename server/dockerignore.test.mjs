import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dockerignorePath = path.join(repoRoot, '.dockerignore')

export function globToRegex(pattern) {
  const p = pattern.trim().replace(/^\/+/, '').replace(/\/+$/, '')
  let res = ''
  let i = 0
  while (i < p.length) {
    if (p.slice(i, i + 3) === '**/') {
      res += '(?:.*\\/)?'
      i += 3
    } else if (p.slice(i, i + 2) === '**') {
      res += '.*'
      i += 2
    } else if (p[i] === '*') {
      res += '[^\\/]*'
      i += 1
    } else if (p[i] === '?') {
      res += '[^\\/]'
      i += 1
    } else if ('[].+^$(){}|\\'.includes(p[i])) {
      res += '\\' + p[i]
      i += 1
    } else {
      res += p[i]
      i += 1
    }
  }
  return new RegExp('^' + res + '$')
}

export function parseDockerignore(content) {
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(line => {
      const isNegative = line.startsWith('!')
      const pattern = isNegative ? line.slice(1).trim() : line
      return {
        raw: line,
        pattern,
        isNegative,
        regex: globToRegex(pattern),
      }
    })
}

export function isPathIgnored(filePath, rules) {
  const normalized = filePath.replace(/^\/+/, '').replace(/\/+$/, '')
  const segments = normalized.split('/')
  const candidates = []
  for (let i = 1; i <= segments.length; i++) {
    candidates.push(segments.slice(0, i).join('/'))
  }
  let ignored = false
  let matchedRule = null
  for (const rule of rules) {
    if (candidates.some(candidate => rule.regex.test(candidate))) {
      ignored = !rule.isNegative
      matchedRule = rule.raw
    }
  }
  return { ignored, matchedRule }
}

test('no git-tracked files under src/ or server/ are excluded by .dockerignore', () => {
  const content = fs.readFileSync(dockerignorePath, 'utf8')
  const rules = parseDockerignore(content)

  const trackedOutput = execFileSync('git', ['ls-files', 'src', 'server'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  const files = trackedOutput
    .split(/\r?\n/)
    .map(f => f.trim())
    .filter(Boolean)

  const excluded = []
  for (const file of files) {
    const { ignored, matchedRule } = isPathIgnored(file, rules)
    if (ignored) {
      excluded.push({ file, matchedRule })
    }
  }

  assert.deepStrictEqual(
    excluded,
    [],
    `The following tracked source files are unexpectedly excluded by .dockerignore:\n` +
      excluded.map(e => `  - ${e.file} (matched rule: ${e.matchedRule})`).join('\n')
  )
})

test('no git-tracked files under public/ or scripts/ are excluded by .dockerignore', () => {
  const content = fs.readFileSync(dockerignorePath, 'utf8')
  const rules = parseDockerignore(content)

  const trackedOutput = execFileSync('git', ['ls-files', 'public', 'scripts'], {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  const files = trackedOutput
    .split(/\r?\n/)
    .map(f => f.trim())
    .filter(Boolean)

  const excluded = []
  for (const file of files) {
    const { ignored, matchedRule } = isPathIgnored(file, rules)
    if (ignored) {
      excluded.push({ file, matchedRule })
    }
  }

  assert.deepStrictEqual(
    excluded,
    [],
    `The following tracked files under public/ or scripts/ are unexpectedly excluded by .dockerignore:\n` +
      excluded.map(e => `  - ${e.file} (matched rule: ${e.matchedRule})`).join('\n')
  )
})

test('runtime data and sqlite files outside src remain excluded', () => {
  const content = fs.readFileSync(dockerignorePath, 'utf8')
  const rules = parseDockerignore(content)

  const runtimePaths = [
    'data/study-plan.sqlite',
    'data/records.json',
    'server/data/app.sqlite',
    'runtime/data/state.db',
    'study-plan.sqlite',
    'study-plan.sqlite-journal',
    'src/data.sqlite',
  ]

  for (const p of runtimePaths) {
    const { ignored, matchedRule } = isPathIgnored(p, rules)
    assert.strictEqual(
      ignored,
      true,
      `Expected runtime path "${p}" to be ignored, but it was not (matched rule: ${matchedRule})`
    )
  }

  const { ignored: tensesIgnored } = isPathIgnored('src/resources/tenses/data/index.ts', rules)
  assert.strictEqual(
    tensesIgnored,
    false,
    'Expected src/resources/tenses/data/index.ts to be included in docker context'
  )
})

test('study-api production image copies the full-mock server dependency', () => {
  const dockerfile = fs.readFileSync(path.join(repoRoot, 'server/Dockerfile'), 'utf8')
  assert.ok(
    dockerfile.includes('server/study-full-mock.mjs') || /COPY\s+server\/\*\.mjs\s+\.\/server\//.test(dockerfile),
    'full-mock runtime module must be shipped with the study-api container'
  )
})

test('study-api production image copies all server runtime modules imported by study-plan.mjs', () => {
  const dockerfile = fs.readFileSync(path.join(repoRoot, 'server/Dockerfile'), 'utf8')
  assert.match(
    dockerfile,
    /COPY\s+server\/\*\.mjs\s+\.\/server\//,
    'Dockerfile must copy server/*.mjs to include all runtime modules'
  )

  const visited = new Set()
  const queue = [path.join(repoRoot, 'server/study-plan.mjs')]
  const importedModules = new Set()

  while (queue.length > 0) {
    const current = queue.shift()
    if (visited.has(current)) continue
    visited.add(current)

    const content = fs.readFileSync(current, 'utf8')
    const importRegex = /(?:from\s+['"](\.[^'"]+)['"]|import\s*\(\s*['"](\.[^'"]+)['"]\))/g
    let match
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1] || match[2]
      const resolved = path.resolve(path.dirname(current), importPath)
      if (resolved.startsWith(path.join(repoRoot, 'server')) && resolved.endsWith('.mjs')) {
        importedModules.add(resolved)
        queue.push(resolved)
      }
    }
  }

  assert.ok(importedModules.size > 0, 'Should find imported runtime modules in study-plan.mjs')
  const usesGlob = /COPY\s+server\/\*\.mjs\s+\.\/server\//.test(dockerfile)
  for (const modulePath of importedModules) {
    const rel = path.relative(repoRoot, modulePath)
    if (rel.startsWith('server/echelle-variants/')) {
      assert.ok(
        dockerfile.includes('server/echelle-variants/'),
        `Expected ${rel} to be covered by server/echelle-variants/ COPY in Dockerfile`
      )
    } else {
      assert.ok(
        usesGlob || dockerfile.includes(rel),
        `Expected ${rel} to be covered by Dockerfile COPY instructions`
      )
    }
  }
})

