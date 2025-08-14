set -euo pipefail

cd /sports-scheduler-be

# run scraper
echo "[1/3] Scraping..."

timeout 3h docker run --rm \
  --env-file .env \
  -v /root/sports-scheduler-be/logs:/app/dist/logs \
  -v /root/sports-scheduler-be/data/flags.json:/app/dist/data/flags.json \
  scheduler-scraper
echo "[2/3] Building new web image (downloads assets during build)..."

# rebuild dev (mainly update logos)
docker compose build web

echo "[3/3] Deploying new web..."
docker compose up -d web

echo "Done."
