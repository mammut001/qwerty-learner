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

The existing study-plan client requests **relative `/api/study-plan`**. There is no frontend API-base variable to set for the recommended deployment. The Worker serves `/api/*`; all other paths use static assets with SPA fallback. The script sets `STUDY_ORIGIN` to the actual public HTTPS origin and `STUDY_COOKIE_SECURE=true`. Session cookies are HttpOnly and SameSite Strict; cross-origin writes are rejected. CORS is unnecessary for this same-origin path.

Local Vite still proxies `/api` to `http://127.0.0.1:8787`. Run the Node backend with its default `STUDY_ORIGIN=http://localhost:5173`. The production Docker Nginx proxy sends `/api` to `http://study-api:8787` and serves the frontend at the same public origin.

If an existing public Nginx frontend must use the Worker API, adapt `nginx-public-api.conf.example`, replacing `STUDY_WORKER_HOST` with the deployed Worker hostname. Set `STUDY_ORIGIN` in `deploy/.env` to that **frontend** HTTPS origin and rerun deployment. Keep the browser's original Origin and Cookie headers; enable upstream TLS verification/SNI as shown. The deployment smoke then runs through that frontend, which must already serve this frontend build and proxy `/api`. Do not point a GitHub Pages page directly at the Worker: Pages cannot provide this same-origin proxy.

Browser identity is tied to the site's cookie. Refreshes and server restarts preserve state, but clearing cookies or changing domains creates a new identity. Use the existing page export/import to move records to a new origin; there is no cross-device login in this deployment.

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

`GET /api/health` returns 200 only when the configured database is readable (including the D1 schema); unavailable storage returns 503. It exposes no study records.

```bash
npm run test:backend
npm ci --prefix deploy
npm run build -- --base=/
npm run test:cloud
# Against a deployed same-origin service:
npm run smoke:study -- https://YOUR-PUBLIC-HOST
```

The cloud test uses Wrangler's actual local D1 implementation, checks SPA routing and API behavior, stops and restarts the Worker against the same database, and verifies saved progress. The smoke checks migration, minutes, completion, concurrent increments, retry deduplication, browser isolation and rejected cross-origin writes. It creates a separate anonymous test identity; it does not alter another browser's records.

The `Study plan persistence` GitHub Actions workflow builds frontend and Node Docker images, validates the production overlay, exercises the Nginx→Node path, and checks persistence after an API restart. A separate job builds and tests the Worker with real local D1. Neither CI job needs hosting secrets or deploys paid resources. Docker image validation runs in CI; Docker is required to run that job locally.
