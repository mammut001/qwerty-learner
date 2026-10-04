// Persistent local Workers + D1 preview. No account, token or remote mutation.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
process.chdir(fileURLToPath(new URL('..', import.meta.url)))
const env = { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false', VITE_STUDY_API_BASE_URL: '' }
function run(command, args) {
  const child = spawnSync(command, args, { stdio: 'inherit', env })
  if (child.status !== 0) process.exit(child.status || 1)
}
run('npm', ['ci', '--prefix', 'deploy', '--no-audit', '--no-fund'])
run('npx', ['--yes', 'yarn@1.22.22', 'install', '--frozen-lockfile'])
run('npm', ['run', 'build', '--', '--base=/'])
const cli = 'deploy/node_modules/wrangler/bin/wrangler.js'
const common = ['--config', 'deploy/wrangler.json']
run(process.execPath, [cli, 'd1', 'migrations', 'apply', 'DB', '--local', ...common])
console.log('Study plan: http://localhost:8787/study-plan; readiness: http://localhost:8787/health. Stop with Ctrl+C. D1 survives subsequent runs.')
run(process.execPath, [cli, 'dev', '--local', '--ip', '127.0.0.1', '--port', '8787', '--inspector-port', '0', ...common])
