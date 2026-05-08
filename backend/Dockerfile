FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    libpq-dev git unzip curl zip libicu-dev g++ make autoconf \
    && docker-php-ext-install pdo pdo_pgsql intl bcmath opcache \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts

COPY . .

# Ne jamais copier .env, Render injecte les variables directement
# Ne pas faire config:cache à la build
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 8000

# Lance le serveur HTTP en arrière-plan, le worker de queue et les services Reverb + MQTT.
# L'écouteur MQTT gère la reconnexion automatique au broker.
# Si l'un des processus s'arrête, le conteneur redémarre (Render le relance).
CMD sh -c "php artisan serve --host=0.0.0.0 --port=${PORT:-8000} & php artisan queue:work --tries=3 --backoff=30 & php artisan reverb:start --host=${REVERB_HOST:-0.0.0.0} --port=${REVERB_PORT:-8080} --scheme=${REVERB_SCHEME:-http} & php artisan mqtt:listen"