# Public study-plan deployment

The recommended free path is **Cloudflare Workers Free + D1 + Workers static assets**. It serves the existing frontend and SQLite-compatible API at one HTTPS origin. D1 persists independently of Worker restarts and deployments. No roadmap layout or learning content changes are required.

This repository contains a deployment path, not a pre-provisioned public service. A Cloudflare account must own the resources; no hosting credentials are committed. The deployment command prints the actual public URL only after its public smoke test passes.

## One-command free deployment

1. [Create a free Cloudflare account](https://developers.cloudflare.com/fundamentals/account/create-account/) and verify its email. Open **Workers & Pages** and use **Workers Free**; do not upgrade to a paid plan. A custom domain is unnecessary: the script provisions a `workers.dev` address.
2. Copy the account ID from the account dashboard. Under **My Profile → API Tokens → Create Token → Custom token**, grant **Account / Workers Scripts / Edit**, **Account / D1 / Edit**, and **Account / Account Settings / Read**, restricted to this account. Store the token locally, never in Git or a PR. See [token instructions](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).
3. Install Node.js 24 and Git, then prepare this branch:

   ```bash
   git clone --branch feature/study-plan https://github.com/mammut001/qwerty-learner.git
   cd qwerty-learner
   cp deploy/.env.example deploy/.env
   ```

   Edit the ignored `deploy/.env` locally: set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`. The remaining defaults are sufficient. Keep `STUDY_APP_NAME` stable on later deploys; it identifies the Worker and database. If a requested account subdomain is unavailable, set `STUDY_WORKERS_SUBDOMAIN` to an available one.
4. Run:

   ```bash
   npm run deploy:free
   ```

The command installs pinned tooling, builds the frontend, tests the Node API and real local D1 persistence, finds or creates the D1 database, applies migrations, deploys assets and the Worker, and tests the public API. Rerun the same command to update it; existing D1 data is reused. It does not enable paid billing. Missing credentials fail before resource creation. Free-tier limits can cause requests to fail; consult current [Workers limits](https://developers.cloudflare.com/workers/platform/pricing/) and [D1 limits](https://developers.cloudflare.com/d1/platform/pricing/).

The verified URL and database ID are saved in ignored `deploy/deployment.json`. The address has the form `https://<app>.<account-subdomain>.workers.dev` (a template, not a live URL). Open `/study-plan` there. Keep the generated `deploy/wrangler.production.json` for subsequent deployments. If it is lost, the script also finds the database by exact name. Do not delete the D1 database to redeploy.

## Origin, cookies and frontend routing

The existing study-plan client requests **relative `/api/study-plan`**. Leave `VITE_STUDY_API_BASE_URL` empty for the recommended same-origin deployment. A separate remote API can be selected at build time as described below. The Worker serves `/api/*`; all other paths use static assets with SPA fallback. The script sets `STUDY_ORIGIN` to the actual public HTTPS origin and `STUDY_COOKIE_SECURE=true`. Session cookies are HttpOnly and SameSite Strict; cross-origin writes are rejected. Same-origin hosting needs no CORS handshake. For separate origins, both backends implement exact-origin credentialed CORS; wildcard origins are rejected.

Local Vite still proxies `/api` to `http://127.0.0.1:8787`. Run the Node backend with its default `STUDY_ORIGIN=http://localhost:5173`. The production Docker Nginx proxy sends `/api` to `http://study-api:8787` and serves the frontend at the same public origin.

If an existing public Nginx frontend must use the Worker API, adapt `nginx-public-api.conf.example`, replacing `STUDY_WORKER_HOST` with the deployed Worker hostname. Set `STUDY_ORIGIN` in `deploy/.env` to that **frontend** HTTPS origin and rerun deployment. Keep the browser's original Origin and Cookie headers; enable upstream TLS verification/SNI as shown. The deployment smoke then runs through that frontend, which must already serve this frontend build and proxy `/api`. GitHub Pages cannot provide this same-origin proxy; it can use the direct remote mode below if browser cookie policy permits it.

Browser identity starts with the site's cookie. Refreshes and server restarts preserve state. The study-plan page can generate a random 256-bit sync code; entering it on another device links that browser to the same learner. A linked device can detach into an independent copy, and the owner can revoke or rotate the generated code. Rotating invalidates the previous code, so already-linked devices must bind again with the new code. The server stores only sync-code hashes plus revocation state. Treat a live code like a password and keep it on trusted devices.

## Production Node SQLite + Nginx on an existing free VM

For a persistent VM, the production Compose overlay adds automatic public HTTPS via Caddy, health-gated startup, secure cookies, and the existing persistent SQLite volume. This option requires a VM and domain; it does not provision or purchase either. For example, [Oracle Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) offers eligible resources subject to signup verification and regional capacity. Select only resources explicitly marked Always Free and remain within its current limits; no paid upgrade is required by these scripts. Prefer Cloudflare above if no VM/domain exists.

On the VM:

1. Install Git, curl, Docker Engine and Docker Compose **v2.24 or newer**. Clone `feature/study-plan` using the command above.
2. Point your domain's A/AAAA records at this VM (remove stale AAAA records), and allow inbound TCP 80/443 in both the host firewall and provider security rules.
3. Copy `deploy/.env.production.example` to `deploy/.env.production`. Set `STUDY_DOMAIN` to the hostname only and `ACME_EMAIL` to your certificate contact email.
4. Run this one command from the repository:

   ```bash
   bash scripts/deploy-vm.sh
   ```

The script validates Compose, builds both images, starts services, waits for HTTPS and runs the public persistence/API smoke. Caddy forwards to Nginx; Nginx forwards `/api` to Node. The overlay derives `STUDY_ORIGIN=https://$STUDY_DOMAIN` and sets `STUDY_COOKIE_SECURE=true`. Ports 5173, 8787 and 8990 are not exposed by the production overlay. SQLite remains in `study-data`; certificates remain in Caddy volumes. Rerun the command after pulling branch updates. Never use `docker compose down -v` for upgrades.

Back up a running database with SQLite's backup API, or stop the API and copy the **entire** study-data volume, including any WAL files. Restore while the API is stopped. This deployment chunk does not add a user-facing backup service.

## Automated verification

`GET /health` and `GET /api/health` return JSON 200 only when both required database tables/columns are readable; unavailable storage or missing schema returns 503. Both aliases reject unsupported methods, disable caching, and never create a session. The Nginx and Worker routes reserve `/health` so SPA fallback cannot report a false healthy response. It exposes no study records.

```bash
npm run test:backend
npm ci --prefix deploy
npm run build -- --base=/
npm run test:cloud
# Against a deployed same-origin service:
npm run smoke:study -- https://YOUR-PUBLIC-HOST
```

The cloud test uses Wrangler's actual local D1 implementation, checks SPA routing and API behavior, plan settings, analytics/review state, stops and restarts the Worker against the same database, and verifies saved progress. The smoke covers migrations, analytics trends/rankings, SM-2 review scheduling, sync-code bind/unbind, concurrent/idempotent writes, restart persistence, browser isolation and rejected cross-origin writes. It creates a separate anonymous test identity; it does not alter another browser's records.

The `Study plan persistence` GitHub Actions workflow builds frontend and Node Docker images, validates the production overlay, exercises the Nginx→Node path, and checks persistence after an API restart. A separate job builds and tests the Worker with real local D1. Neither CI job needs hosting secrets or deploys paid resources. Docker image validation runs in CI; Docker is required to run that job locally.

## Separate frontend → remote Worker API

This mode still uses an anonymous learner rather than a login account. Cookie replay restores the same records after refresh; a new device can explicitly join the same learner with the study-plan sync code. No deployment API key belongs in frontend JavaScript.

1. In ignored `deploy/.env`, set `STUDY_REMOTE_API=true` and `STUDY_ORIGIN=https://YOUR-FRONTEND-HOST` (exact origin, no path/trailing slash). Run `npm run deploy:free`. It sets the Worker to `STUDY_COOKIE_SECURE=true`, `STUDY_COOKIE_SAME_SITE=none` and verifies the Worker API using the configured frontend Origin. Apply all checked-in D1 migrations. `0002_sync_keys.sql` adds portable sync-code mappings and `0003_sync_key_revocation.sql` adds revocation state/indexing. No additional schema change is required specifically for CORS.
2. Build the separately hosted frontend with the printed API origin:

   ```bash
   VITE_STUDY_API_BASE_URL=https://YOUR-APP.YOUR-SUBDOMAIN.workers.dev npm run build -- --base=/
   ```

   Or copy root `.env.example` to ignored `.env.local`, set only the Vite value, and rebuild. Vite replaces this **at build time**; changing container runtime environment does not change an already-built bundle. Docker accepts `--build-arg VITE_STUDY_API_BASE_URL=...`; Compose forwards the equivalent environment variable to the build. The value must be an HTTPS origin, with HTTP permitted only for localhost development. The client appends `/api/study-plan` and uses `credentials: include`.
3. Publish that `build/` directory on the existing frontend host. No roadmap layout change is involved. For GitHub Pages under a repository path, use its existing appropriate Vite `--base` instead of `/`; the API origin stays absolute.

The exact account step that cannot be performed without your Cloudflare connection is **My Profile → API Tokens → Create Token → Custom token → Continue to summary → Create Token**, scoped to the account and permissions listed above. Save it locally in `deploy/.env`; never paste it into this PR or chat. After the free account is linked, the single deploy command handles D1, migrations, the Worker and public API smoke. There is still no provisioned public URL in this repository.

Cross-site requests require HTTPS and `SameSite=None; Secure`. Browsers that block third-party cookies can still reject this mode even with correct CORS; the page reports the missing session and retains queued records locally instead of reporting a successful save. For reliable operation across browser privacy modes, use the default Worker-hosted same-origin frontend or the documented same-origin Nginx proxy. CORS allows exactly `STUDY_ORIGIN`, includes credentials and `Vary: Origin`, and accepts only GET/POST/PATCH plus validated OPTIONS preflight. Arbitrary origins, `null`, unexpected headers, and non-JSON writes are rejected. Anonymous session cookies stay HttpOnly and are never copied to localStorage. The separate user-generated sync code is intentionally shown to the user and cached locally so it can be copied to another trusted device.

Pending operations are scoped by API base so switching deployments cannot replay an old server's mutation queue against a different server. Already-saved browser snapshots remain available for first-use migration; changing API base is an intentional move to a different storage/identity boundary.

For a separate Node API, set the same `STUDY_ORIGIN`, `STUDY_COOKIE_SECURE=true`, and `STUDY_COOKIE_SAME_SITE=none` on the server behind HTTPS. Root `.env.example` is a template: direct `node server/study-plan.mjs` reads exported process variables, or start it with Node 24's `--env-file=.env.local`. Do not expose an HTTP production API.

## Credential-free, persistent Workers preview

From a Node 24 checkout, run exactly:

```bash
npm run preview:study
```

This installs locked dependencies, builds the same-origin frontend, applies all D1 migrations **locally**, and starts Wrangler at `http://localhost:8787/study-plan`. `/health` is available at that origin. No Cloudflare login, API token, payment or remote resource creation occurs. Stop with Ctrl+C and run the command again: records survive in ignored `deploy/.wrangler/state`. Open the same `localhost` hostname each time to retain the cookie. Do not delete that directory when checking restart persistence.

CI additionally builds with a nonempty remote API base, verifies that the compiled bundle contains it, checks credentialed CORS and refresh persistence against both Node and actual local D1, and deliberately removes a D1 table to verify readiness becomes 503. Existing Docker CI exercises both health aliases through Nginx and saved-state persistence after restart.

## Per-browser remote export and import

The existing learning-plan export button now flushes pending changes and downloads **server state**, in `{format:"qwerty-study-plan", version:5, schemaVersion:5, exportedAt, state}` JSON. It reports failure if the server is unavailable or queued changes remain; it does not silently substitute a local snapshot. The existing import picker/confirmation accepts this envelope and previous plain-state JSON files. Import replaces the current browser identity's plan atomically through the remote API. Offline imports stay in the durable mutation queue and retry after reconnect/reload. Layout and learning content are unchanged.

- `GET /api/study-plan/export`: requires the current session and an initialized plan. Returns only this identity's progress, never cookies or other users' records.
- `GET /api/study-plan/admin/config`: returns `{ enabled }` when `STUDY_ADMIN_TOKEN` (≥16 chars) is configured on the server/Worker.
- Institution placement rollup: `GET /api/study-plan/admin/placement-cohort` (+ optional `?cohortId=<uuid>`) and `.csv` variant. Cohort admin: `GET/POST /api/study-plan/admin/cohorts`, `POST /api/study-plan/admin/cohorts/rotate`. Learners join with `POST /api/study-plan/cohort/join` (`code` = 16-char invite). Requires `Authorization: Bearer <STUDY_ADMIN_TOKEN>` for admin routes. UI: `/admin/placement`; learners bind class on `/study-plan`.
- `GET /api/study-plan/echelle/ai`: returns `{ enabled, provider, model, rubricVersion }`. AI scoring is on when `STUDY_AI_PROVIDER` is set (`openai` for any OpenAI-compatible API, `anthropic`, or `mock` for offline dev/E2E) together with `STUDY_AI_MODEL`, `STUDY_AI_API_KEY` (a Worker secret), and optionally `STUDY_AI_BASE_URL`, `STUDY_AI_JSON_MODE=off` and `STUDY_AI_TIMEOUT_MS`. If the configuration is invalid, Node fails at startup and the Worker answers 503 `AI_MISCONFIGURED`.
- `POST /api/study-plan/echelle/evaluate` with `{ itemId, text, seconds?, inputMode? }`: scores one Échelle writing or speaking answer through the provider-agnostic harness (`server/echelle-ai-harness.mjs`), then writes the verdict into the learner's state server-side and returns `{ evaluation, state }`. Limited to 30 calls per learner per hour, 60 per client IP per hour, and `STUDY_AI_DAILY_LIMIT` (default 300) site-wide per 24 hours. Any of these returns `AI_RATE_LIMITED` with `scope` set to the limit that was hit, and the provider is never called. Answers shorter than the item's word or second minimum are rejected with `PRODUCTION_TOO_SHORT` before any provider is called. Provider failures return 502 `AI_UNAVAILABLE` or `AI_INVALID_OUTPUT`. While AI scoring is on, a writing or speaking self-assessment sent through `PATCH` is recorded but does not count as mastery, and clients cannot send the server-only `echelleEvaluation` operation. Run `node scripts/ai-calibrate.mjs` with the same env vars before switching providers.
- `GET /api/study-plan/analytics?today=YYYY-MM-DD`: returns server-derived day/week/month learning-time and accuracy trends, error rankings, plan completion/streaks, and review-due count.
- `GET /api/study-plan/review?today=YYYY-MM-DD`: builds the current learner's due vocabulary/grammar/conjugation review queue from backend error history and persisted SM-2 state.
- `GET /api/study-plan/sync`: reports whether this browser is currently bound through a sync code and how many share codes remain active.
- `POST /api/study-plan/sync-key`: rotates to one new portable sync code for the current initialized learner; older share codes are revoked and only hashes are stored server-side.
- `POST /api/study-plan/sync-key/revoke`: revokes a supplied active share code owned by the current learner.
- `POST /api/study-plan/link`: accepts a sync code, binds this browser session to that learner, and returns the full current state.
- `POST /api/study-plan/unlink`: detaches this browser into an independent learner while cloning its current state.
- `POST /api/study-plan/import`: same Origin/JSON/session requirements as other writes. Body is `{id:"UUID", backup:{format:"qwerty-study-plan",version:5,schemaVersion:5,state:{...}}}`. Initialize the session/plan through the ordinary GET/POST flow first. A repeated ID with identical contents is a no-op; reusing it with other contents is rejected. A retry after later edits returns current state instead of replaying the replacement.
- Invalid versions, oversized plans, invalid review payloads/dates/tasks/minutes and cross-origin writes are rejected without changing saved data. Node upgrades the sync-code table on startup; D1 applies `0002_sync_keys.sql` and `0003_sync_key_revocation.sql`.

Keep exported JSON private. It contains progress but no login secret. Import/export remains a point-in-time backup path. Continuous anonymous-device synchronization uses the sync-code bind flow; offline mutations are replayed after reconnect and mutable-field conflicts use latest-timestamp-wins.

## Operator backup / restore: Docker SQLite

A full database backup covers every anonymous identity and the deduplication ledger. It is separate from one-browser JSON export. With the production Compose command used by `scripts/deploy-vm.sh`, make a consistent online backup (including committed WAL changes):

```bash
docker compose --env-file deploy/.env.production -f docker-compose.yaml -f docker-compose.production.yaml exec study-api node server/sqlite-backup.mjs /data/study-plan.sqlite /tmp/study-backup.sqlite
docker compose --env-file deploy/.env.production -f docker-compose.yaml -f docker-compose.production.yaml cp study-api:/tmp/study-backup.sqlite ./study-backup.sqlite
```

The helper refuses an existing destination; use a new filename per backup. Store the resulting file outside the VM securely. `/tmp` is temporary: copy it before restarting the container. Do not commit database backups.

To restore, first stop the `study-api` service with the same Compose arguments. Save the entire existing `study-data` volume as a rollback copy. In a temporary maintenance container with that volume mounted, move **all three** existing `study-plan.sqlite`, `study-plan.sqlite-wal` and `study-plan.sqlite-shm` files out of the data directory (if present), then copy the verified standalone backup to `/data/study-plan.sqlite` and set its owner to the image's `node` user (UID 1000), mode 600. Never replace only the main file while retaining an old WAL or while Node is running. Start `study-api` again; verify `/api/health` and the same browser's progress. Keep the rollback volume until verification passes. A restore rolls back progress for every identity to the backup time; stop writes during restoration.

## Operator backup / restore: Cloudflare D1

Use the pinned Wrangler installed by the deploy command. These commands require the resource owner's existing local Cloudflare authorization; no secret is placed in command arguments. For a live database:

```bash
node --env-file=deploy/.env deploy/node_modules/wrangler/bin/wrangler.js d1 export DB --remote --config deploy/wrangler.production.json --output study-backup.sql
```

For the credential-free persistent local preview, replace `--remote --config deploy/wrangler.production.json` with `--local --config deploy/wrangler.json`.

Restore the SQL into a **new, empty** D1 database rather than dropping the live tables. Create that database with Wrangler `d1 create`, copy the production config to an ignored restore config, and change only its D1 database name/ID to the new database. Run:

```bash
node --env-file=deploy/.env deploy/node_modules/wrangler/bin/wrangler.js d1 execute DB --remote --config deploy/wrangler.restore.json --file study-backup.sql
```

Pause incoming writes, point the Worker binding at the restored database, and deploy that reviewed config with `wrangler deploy --config deploy/wrangler.restore.json`. Verify readiness and a known browser's progress before resuming traffic. Keep the original database and config for rollback. The normal deploy script intentionally refuses an unrelated database name; after a deliberate restore, keep using the reviewed restore config or explicitly reconcile its stable database identity before resuming the normal deploy script. Do not run migrations to create duplicate tables before importing the full SQL export. Never commit the SQL, credentials, or generated restore config.


## PWA and browser reminders

The frontend registers `public/sw.js` for same-origin PWA/offline shell support. The service worker never intercepts `/api/*`; API writes therefore cannot be satisfied by a stale cache. On registration the page warms the cache with the static resources already loaded, so the installed app can reopen its shell offline while study mutations remain in the browser's durable queue.

`public/default.conf` serves `/sw.js` with no-cache headers so deployed browsers can promptly revalidate worker updates. Browser notification permission is requested only from a user action. Reminder preferences are per-browser; synced plan settings remain part of the learner state.

The dedicated CI flow is:

```bash
npm run test:e2e:study
```

It runs Chromium against a local Vite frontend and Node SQLite API, exercises a real conjugation result, offline progress mutation/reload, reconnect replay, portable sync-code binding and the backend-powered Analysis page.

## Learning feature tables and migration 0004

Apply every checked-in D1 migration. `0004_learning_features.sql` adds:

- `error_book`: materialized unified vocabulary/grammar/conjugation error state and mastery streaks.
- `checkins`: automatic target-completion check-ins plus bounded manual makeup records.
- `achievements`: immutable unlocked milestone records.
- `weekly_reports`: persisted plan-week report history.
- `rate_limits`: sync-code brute-force / write throttling state.
- `audit_log`: hashed-actor audit events for sensitive operations.

The Node SQLite backend creates the equivalent additive schema on startup.

New API routes:

- `GET /api/study-plan/error-book?type=&status=active|mastered|all&from=&to=&limit=`
- `GET /api/study-plan/checkins?today=YYYY-MM-DD`
- `POST /api/study-plan/checkins/makeup` with `{"day":"YYYY-MM-DD"}`
- `GET /api/study-plan/achievements`
- `GET /api/study-plan/weekly-reports`
- `GET /api/study-plan/weekly-reports/export`
- `DELETE /api/study-plan/data` with `{"confirm":"DELETE"}`

Errors use stable top-level `code` values alongside the human-readable `error` string. The sync-link endpoint is actor-rate-limited and sync-key mutations are learner-rate-limited. Audit rows store only a hashed actor identifier and never raw credentials.

For Docker deployments, `STUDY_TRUST_PROXY_IP=true` is enabled only behind the shipped Nginx/Caddy chain. Caddy overwrites `X-Study-Client-IP` from the actual remote host and Nginx forwards that dedicated header to the Node API. Direct Node deployments should leave proxy trust disabled unless an equivalent trusted edge overwrites the header.

## Schema migration 0005 and analytics v5

Apply every checked-in D1 migration in order. The current chain is `0001` through `0010`; `0010_account_identities.sql` adds Google account identities and records `schema_version=10`. The Node SQLite backend creates/upgrades the equivalent table at startup. Both health aliases verify the current schema version before reporting readiness.

Backup envelopes emitted by v5 include `version:5` and `schemaVersion:5`; imports intentionally continue accepting versions 1 through 5. The frontend's first-sync migration consolidates legacy IndexedDB vocabulary history plus grammar/conjugation localStorage into the durable server queue and marks migration complete only after the queue drains.

`GET /api/study-plan/analytics` now also returns:

- `dashboard.heatmap`: 90 daily minute buckets;
- `dashboard.mastery`: vocabulary/grammar/conjugation known, mastered and active-error counts;
- `dashboard.projection`: planned/completed/remaining minutes, recent pace and predicted completion date;
- `today`: deterministic smart-task allocation constrained to the configured daily target.

These are derived from learner state rather than separate client-side calculations, so linked devices receive the same planning/statistics model.

## Google sign-in and account isolation

Google sign-in verifies Firebase ID tokens against Google JWKS public keys directly using WebCrypto (`node:crypto` / SubtleCrypto), without external JWT dependencies.

Backend configuration options / environment variables:
- `STUDY_FIREBASE_PROJECT_ID`: Firebase project ID (e.g. `tcf-canada-5b8c2`). Default is empty (Google sign-in disabled).
- `STUDY_AUTH_REQUIRED`: Set to `'true'` to require sign-in. When true, anonymous access is blocked (returns 401 `LOGIN_REQUIRED`), sync-code linking is disabled, and all data routes as well as dictionary / AI evaluation routes require an account session. Ignored when sign-in is disabled.
- `STUDY_ALLOWED_EMAILS`: Comma-separated list of allowed emails (case-insensitive). Default is empty (any Google account).
- `STUDY_MAX_NEW_ACCOUNTS_PER_DAY`: Global daily limit on newly created accounts via Google sign-in (default `200`).

