#!/bin/sh
set -e

cd /var/www/html

# Make sure storage folders exist (matters when a volume is mounted over storage/)
mkdir -p storage/app/private storage/framework/cache storage/framework/sessions \
         storage/framework/views storage/logs bootstrap/cache

# Wait for MySQL
if [ -n "$DB_HOST" ]; then
  echo "Waiting for database at $DB_HOST:${DB_PORT:-3306}..."
  tries=0
  until php -r '
    try {
      new PDO(
        "mysql:host=".getenv("DB_HOST").";port=".(getenv("DB_PORT") ?: 3306).";dbname=".getenv("DB_DATABASE"),
        getenv("DB_USERNAME"),
        getenv("DB_PASSWORD")
      );
    } catch (Throwable $e) { exit(1); }
  ' 2>/dev/null; do
    tries=$((tries + 1))
    if [ "$tries" -ge 30 ]; then
      echo "Database not reachable after 30 tries, giving up."
      exit 1
    fi
    sleep 2
  done
  echo "Database is up."
fi

# Cache config/routes/views using the runtime .env values
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optional steps controlled by env vars
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force
fi

if [ "${RUN_SEED:-false}" = "true" ]; then
  php artisan db:seed --force
fi

# artisan ran as root, so hand ownership back to www-data
chown -R www-data:www-data storage bootstrap/cache

exec "$@"
