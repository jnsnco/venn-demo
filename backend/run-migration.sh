#!/bin/bash
# Run migration as baro user
# Usage: ./run-migration.sh 002_make_first_user_admin.sql

if [ -z "$1" ]; then
  echo "Usage: $0 <migration-file.sql>"
  exit 1
fi

MIGRATION_FILE="$1"

if [ ! -f "migrations/$MIGRATION_FILE" ]; then
  echo "Migration file not found: migrations/$MIGRATION_FILE"
  exit 1
fi

# Extract password from DATABASE_URL in .env
if [ -f .env ]; then
  source <(grep DATABASE_URL .env)
  # Extract password from postgres://user:pass@host:port/db
  DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
else
  DB_PASSWORD="password"
fi

echo "Running migration: $MIGRATION_FILE"
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U venn -d venn -f "migrations/$MIGRATION_FILE"
