#!/usr/bin/env bash
# /opt/apps/first_deploy.sh
set -euo pipefail

DOMAIN="sport-scheduler.com"         
API_HEALTH="https://${DOMAIN}/api/health"

cd /sports-scheduler-be

echo "[1/5] Build & start API..."
docker compose up -d api

echo "[2/5] Build web (bootstrap: skip asset download)"
docker compose build --build-arg SKIP_ASSET_DOWNLOAD=1 web

echo "[3/5] Start web (Caddy) so HTTPS and routing are up..."
docker compose up -d web

echo "[4/5] Wait for API over the domain to be reachable..."
until curl -fsS "${API_HEALTH}" >/dev/null; do
  echo "  - waiting for ${API_HEALTH} ..."
  sleep 3
done
echo "  - API is healthy."

echo "[5/5] Rebuild web normally (this runs download:assets) and deploy..."
# If your docker-compose.yml already sets build args for BACKEND_BASE/FOOTBALL_ENDPOINT, no need to pass them here.
docker compose build web
docker compose up -d web

echo "First deploy complete."
