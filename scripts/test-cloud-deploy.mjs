import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { smokeCors } from './smoke-study-cors.mjs'
import { smokeStudy } from './smoke-study.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
process.chdir(root)
const directory = await mkdtemp(join(tmpdir(), 'qwerty-cloud-smoke-'))
const socket = createServer()
await new Promise((r) => socket.listen(0, '127.0.0.1', r))
const port = socket.address().port
await new Promise((r) => socket.close(r))
const base = `http://localhost:${port}`
const config = JSON.parse(await readFile('deploy/wrangler.json', 'utf8'))
config.main = resolve('deploy/worker.mjs')
config.assets.directory = resolve('build')
config.d1_databases[0].migrations_dir = resolve('deploy/migrations')
config.vars.STUDY_ORIGIN = base
config.vars.STUDY_METRICS_TOKEN = 'cloud-smoke-metrics-token'
const configPath = join(directory, 'wrangler.json')
await writeFile(configPath, JSON.stringify(config))
const wrangler = resolve('deploy/node_modules/wrangler/bin/wrangler.js')
const common = ['--config', configPath, '--persist-to', join(directory, 'state')]
const environment = { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false' }
let child, logs = ''
async function start() {
  child = spawn(process.execPath, [wrangler, 'dev', '--local', '--ip', '127.0.0.1', '--port', String(port), '--inspector-port', '0', ...common], {
    cwd: root, env: environment, stdio: ['ignore', 'pipe', 'pipe'], detached: process.platform !== 'win32',
  })
  child.stdout.on('data', (data) => { logs = (logs + data).slice(-16000) })
  child.stderr.on('data', (data) => { logs = (logs + data).slice(-16000) })
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error(`Worker exited: ${logs}`)
    try { if ((await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(1000) })).ok) return } catch {}
    await new Promise((r) => setTimeout(r, 200))
  }
  throw new Error(`Worker health timeout: ${logs}`)
}
async function stop() {
  if (!child || child.exitCode !== null) return
  const closed = new Promise((r) => child.once('exit', r))
  if (process.platform === 'win32') child.kill('SIGTERM')
  else process.kill(-child.pid, 'SIGTERM')
  await closed
}
try {
  const migration = spawnSync(process.execPath, [wrangler, 'd1', 'migrations', 'apply', 'DB', '--local', ...common], { cwd: root, env: environment, stdio: 'inherit' })
  if (migration.status !== 0) throw new Error('D1 migration failed')
  await start()
  const noMetrics = await fetch(`${base}/api/metrics`)
  if (noMetrics.status !== 401) throw new Error('Worker metrics endpoint must reject missing bearer token')
  const metrics = await fetch(`${base}/api/metrics`, {
    headers: {
      Authorization: 'Bearer cloud-smoke-metrics-token',
      'X-Request-ID': 'd1-metrics-smoke-0001',
    },
  })
  if (!metrics.ok || metrics.headers.get('x-request-id') !== 'd1-metrics-smoke-0001')
    throw new Error('Worker metrics endpoint failed authenticated request/request-id echo')
  if (!(await metrics.text()).includes('qwerty_study_http_requests_total'))
    throw new Error('Worker metrics response missing Prometheus counters')
  const session = join(directory, 'session.json')
  await smokeStudy(base, { saveSession: session, expectedSchemaVersion: 11 })
  // Real D1 endpoint round-trip: authenticated learner isolation and revision checks.
  const bootstrap = await fetch(`${base}/api/study-plan`, { headers: { Origin: base } })
  const mockCookie = bootstrap.headers.get('set-cookie')?.split(';')[0]
  if (!mockCookie) throw new Error('Full mock smoke: no session cookie')
  const at = Date.now()
  const mock = {
    version: 1, id: crypto.randomUUID(), phase: 'listening', createdAt: at, updatedAt: at,
    stageStartedAt: at, deadlineAt: at + 35 * 60 * 1000, completed: {},
    qcm: { listening: { answers: { 'co-01': 1 }, played: ['co-01'], index: 1 }, reading: { answers: {}, played: [], index: 0 } },
    writing: { taskIds: ['ee-t1-01', 'ee-t2-01', 'ee-t3-01'], texts: ['', '', ''], activeTask: 0,
      scores: { taskCompletion: 0, coherence: 0, vocabulary: 0, grammar: 0 } },
    speaking: { taskIds: ['eo-t1-01', 'eo-t2-01', 'eo-t3-01'], notes: ['', '', ''], durations: [0, 0, 0], activeTask: 0,
      scores: { fluency: 0, pronunciation: 0, vocabulary: 0, grammar: 0, taskCompletion: 0 } },
  }
  const putMock = (revision) => fetch(`${base}/api/study-plan/tcf-full-mock`, {
    method: 'PUT', headers: { Origin: base, Cookie: mockCookie, 'Content-Type': 'application/json' },
    body: JSON.stringify({ session: mock, revision }),
  })
  const firstPut = await putMock(0)
  if (firstPut.status !== 200 || (await firstPut.json()).revision !== 1) throw new Error('D1 mock PUT failed')
  if ((await putMock(0)).status !== 409) throw new Error('D1 mock revision conflict not enforced')
  const getMock = () => fetch(`${base}/api/study-plan/tcf-full-mock`, { headers: { Origin: base, Cookie: mockCookie } })
  const fetched = await (await getMock()).json()
  if (fetched.session?.qcm.listening.answers['co-01'] !== 1) throw new Error('D1 mock state was not persisted')
  await stop()
  await start()
  await smokeStudy(base, { resumeSession: session, expectedSchemaVersion: 11 })
  const restoredMock = await (await getMock()).json()
  if (restoredMock.revision !== 1 || restoredMock.session?.id !== mock.id) throw new Error('D1 full mock did not survive restart')
  await smokeCors(base, base)
  await stop()
  config.vars.STUDY_ORIGIN = 'https://frontend.example.invalid'
  config.vars.STUDY_COOKIE_SECURE = 'true'
  config.vars.STUDY_COOKIE_SAME_SITE = 'none'
  await writeFile(configPath, JSON.stringify(config))
  await start()
  await smokeCors(base, config.vars.STUDY_ORIGIN, { crossSite: true })
  const broken = spawnSync(process.execPath, [wrangler, 'd1', 'execute', 'DB', '--local', '--command', 'DROP TABLE mutations', ...common], { cwd: root, env: environment, stdio: 'pipe' })
  if (broken.status !== 0) throw new Error('Could not prepare readiness failure test')
  if ((await fetch(`${base}/health`)).status !== 503) throw new Error('Readiness ignored missing database schema')
  console.log('PASS: deployed Worker adapter + real local D1 + Passkey + metrics + CSV + SPA deep link + persistent restart')
} finally {
  await stop()
  await rm(directory, { recursive: true, force: true })
}
