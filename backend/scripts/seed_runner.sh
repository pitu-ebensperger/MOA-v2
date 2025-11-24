#!/usr/bin/env bash
set -euo pipefail

# Run backend seeds in the recommended order: core -> admin -> demo
ROOT=$(cd "$(dirname "$0")/.." && pwd)
SEED_DIR="$ROOT/database/seed"

echo "Attempting to run npm workspace seed script (if available)..."
if npm run -w backend seed:all 2>/dev/null; then
  echo "npm seed script ran successfully"
  exit 0
fi

echo "npm seed script not found or failed; attempting to run JS seed files in order"

SCRIPT_ORDER=(
  "usersSeed.js"
  "configSeed.js"
  "clientsSeed.js"
  "categoriesSeed.js"
  "productsSeed.js"
  "addressesSeed.js"
  "cartsSeed.js"
  "wishlistsSeed.js"
  "ordersSeed.js"
)

for s in "${SCRIPT_ORDER[@]}"; do
  if [ -f "$SEED_DIR/$s" ]; then
    echo "Running seed: $s"
    node "$SEED_DIR/$s"
  else
    echo "Seed file not found: $s - skipping"
  fi
done

echo "Seeds finished."
