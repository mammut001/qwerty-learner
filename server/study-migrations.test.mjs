import assert from 'node:assert/strict'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'

test('D1 migration chain 0001 through 0006 applies cleanly and lands on schema v6', () => {
  const dir = mkdtempSync(join(tmpdir(), 'study-migrations-'))
  const database = join(dir, 'migrations.sqlite')
  const db = new DatabaseSync(database)
  try {
    const migrationDir = new URL('../deploy/migrations/', import.meta.url)
    const files = readdirSync(migrationDir)
      .filter((name) => /^\d{4}_.+\.sql$/.test(name))
      .sort()

    assert.deepEqual(
      files.map((name) => Number(name.slice(0, 4))),
      [1, 2, 3, 4, 5, 6],
      'migration numbers must stay contiguous and ordered',
    )

    for (const file of files) {
      const sql = readFileSync(new URL(file, migrationDir), 'utf8')
      assert.ok(sql.trim().length > 0, `${file} must not be empty`)
      db.exec(sql)
    }

    const schemaVersion = Number(
      db.prepare("SELECT value FROM schema_meta WHERE key='schema_version'").get()?.value,
    )
    assert.equal(schemaVersion, 6)

    const requiredTables = [
      'learners',
      'mutations',
      'sync_keys',
      'error_book',
      'checkins',
      'achievements',
      'weekly_reports',
      'rate_limits',
      'audit_log',
      'schema_meta',
      'accounts',
      'passkeys',
      'passkey_challenges',
      'account_sessions',
    ]
    const existing = new Set(
      db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name),
    )
    for (const table of requiredTables) assert.ok(existing.has(table), `missing table: ${table}`)

    const syncColumns = new Set(db.prepare('PRAGMA table_info(sync_keys)').all().map((row) => row.name))
    assert.ok(syncColumns.has('revoked'))

    const passkeyColumns = new Set(db.prepare('PRAGMA table_info(passkeys)').all().map((row) => row.name))
    for (const column of ['credential_id', 'account_id', 'public_key', 'algorithm', 'sign_count'])
      assert.ok(passkeyColumns.has(column), `missing passkey column: ${column}`)
  } finally {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  }
})
