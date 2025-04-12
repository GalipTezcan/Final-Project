#!/bin/bash

# Veritabanı bağlantısını bekle
echo "Waiting for postgres..."

while ! nc -z db 5432; do
  sleep 0.1
done

echo "PostgreSQL started"

# Redis bağlantısını bekle
echo "Waiting for redis..."

while ! nc -z redis 6379; do
  sleep 0.1
done

echo "Redis started"

# Veritabanı migrationlarını çalıştır
flask db upgrade

# Uygulamayı başlat
exec "$@" 