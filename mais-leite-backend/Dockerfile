FROM php:8.3-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && docker-php-ext-install pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN echo 'variables_order = "EGPCS"' > /usr/local/etc/php/conf.d/env.ini

ENV PORT=8090
EXPOSE 8090

CMD php scripts/migrate.php && php scripts/seed.php && php -S 0.0.0.0:${PORT} -t public public/router.php
