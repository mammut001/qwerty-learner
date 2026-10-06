import {
  passkeyAuthenticationOptions,
  passkeyRegistrationOptions,
  randomPasskeyValue,
  readPasskeyClientData,
  verifyPasskeyAuthentication,
  verifyPasskeyRegistration,
} from '../server/study-passkey.mjs'

const DAY_MS = 86400000
const CHALLENGE_MS = 5 * 60 * 1000
const hexToken = (size = 32) => Array.from(crypto.getRandomValues(new Uint8Array(size)), (byte) => byte.toString(16).padStart(2, '0')).join('')
const digest = async (value) =>
  Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')

const cleanup = async (db, now) => {
  await db.batch([
    db.prepare('DELETE FROM passkey_challenges WHERE expires_at<?').bind(now),
    db.prepare('DELETE FROM account_sessions WHERE expires_at<?').bind(now),
  ])
}

export async function resolveWorkerAccountSession(db, credentialHash, now = Date.now()) {
  await cleanup(db, now)
  const session = await db.prepare(`
    SELECT accounts.learner AS learner
    FROM account_sessions
    JOIN accounts ON accounts.id=account_sessions.account_id
    WHERE account_sessions.token_hash=? AND account_sessions.expires_at>?
  `).bind(credentialHash, now).first()
  if (!session?.learner) return null
  const row = await db.prepare('SELECT id,state,revision FROM learners WHERE id=?').bind(session.learner).first()
  return row ? { learner: session.learner, row, viaAccount: true } : null
}

export async function workerPasskeyAccountInfo(db, learner, signedIn = false) {
  const account = await db.prepare('SELECT id,created_at FROM accounts WHERE learner=?').bind(learner).first()
  if (!account) return { registered: false, signedIn: false, passkeyCount: 0 }
  const count = await db.prepare('SELECT COUNT(*) AS count FROM passkeys WHERE account_id=?').bind(account.id).first()
  return {
    registered: Number(count?.count ?? 0) > 0,
    signedIn: Boolean(signedIn),
    passkeyCount: Number(count?.count ?? 0),
    createdAt: account.created_at,
  }
}

export async function createWorkerPasskeyRegistrationOptions(db, learner, origin, now = Date.now()) {
  await cleanup(db, now)
  const account = await db.prepare('SELECT user_handle FROM accounts WHERE learner=?').bind(learner).first()
  const userHandle = account?.user_handle ?? randomPasskeyValue(32)
  const challenge = randomPasskeyValue(32)
  await db.prepare(`
    INSERT INTO passkey_challenges(challenge,purpose,learner,user_handle,expires_at,created_at)
    VALUES(?,?,?,?,?,?)
  `).bind(challenge, 'register', learner, userHandle, now + CHALLENGE_MS, now).run()
  return passkeyRegistrationOptions({ challenge, rpId: new URL(origin).hostname, userHandle })
}

const accountSession = async (db, accountId, now) => {
  const sessionToken = hexToken(32)
  const tokenHash = await digest(sessionToken)
  return {
    sessionToken,
    statement: db.prepare(`
      INSERT INTO account_sessions(token_hash,account_id,created_at,expires_at) VALUES(?,?,?,?)
    `).bind(tokenHash, accountId, now, now + 365 * DAY_MS),
  }
}

export async function verifyWorkerPasskeyRegistration(db, learner, origin, credential, now = Date.now()) {
  await cleanup(db, now)
  const clientData = readPasskeyClientData(credential?.response?.clientDataJSON)
  const challengeRow = await db.prepare(`
    SELECT challenge,learner,user_handle,expires_at FROM passkey_challenges
    WHERE challenge=? AND purpose='register'
  `).bind(clientData.challenge).first()
  if (!challengeRow || challengeRow.learner !== learner || challengeRow.expires_at <= now)
    throw new Error('PASSKEY_CHALLENGE_INVALID')

  const verified = await verifyPasskeyRegistration({
    credential,
    expectedChallenge: challengeRow.challenge,
    expectedOrigin: origin,
    expectedRpId: new URL(origin).hostname,
  })
  let account = await db.prepare('SELECT id,user_handle FROM accounts WHERE learner=?').bind(learner).first()
  const statements = []
  if (!account) {
    account = { id: hexToken(16), user_handle: challengeRow.user_handle }
    statements.push(
      db.prepare('INSERT INTO accounts(id,learner,user_handle,created_at) VALUES(?,?,?,?)')
        .bind(account.id, learner, account.user_handle, now),
    )
  }
  const existing = await db.prepare('SELECT account_id FROM passkeys WHERE credential_id=?').bind(verified.credentialId).first()
  if (existing && existing.account_id !== account.id) throw new Error('PASSKEY_ALREADY_REGISTERED')

  statements.push(
    db.prepare(`
      INSERT INTO passkeys(credential_id,account_id,public_key,algorithm,sign_count,transports,created_at,last_used_at)
      VALUES(?,?,?,?,?,?,?,?)
      ON CONFLICT(credential_id) DO UPDATE SET
        public_key=excluded.public_key,algorithm=excluded.algorithm,sign_count=excluded.sign_count,
        transports=excluded.transports,last_used_at=excluded.last_used_at
    `).bind(
      verified.credentialId, account.id, verified.publicKey, verified.algorithm, verified.signCount,
      JSON.stringify(verified.transports), now, now,
    ),
    db.prepare('DELETE FROM passkey_challenges WHERE challenge=?').bind(challengeRow.challenge),
  )
  const session = await accountSession(db, account.id, now)
  statements.push(session.statement)
  await db.batch(statements)
  return { sessionToken: session.sessionToken, ...(await workerPasskeyAccountInfo(db, learner, true)) }
}

export async function createWorkerPasskeyLoginOptions(db, origin, now = Date.now()) {
  await cleanup(db, now)
  const challenge = randomPasskeyValue(32)
  await db.prepare(`
    INSERT INTO passkey_challenges(challenge,purpose,learner,user_handle,expires_at,created_at)
    VALUES(?,?,?,?,?,?)
  `).bind(challenge, 'login', null, null, now + CHALLENGE_MS, now).run()
  return passkeyAuthenticationOptions({ challenge, rpId: new URL(origin).hostname })
}

export async function verifyWorkerPasskeyLogin(db, origin, credential, now = Date.now()) {
  await cleanup(db, now)
  const clientData = readPasskeyClientData(credential?.response?.clientDataJSON)
  const challengeRow = await db.prepare(`
    SELECT challenge,expires_at FROM passkey_challenges WHERE challenge=? AND purpose='login'
  `).bind(clientData.challenge).first()
  if (!challengeRow || challengeRow.expires_at <= now) throw new Error('PASSKEY_CHALLENGE_INVALID')

  const record = await db.prepare(`
    SELECT passkeys.credential_id,passkeys.account_id,passkeys.public_key,passkeys.algorithm,passkeys.sign_count,
           accounts.learner
    FROM passkeys JOIN accounts ON accounts.id=passkeys.account_id
    WHERE passkeys.credential_id=?
  `).bind(credential.id).first()
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
  const learnerRow = await db.prepare('SELECT id,state,revision FROM learners WHERE id=?').bind(record.learner).first()
  if (!learnerRow?.state) throw new Error('PASSKEY_LEARNER_NOT_FOUND')

  const session = await accountSession(db, record.account_id, now)
  await db.batch([
    db.prepare('UPDATE passkeys SET sign_count=?,last_used_at=? WHERE credential_id=?')
      .bind(verified.signCount, now, record.credential_id),
    db.prepare('DELETE FROM passkey_challenges WHERE challenge=?').bind(challengeRow.challenge),
    session.statement,
  ])
  return {
    sessionToken: session.sessionToken,
    learner: record.learner,
    state: JSON.parse(learnerRow.state),
    ...(await workerPasskeyAccountInfo(db, record.learner, true)),
  }
}
