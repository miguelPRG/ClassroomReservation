#!/usr/bin/env bash

set -e

if ! command -v npm &> /dev/null; then
    echo "npm não encontrado. Por favor, instale Node.js"
    exit 1
fi

echo "Instalando dependências..."
npm install

echo "Iniciando servidor de desenvolvimento..."
npm run dev