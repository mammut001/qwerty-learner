#!/usr/bin/env bash
# Run on the VM after cloning feature/study-plan. No credentials in arguments.
set -euo pipefail
cd "$(dirname "$0")/.."
env_file=deploy/.env.production
if [[ ! -f "$env_file" ]]; then
  echo 'Copy deploy/.env.production.example to deploy/.env.production and set STUDY_DOMAIN / ACME_EMAIL.' >&2
  exit 1
fi
compose=(docker compose --env-file "$env_file" -f docker-compose.yaml -f docker-compose.production.yaml)
"${compose[@]}" config --quiet
"${compose[@]}" up --build --detach --wait --wait-timeout 180
# Reuse the tested runtime image for the public HTTPS smoke; no host Node install.
public_origin=$("${compose[@]}" exec -T study-api node -p 'process.env.STUDY_ORIGIN')
for attempt in {1..24}; do
  if curl --fail --silent --max-time 10 "${public_origin}/api/health" >/dev/null; then
    docker run --rm -v "$PWD/scripts:/checks:ro" node:24-alpine node /checks/smoke-study.mjs "$public_origin"
    echo "Verified public base URL: ${public_origin}"
    exit 0
  fi
  sleep 5
done
echo "Containers started but HTTPS health check failed at ${public_origin}/api/health. Check DNS, ports 80/443, and Caddy logs." >&2
exit 1
