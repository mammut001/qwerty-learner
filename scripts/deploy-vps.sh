#!/usr/bin/env bash
# Run on the VPS using its existing Compose override and environment.
set -euo pipefail
cd "$(dirname "$0")/.."
export BUILD_COMMIT_SHA=$(git rev-parse --short HEAD)
compose=(docker compose -f docker-compose.yaml -f docker-compose.vps.yaml)
"${compose[@]}" config --quiet
"${compose[@]}" up --detach --build --no-deps qwertylearner
echo "Deployed frontend build: $BUILD_COMMIT_SHA"
