import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path, { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const scriptPath = path.join(repoRoot, 'deploy/backup-study-db.sh')

test('deploy/backup-study-db.sh exists and is executable', () => {
  assert.ok(fs.existsSync(scriptPath), 'deploy/backup-study-db.sh must exist')
  const stat = fs.statSync(scriptPath)
  assert.ok(stat.isFile(), 'deploy/backup-study-db.sh must be a regular file')
  assert.ok((stat.mode & 0o111) !== 0, 'deploy/backup-study-db.sh must be executable')
})

test('script passes syntax checks with sh -n and (if available) dash -n', () => {
  execFileSync('sh', ['-n', scriptPath])

  let hasDash = false
  try {
    execFileSync('dash', ['-c', 'exit 0'], { stdio: 'ignore' })
    hasDash = true
  } catch {
    // dash not installed, skip gracefully
  }

  if (hasDash) {
    execFileSync('dash', ['-n', scriptPath])
  }
})

test('script uses POSIX sh and set -eu', () => {
  const content = fs.readFileSync(scriptPath, 'utf8')
  assert.match(content, /^#!\/bin\/sh(\r?\n|$)/, 'must specify #!/bin/sh shebang')
  assert.match(content, /\bset\s+-eu\b/, 'must use set -eu')
})

test('script performs VACUUM INTO inside container via node:sqlite', () => {
  const content = fs.readFileSync(scriptPath, 'utf8')
  assert.match(content, /VACUUM\s+INTO/, 'must execute SQLite VACUUM INTO')
  assert.match(content, /node:sqlite/, 'must use node:sqlite inside container')
  assert.match(content, /docker\s+exec/, 'must run command inside running container')
  assert.match(content, /docker\s+cp/, 'must docker cp vacuumed database')
  assert.match(content, /qwerty-francais-study-api-1/, 'must default to qwerty-francais-study-api-1 container')
  assert.match(content, /\/data\/study-plan\.sqlite/, 'must target /data/study-plan.sqlite')
})

test('script verifies copy with PRAGMA integrity_check and row counts in throwaway container', () => {
  const content = fs.readFileSync(scriptPath, 'utf8')
  assert.match(content, /integrity_check/, 'must run PRAGMA integrity_check')
  assert.match(content, /docker\s+run\s+--rm/, 'must use throwaway container for verification')
  assert.match(content, /:\/b:ro/, 'must mount daily backups directory read-only to /b:ro')
  assert.match(content, /learners/, 'must count learners table rows')
  assert.match(content, /accounts/, 'must count accounts table rows')
})

test('script enforces 14-file retention and only deletes inside backups/daily', () => {
  const content = fs.readFileSync(scriptPath, 'utf8')
  assert.match(content, /gzip/, 'must gzip the backup file')
  assert.ok(content.includes('14') || content.includes('15'), 'must specify 14-file retention')
  assert.match(content, /tail\s+-n\s+\+15/, 'must keep 14 newest files using tail -n +15')

  // Check all rm commands in the script (ignoring flags like --rm)
  const lines = content.split('\n')
  const rmLines = lines.filter((line) => /(?:^|[\s;&|])rm\s+/.test(line) && !line.trim().startsWith('#'))
  assert.ok(rmLines.length > 0, 'must have rm commands for cleanup and pruning')

  for (const line of rmLines) {
    const isContainerCleanup = line.includes('CONTAINER_TMP')
    const isTargetCleanup = line.includes('TARGET_SQLITE')
    const isRetentionPrune = line.includes('rm -f "$file"')
    assert.ok(
      isContainerCleanup || isTargetCleanup || isRetentionPrune,
      `Unexpected rm command outside expected scope: ${line}`
    )
  }

  // Ensure retention prune pattern is strictly scoped to $BACKUP_DIR/study-*.sqlite.gz
  assert.match(
    content,
    /case\s+"\$file"\s+in\s+["']?\$BACKUP_DIR["']?\/study-\*\.sqlite\.gz\)/,
    'Deletion must be restricted to $BACKUP_DIR/study-*.sqlite.gz'
  )

  // Ensure no deletions reference parent directories or general backups root
  for (const line of rmLines) {
    assert.doesNotMatch(
      line,
      /(?:\.\.|\/backups\b(?!\/daily)|\$HOME\/backups\b(?!\/daily))/,
      `rm line must not target outside backups/daily: ${line}`
    )
  }
})

test('script logs one line per run to backup.log and exits non-zero on failure', () => {
  const content = fs.readFileSync(scriptPath, 'utf8')
  assert.match(content, /backup\.log/, 'must write to backup.log')
  assert.match(content, /trap.*EXIT/, 'must have EXIT trap for logging and cleanup')
  assert.match(content, /exit\s+"?\$trap_exit"?/, 'must exit with non-zero status on error')
})

test('script contains no network upload commands or leaked credentials', () => {
  const content = fs.readFileSync(scriptPath, 'utf8')
  assert.doesNotMatch(content, /\b(curl|wget|rsync|scp|s3|rclone|nc|ssh)\b/, 'must not perform network uploads')
  assert.doesNotMatch(content, /password|secret|token|api[_-]?key/i, 'must not contain secrets')
})

test('retention logic runs against temp dir with 16 fake files without docker', async () => {
  const tmpDir = await mkdtemp(join(tmpdir(), 'backup-test-'))
  try {
    const backupsDir = join(tmpDir, 'backups')
    const dailyDir = join(backupsDir, 'daily')
    await mkdir(dailyDir, { recursive: true })

    // Other files in ~/backups that must NEVER be touched
    const outsideFile = join(backupsDir, 'manual-backup.sqlite')
    await writeFile(outsideFile, 'manual backup')
    const outsideText = join(backupsDir, 'notes.txt')
    await writeFile(outsideText, 'important notes')

    // Logs in ~/backups/daily
    await writeFile(join(dailyDir, 'backup.log'), 'initial log\n')
    await writeFile(join(dailyDir, 'cron.log'), 'cron log\n')

    // Create 16 daily backups
    for (let i = 1; i <= 16; i++) {
      const day = String(i).padStart(2, '0')
      const fname = join(dailyDir, `study-202610${day}-0400.sqlite.gz`)
      await writeFile(fname, `content ${day}`)
      const time = new Date(`2026-10-${day}T04:00:00Z`)
      fs.utimesSync(fname, time, time)
    }

    // Run retention logic via script with BACKUP_TEST_ONLY=1
    execFileSync('sh', [scriptPath], {
      env: { ...process.env, BACKUP_TEST_ONLY: '1', BACKUP_DIR: dailyDir },
    })

    // Verify daily backup files
    const remaining = fs.readdirSync(dailyDir).filter((f) => f.startsWith('study-') && f.endsWith('.sqlite.gz'))
    assert.equal(remaining.length, 14, 'Must keep exactly 14 newest daily backups')

    // The 14 newest (days 03 to 16) should remain
    for (let i = 3; i <= 16; i++) {
      const day = String(i).padStart(2, '0')
      assert.ok(fs.existsSync(join(dailyDir, `study-202610${day}-0400.sqlite.gz`)), `Day ${day} should be kept`)
    }

    // The 2 oldest (days 01 and 02) should be deleted
    for (let i = 1; i <= 2; i++) {
      const day = String(i).padStart(2, '0')
      assert.ok(!fs.existsSync(join(dailyDir, `study-202610${day}-0400.sqlite.gz`)), `Day ${day} should be pruned`)
    }

    // Outside files and non-backup files must NOT be touched
    assert.ok(fs.existsSync(outsideFile), 'Outside files in ~/backups must be preserved')
    assert.ok(fs.existsSync(outsideText), 'Outside notes in ~/backups must be preserved')
    assert.ok(fs.existsSync(join(dailyDir, 'backup.log')), 'backup.log must be preserved')
    assert.ok(fs.existsSync(join(dailyDir, 'cron.log')), 'cron.log must be preserved')

    // Also test execution directly with dash if available
    let hasDash = false
    try {
      execFileSync('dash', ['-c', 'exit 0'], { stdio: 'ignore' })
      hasDash = true
    } catch {
      // dash not installed
    }

    if (hasDash) {
      // Re-create the 2 deleted files so count is 16 again
      for (let i = 1; i <= 2; i++) {
        const day = String(i).padStart(2, '0')
        const fname = join(dailyDir, `study-202610${day}-0400.sqlite.gz`)
        await writeFile(fname, `content ${day}`)
        const time = new Date(`2026-10-${day}T04:00:00Z`)
        fs.utimesSync(fname, time, time)
      }
      execFileSync('dash', [scriptPath], {
        env: { ...process.env, BACKUP_TEST_ONLY: '1', BACKUP_DIR: dailyDir },
      })
      const remainingDash = fs.readdirSync(dailyDir).filter((f) => f.startsWith('study-') && f.endsWith('.sqlite.gz'))
      assert.equal(remainingDash.length, 14, 'Must keep exactly 14 newest daily backups when run under dash')
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
})
