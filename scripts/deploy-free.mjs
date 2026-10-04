import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { smokeStudy } from './smoke-study.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
process.chdir(root)
const account = process.env.CLOUDFLARE_ACCOUNT_ID
const token = process.env.CLOUDFLARE_API_TOKEN
if (!/^[a-f0-9]{32}$/.test(account || '') || !token) {
  console.error('Setup required: copy deploy/.env.example to deploy/.env and set CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN from a Workers Free account. Then rerun npm run deploy:free. No resources have been created.')
  process.exit(1)
}
const name = process.env.STUDY_APP_NAME || 'qwerty-study-plan'
if (!/^[a-z][a-z0-9-]{2,49}$/.test(name)) throw new Error('STUDY_APP_NAME must be 3–50 lowercase letters, digits or hyphens')
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: false, env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' } })
  if (result.status !== 0) throw new Error(`${command} failed; deployment stopped`)
}
async function api(path, method = 'GET', body, allowMissing = false) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${path}`, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000),
  })
  if (allowMissing && response.status === 404) return null
  const data = await response.json()
  if (!response.ok || !data.success) {
    // Never echo request headers or secrets.
    throw new Error(`Cloudflare ${method} ${path} failed (${response.status}): ${data.errors?.map((e) => e.message).join('; ') || 'unknown error'}`)
  }
  return data.result
}
// Build/test before any hosting mutation. Uses the repository's existing frozen yarn lock.
run('npm', ['ci', '--prefix', 'deploy', '--no-audit', '--no-fund'])
run('npx', ['--yes', 'yarn@1.22.22', 'install', '--frozen-lockfile'])
run('npm', ['run', 'test:backend'])
run('npm', ['run', 'build', '--', '--base=/'])
run(process.execPath, ['scripts/test-cloud-deploy.mjs'])
let subdomain = await api('/workers/subdomain', 'GET', undefined, true)
if (!subdomain?.subdomain) {
  const requested = process.env.STUDY_WORKERS_SUBDOMAIN || `${name}-${account.slice(0, 8)}`
  if (!requested || !/^[a-z][a-z0-9-]{2,49}$/.test(requested)) throw new Error('Choose STUDY_WORKERS_SUBDOMAIN in deploy/.env for this new account, then rerun')
  subdomain = await api('/workers/subdomain', 'PUT', { subdomain: requested })
}
const workerOrigin = `https://${name}.${subdomain.subdomain}.workers.dev`
const origin = process.env.STUDY_ORIGIN || workerOrigin
if (new URL(origin).origin !== origin || !origin.startsWith('https://')) throw new Error('STUDY_ORIGIN must be an exact HTTPS origin, without a trailing slash')
const template = JSON.parse(readFileSync('deploy/wrangler.json', 'utf8'))
const configPath = 'deploy/wrangler.production.json'
let databaseId = process.env.STUDY_D1_ID
if (existsSync(configPath)) {
  const old = JSON.parse(readFileSync(configPath, 'utf8'))
  if (old.account_id !== account || old.name !== name) throw new Error('Existing deployment config belongs to another account/app. Keep its identity or move it aside deliberately.')
  databaseId ||= old.d1_databases[0].database_id
}
if (!databaseId) {
  // Reuse by exact name on reruns, including interrupted first deployments.
  const databases = await api(`/d1/database?name=${encodeURIComponent(name)}&per_page=100`)
  databaseId = databases.find((db) => db.name === name)?.uuid
  if (!databaseId) databaseId = (await api('/d1/database', 'POST', { name })).uuid
}
if (!/^[a-f0-9-]{36}$/.test(databaseId)) throw new Error('Invalid D1 database ID')
const database = await api(`/d1/database/${databaseId}`)
if (database.name !== name) throw new Error('D1 database name does not match this app; refusing to migrate an unrelated database')
const config = {
  ...template, name, account_id: account,
  vars: { STUDY_ORIGIN: origin, STUDY_COOKIE_SECURE: 'true' },
  d1_databases: [{ ...template.d1_databases[0], database_name: name, database_id: databaseId }],
}
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n')
const wrangler = 'deploy/node_modules/wrangler/bin/wrangler.js'
run(process.execPath, [wrangler, 'd1', 'migrations', 'apply', 'DB', '--remote', '--config', configPath])
run(process.execPath, [wrangler, 'deploy', '--config', configPath])
// Public DNS/TLS may take a few seconds on the first deploy. Fail visibly if it never becomes healthy.
let healthy = false
for (let attempt = 0; attempt < 12; attempt++) {
  try { healthy = (await fetch(`${origin}/api/health`, { signal: AbortSignal.timeout(10000) })).ok } catch {}
  if (healthy) break
  await new Promise((r) => setTimeout(r, 5000))
}
if (!healthy) throw new Error(`Deployed but health check failed: ${origin}/api/health`)
await smokeStudy(origin)
writeFileSync('deploy/deployment.json', JSON.stringify({ origin, workerOrigin, databaseId, verifiedAt: new Date().toISOString() }, null, 2) + '\n')
console.log(`Verified public base URL: ${origin}\nStudy plan: ${origin}/study-plan\nSame-origin API: ${origin}/api/study-plan\nWorker upstream: ${workerOrigin}`)
