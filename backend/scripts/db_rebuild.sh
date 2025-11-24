#!/usr/bin/env bash
set -euo pipefail

# Rebuild local 'moa' database from schema files. DESTRUCTIVE.
# Usage: ./db_rebuild.sh [--no-backup]

DIR=$(cd "$(dirname "$0")/.." && pwd)
BACKUP_DIR="$DIR/backups"
SCHEMA_DIR="$DIR/database/schema"

if [ "$1" = "--no-backup" ] 2>/dev/null; then
  DO_BACKUP=false
else
  DO_BACKUP=true
fi

mkdir -p "$BACKUP_DIR"

if [ "$DO_BACKUP" = true ]; then
  echo "Creating backup..."
  pg_dump -U postgres -Fc moa > "$BACKUP_DIR/moa-$(date +%F-%H%M).dump"
fi

echo "Dropping and creating database 'moa'..."
psql -U postgres -c "DROP DATABASE IF EXISTS moa;"
psql -U postgres -c "CREATE DATABASE moa;"

echo "Applying base schema..."
psql -U postgres -d moa -f "$SCHEMA_DIR/DDL_base.sql"

echo "Applying admin schema..."
psql -U postgres -d moa -f "$SCHEMA_DIR/DDL_admin.sql"

echo "Done. You can now run seeds with: backend/scripts/seed_runner.sh"
