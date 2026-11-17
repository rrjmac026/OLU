# syntax=docker/dockerfile:1

# ---------- Base: PHP 8.3 + extensions ----------
FROM php:8.3-fpm-alpine AS base

ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN install-php-extensions pdo_mysql bcmath pcntl opcache exif intl zip

WORKDIR /var/www/html


# ---------- Composer dependencies ----------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --ignore-platform-reqs
COPY . .
RUN composer dump-autoload --no-dev --optimize --no-scripts


# ---------- Frontend build (Vite + Wayfinder needs PHP) ----------
FROM base AS assets
RUN apk add --no-cache nodejs npm
COPY --from=vendor /app /var/www/html
ENV APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
RUN npm ci && npm run build


# ---------- Final image: nginx + php-fpm + supervisord ----------
FROM base AS app

RUN apk add --no-cache nginx supervisor

COPY docker/php.ini /usr/local/etc/php/conf.d/app.ini
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Strip Windows line endings so the script runs on Linux
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh /etc/supervisord.conf /etc/nginx/http.d/default.conf /usr/local/etc/php/conf.d/app.ini \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

COPY --from=vendor /app /var/www/html
COPY --from=assets /var/www/html/public/build /var/www/html/public/build

RUN php artisan package:discover --ansi \
    && mkdir -p storage/app/private storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwX storage bootstrap/cache

# NOTE: do NOT run storage:link - uploads stay private on purpose.

EXPOSE 80 8080
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
