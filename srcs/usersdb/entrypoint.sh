#!/bin/sh
set -e

DB_PATH=${SQLITE_DB:-/data/app.db}

echo "🗄️  Starting Node.js + SQLite container..."

# Ensure the data directory exists
mkdir -p "$(dirname "$DB_PATH")"

echo "volume path set at :${DB_PATH}";
# Initialize DB if missing
if [ ! -f "$DB_PATH" ]; then
    echo "📦 Database not found. Initializing..."
    if [ -f /tmp/init.sql ]; then
        sqlite3 "$DB_PATH" < /tmp/init.sql
        echo "✅ Database initialized successfully!"
    else
        echo "⚠️  No init.sql found, creating empty database..."
        sqlite3 "$DB_PATH" "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT);"
    fi
else
    echo "✅ Database already exists, skipping initialization."
fi

# Optional: check DB contents
USER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo 0)
echo "📊 Database contains $USER_COUNT users"

# Start Node.js app
echo "🚀 Starting Node.js app..."
exec "$@"

