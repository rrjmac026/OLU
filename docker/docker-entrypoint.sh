#!/bin/sh
set -e

cd /var/www/html

mkdir -p storage/app/private storage/framework/cache storage/framework/sessions \
         storage/framework/views storage/logs bootstrap/cache

# Wait for the database (mysql or pgsql, chosen by DB_CONNECTION)
if [ -n "$DB_HOST" ]; then
  echo "Waiting for database at $DB_HOST..."
  tries=0
  until php -r '
    try {
      $driver = getenv("DB_CONNECTION") ?: "mysql";
      $port = getenv("DB_PORT") ?: ($driver === "pgsql" ? 5432 : 3306);
      $dsn = $driver.":host=".getenv("DB_HOST").";port=".$port.";dbname=".getenv("DB_DATABASE");
      if ($driver === "pgsql") { $dsn .= ";sslmode=".(getenv("DB_SSLMODE") ?: "prefer"); }
      new PDO($dsn, getenv("DB_USERNAME"), getenv("DB_PASSWORD"));
    } catch (Throwable $e) { fwrite(STDERR, $e->getMessage()."\n"); exit(1); }
  '; do
    tries=$((tries + 1))
    if [ "$tries" -ge 30 ]; then
      echo "Database not reachable after 30 tries, giving up."
      exit 1
    fi
    sleep 2
  done
  echo "Database is up."
fi

php artisan config:cache
php artisan route:cache
php artisan view:cache

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  php artisan migrate --force
fi

if [ "${RUN_SEED:-false}" = "true" ]; then
  php artisan db:seed --force
fi

chown -R www-data:www-data storage bootstrap/cache

exec "$@"
