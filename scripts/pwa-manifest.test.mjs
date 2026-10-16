import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('vite.config.ts does not write its build manifest to the output root', async () => {
  const config = await readText('vite.config.ts')
  assert.doesNotMatch(config, /manifest:\s*true/)
  assert.match(config, /manifest:\s*'\.vite\/manifest\.json'/)
})

test('public/manifest.json is a valid PWA manifest with start_url and icons', async () => {
  const manifest = JSON.parse(await readText('public/manifest.json'))
  assert.equal(typeof manifest.start_url, 'string')
  assert.ok(manifest.start_url.length > 0)
  assert.ok(Array.isArray(manifest.icons))
  assert.ok(manifest.icons.length > 0)
  for (const icon of manifest.icons) {
    assert.equal(typeof icon.src, 'string')
    assert.equal(typeof icon.sizes, 'string')
  }
})
