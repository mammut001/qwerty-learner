import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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
  const session = join(directory, 'session.json')
  await smokeStudy(base, { saveSession: session })
  await stop()
  await start()
  await smokeStudy(base, { resumeSession: session })
  console.log('PASS: deployed Worker adapter + real local D1 + SPA deep link + persistent restart')
} finally {
  await stop()
  await rm(directory, { recursive: true, force: true })
}
