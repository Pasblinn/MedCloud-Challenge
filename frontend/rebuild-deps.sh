#!/bin/bash

echo "🧹 Limpando dependências antigas..."
rm -rf node_modules package-lock.json

echo "📦 Instalando dependências..."
npm install

echo "✅ Dependências reinstaladas com sucesso!"
