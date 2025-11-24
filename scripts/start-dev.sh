#!/usr/bin/env zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "📦 MOA - dev starter"

# 1) Check Postgres
echo "Checking PostgreSQL (pg_isready)..."
if command -v pg_isready >/dev/null 2>&1; then
  if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "✅ PostgreSQL appears to be running on localhost:5432"
  else
    echo "❌ PostgreSQL not responding on localhost:5432"
    echo "If you use Homebrew, try: brew services start postgresql@17"
    echo "Press ENTER to continue anyway, or Ctrl+C to abort"
    read
  fi
else
  echo "⚠️ pg_isready not found — skipping postgres health check"
fi

# 2) Ensure node deps installed
if [ ! -d "node_modules" ]; then
  echo "📥 Installing root dependencies (npm install)"
  npm install
else
  echo "✅ root node_modules present"
fi

echo "Installing workspace dependencies (will be noop if already installed)"
npm ci --workspaces --if-present || npm install --workspaces --if-present || true

# 3) Start frontend + backend concurrently (use npx to avoid requiring global install)
echo "🚀 Starting frontend and backend (concurrently)"

# Use npx concurrently so script works even if devDependency not installed globally
NPX_CMD="npx -y concurrently -k -n FRONT,BACK -c blue,green \"npm run -w frontend dev\" \"npm run -w backend dev\""

echo "Running: $NPX_CMD"
eval $NPX_CMD
