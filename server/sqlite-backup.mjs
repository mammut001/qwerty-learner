// Online SQLite backup includes committed WAL data. Never overwrite an existing backup.
import { DatabaseSync, backup } from 'node:sqlite'
import { chmodSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
process.umask(0o077)
const [source, destination] = process.argv.slice(2)
if (!source || !destination || resolve(source) === resolve(destination) || existsSync(destination))
  throw new Error('Usage: node server/sqlite-backup.mjs SOURCE NEW_DESTINATION (destination must not exist)')
const db = new DatabaseSync(source, { readOnly: true })
try {
  db.prepare('SELECT id,state FROM learners LIMIT 1').get()
  db.prepare('SELECT learner,id,payload FROM mutations LIMIT 1').get()
  await backup(db, destination)
  chmodSync(destination, 0o600)
  const check = new DatabaseSync(destination, { readOnly: true })
  try {
    if (check.prepare('PRAGMA quick_check').get().quick_check !== 'ok') throw new Error('Backup integrity check failed')
  } finally { check.close() }
  console.log('SQLite backup completed and integrity checked.')
} finally { db.close() }
