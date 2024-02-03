# #!/bin/bash

# Exit on error
set -e

if [ -z "$1" ]; then
  echo "Error: Database URL not provided. Usage: $0 <database_url>"
  exit 1
fi

# Use the provided database URL
DEV_DATABASE_URL=$1

# Extract database credentials and connection details
DB_USER=$(echo $DEV_DATABASE_URL | grep -oP '(?<=://)([^:]+)')
DB_PASSWORD=$(echo $DEV_DATABASE_URL | grep -oP '(?<=://)[^:]+:\K[^@]+')
DB_HOST=$(echo $DEV_DATABASE_URL | grep -oP '(?<=@)([^:/]+)')
DB_PORT=$(echo $DEV_DATABASE_URL | grep -oP '(?<=:)([0-9]+)(?=/)')
DB_NAME=$(echo $DEV_DATABASE_URL | grep -oP '(?<=/)[^/]+$')

# Create Citus extension
echo "Creating Citus extension in the database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT -c "CREATE EXTENSION IF NOT EXISTS citus;"

#Create distribution column
psql $DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT -f distributionColumns.sql

echo "Citus extension setup complete."
