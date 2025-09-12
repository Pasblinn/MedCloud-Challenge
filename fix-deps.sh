#!/bin/bash

echo "🔧 Resolvendo problema do date-fns..."

# Parar containers
echo "📦 Parando containers..."
docker-compose down

# Remover imagens do frontend
echo "🗑️ Removendo imagens antigas..."
docker rmi medcloud-frontend:latest 2>/dev/null || true

# Limpar cache do Docker
echo "🧹 Limpando cache..."
docker system prune -f

# Reconstruir frontend
echo "🔨 Reconstruindo frontend..."
docker-compose build --no-cache frontend

# Iniciar containers
echo "🚀 Iniciando containers..."
docker-compose up -d

echo "✅ Processo concluído!"
echo "📊 Verificando logs..."
sleep 5
docker-compose logs frontend --tail=10
