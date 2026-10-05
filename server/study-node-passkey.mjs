import { createHash, randomBytes } from 'node:crypto'
import {
  passkeyAuthenticationOptions,
  passkeyRegistrationOptions,
  randomPasskeyValue,
  readPasskeyClientData,
  verifyPasskeyAuthentication,
  verifyPasskeyRegistration,
} from './study-passkey.mjs'

const hash = (value) => createHash('sha256').update(value).digest('hex')
const DAY_MS = 86400000
const CHALLENGE_MS = 5 * 60 * 1000

const cleanup = (db, now) => {
  db.prepare('DELETE FROM passkey_challenges WHERE expires_at<?').run(now)
  db.prepare('DELETE FROM account_sessions WHERE expires_at<?').run(now)
}

export function resolveNodeAccountSession(db, credentialHash, now = Date.now()) {
  cleanup(db, now)
  const session = db.prepare(`
    SELECT accounts.learner AS learner
    FROM account_sessions
    JOIN accounts ON accounts.id=account_sessions.account_id
    WHERE account_sessions.token_hash=? AND account_sessions.expires_at>?
  `).get(credentialHash, now)
  if (!session?.learner) return null
  const row = db.prepare('SELECT id,state FROM learners WHERE id=?').get(session.learner)
  return row ? { learner: session.learner, row, viaAccount: true } : null
}

export function nodePasskeyAccountInfo(db, learner, signedIn = false) {
  const account = db.prepare('SELECT id,created_at FROM accounts WHERE learner=?').get(learner)
  if (!account) return { registered: false, signedIn: false, passkeyCount: 0 }
  const passkeyCount = db.prepare('SELECT COUNT(*) AS count FROM passkeys WHERE account_id=?').get(account.id)?.count ?? 0
  return {
    registered: passkeyCount > 0,
    signedIn: Boolean(signedIn),
    passkeyCount,
    createdAt: account.created_at,
  }
}

export function createNodePasskeyRegistrationOptions(db, learner, origin, now = Date.now()) {
  cleanup(db, now)
  const rpId = new URL(origin).hostname
  const account = db.prepare('SELECT user_handle FROM accounts WHERE learner=?').get(learner)
  const userHandle = account?.user_handle ?? randomPasskeyValue(32)
  const challenge = randomPasskeyValue(32)
  db.prepare(`
    INSERT INTO passkey_challenges(challenge,purpose,learner,user_handle,expires_at,created_at)
    VALUES(?,?,?,?,?,?)
  `).run(challenge, 'register', learner, userHandle, now + CHALLENGE_MS, now)
  return passkeyRegistrationOptions({ challenge, rpId, userHandle })
}

const createAccountSession = (db, accountId, now) => {
  const sessionToken = randomBytes(32).toString('hex')
  db.prepare(`
    INSERT INTO account_sessions(token_hash,account_id,created_at,expires_at)
    VALUES(?,?,?,?)
  `).run(hash(sessionToken), accountId, now, now + 365 * DAY_MS)
  return sessionToken
}

export async function verifyNodePasskeyRegistration(db, learner, origin, credential, now = Date.now()) {
  cleanup(db, now)
  const clientData = readPasskeyClientData(credential?.response?.clientDataJSON)
  const challengeRow = db.prepare(`
    SELECT challenge,learner,user_handle,expires_at FROM passkey_challenges
    WHERE challenge=? AND purpose='register'
  `).get(clientData.challenge)
  if (!challengeRow || challengeRow.learner !== learner || challengeRow.expires_at <= now)
    throw new Error('PASSKEY_CHALLENGE_INVALID')

  const verified = await verifyPasskeyRegistration({
    credential,
    expectedChallenge: challengeRow.challenge,
    expectedOrigin: origin,
    expectedRpId: new URL(origin).hostname,
  })

  db.exec('BEGIN IMMEDIATE')
  try {
    let account = db.prepare('SELECT id,user_handle FROM accounts WHERE learner=?').get(learner)
    if (!account) {
      account = { id: randomBytes(16).toString('hex'), user_handle: challengeRow.user_handle }
      db.prepare('INSERT INTO accounts(id,learner,user_handle,created_at) VALUES(?,?,?,?)')
        .run(account.id, learner, account.user_handle, now)
    }
    const existing = db.prepare('SELECT account_id FROM passkeys WHERE credential_id=?').get(verified.credentialId)
    if (existing && existing.account_id !== account.id) throw new Error('PASSKEY_ALREADY_REGISTERED')
    db.prepare(`
      INSERT INTO passkeys(credential_id,account_id,public_key,algorithm,sign_count,transports,created_at,last_used_at)
      VALUES(?,?,?,?,?,?,?,?)
      ON CONFLICT(credential_id) DO UPDATE SET
        public_key=excluded.public_key,
        algorithm=excluded.algorithm,
        sign_count=excluded.sign_count,
        transports=excluded.transports,
        last_used_at=excluded.last_used_at
    `).run(
      verified.credentialId,
      account.id,
      verified.publicKey,
      verified.algorithm,
      verified.signCount,
      JSON.stringify(verified.transports),
      now,
      now,
    )
    db.prepare('DELETE FROM passkey_challenges WHERE challenge=?').run(challengeRow.challenge)
    const sessionToken = createAccountSession(db, account.id, now)
    db.exec('COMMIT')
    return { sessionToken, ...nodePasskeyAccountInfo(db, learner, true) }
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function createNodePasskeyLoginOptions(db, origin, now = Date.now()) {
  cleanup(db, now)
  const challenge = randomPasskeyValue(32)
  db.prepare(`
    INSERT INTO passkey_challenges(challenge,purpose,learner,user_handle,expires_at,created_at)
    VALUES(?,?,?,?,?,?)
  `).run(challenge, 'login', null, null, now + CHALLENGE_MS, now)
  return passkeyAuthenticationOptions({ challenge, rpId: new URL(origin).hostname })
}

export async function verifyNodePasskeyLogin(db, origin, credential, now = Date.now()) {
  cleanup(db, now)
  const clientData = readPasskeyClientData(credential?.response?.clientDataJSON)
  const challengeRow = db.prepare(`
    SELECT challenge,expires_at FROM passkey_challenges WHERE challenge=? AND purpose='login'
  `).get(clientData.challenge)
  if (!challengeRow || challengeRow.expires_at <= now) throw new Error('PASSKEY_CHALLENGE_INVALID')

  const record = db.prepare(`
    SELECT passkeys.credential_id,passkeys.account_id,passkeys.public_key,passkeys.algorithm,passkeys.sign_count,
           accounts.learner
    FROM passkeys JOIN accounts ON accounts.id=passkeys.account_id
    WHERE passkeys.credential_id=?
  `).get(credential.id)
  if (!record) throw new Error('PASSKEY_NOT_FOUND')

  const verified = await verifyPasskeyAuthentication({
    credential,
    publicKey: record.public_key,
    algorithm: record.algorithm,
    previousSignCount: record.sign_count,
    expectedChallenge: challengeRow.challenge,
    expectedOrigin: origin,
    expectedRpId: new URL(origin).hostname,
  })

  const learnerRow = db.prepare('SELECT id,state FROM learners WHERE id=?').get(record.learner)
  if (!learnerRow?.state) throw new Error('PASSKEY_LEARNER_NOT_FOUND')

  db.exec('BEGIN IMMEDIATE')
  try {
    db.prepare('UPDATE passkeys SET sign_count=?,last_used_at=? WHERE credential_id=?')
      .run(verified.signCount, now, record.credential_id)
    db.prepare('DELETE FROM passkey_challenges WHERE challenge=?').run(challengeRow.challenge)
    const sessionToken = createAccountSession(db, record.account_id, now)
    db.exec('COMMIT')
    return {
      sessionToken,
      learner: record.learner,
      state: JSON.parse(learnerRow.state),
      ...nodePasskeyAccountInfo(db, record.learner, true),
    }
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}
