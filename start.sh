#!/bin/bash

# Script para iniciar Backend e Frontend simultaneamente
# Usa trap para garantir que ambos os processos sejam encerrados ao pressionar Ctrl+C

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🛒 Online Market - Iniciando servidores..."
echo "=========================================="
echo ""

# Função para cleanup ao sair
cleanup() {
    echo ""
    echo "Encerrando servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Iniciar backend em background
echo -e "${BLUE}[Backend]${NC} Iniciando em http://localhost:8080"
cd backend
yarn dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# Aguardar um pouco para o backend iniciar
sleep 2

# Voltar para a raiz e ir para o frontend
cd ..

# Iniciar frontend em background
echo -e "${GREEN}[Frontend]${NC} Iniciando em http://localhost:3000"
cd frontend
yarn dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}✓${NC} Servidores iniciados com sucesso!"
echo "=========================================="
echo ""
echo "📍 URLs:"
echo "   Backend:  http://localhost:8080"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📋 Logs:"
echo "   Backend:  backend.log"
echo "   Frontend: frontend.log"
echo ""
echo -e "${YELLOW}Pressione Ctrl+C para encerrar os servidores${NC}"
echo ""

# Mostrar logs em tempo real
tail -f backend.log frontend.log &
TAIL_PID=$!

# Aguardar indefinidamente
wait $BACKEND_PID $FRONTEND_PID
