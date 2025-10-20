#!/bin/bash

# Script de setup automatizado para Online Market
# Este script configura e inicia o projeto completo

set -e  # Para em caso de erro

echo "🛒 Online Market - Setup Automatizado"
echo "======================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar se Node.js está instalado
info "Verificando pré-requisitos..."
if ! command -v node &> /dev/null; then
    error "Node.js não encontrado. Por favor, instale Node.js 18 ou superior."
    exit 1
fi
success "Node.js $(node -v) encontrado"

# Verificar se Yarn está instalado
if ! command -v yarn &> /dev/null; then
    warning "Yarn não encontrado. Instalando Yarn..."
    npm install -g yarn
    success "Yarn instalado com sucesso"
else
    success "Yarn $(yarn -v) encontrado"
fi

echo ""
info "Configurando Backend..."
echo "------------------------"

# Navegar para o backend
cd backend

# Instalar dependências do backend
info "Instalando dependências do backend..."
yarn install
success "Dependências do backend instaladas"

# Verificar se .env existe
if [ ! -f .env ]; then
    warning "Arquivo .env não encontrado. Criando arquivo .env..."
    
    # Gerar secrets aleatórios
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change_this_jwt_secret_$(date +%s)")
    COOKIE_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change_this_cookie_secret_$(date +%s)")
    
    cat > .env << EOF
# Porta do servidor
PORT=8080

# URL do frontend (para CORS)
FRONTEND_URL=http://localhost:3000

# Segredos para JWT e Cookies
JWT_SECRET=${JWT_SECRET}
COOKIE_SECRET=${COOKIE_SECRET}

# Database
DATABASE_URL="file:./prisma/db/dev.db"

# Bcrypt (opcional, padrão é 8)
BCRYPT_SALT_ROUNDS=8

# Environment
NODE_ENV=development
EOF
    success "Arquivo .env criado com secrets gerados automaticamente"
else
    success "Arquivo .env já existe"
fi

# Criar diretório do banco de dados se não existir
mkdir -p prisma/db

# Gerar Prisma Client
info "Gerando Prisma Client..."
yarn prisma generate
success "Prisma Client gerado"

# Executar migrations
info "Executando migrations do banco de dados..."
yarn prisma migrate deploy
success "Migrations executadas"

# Voltar para a raiz
cd ..

echo ""
info "Configurando Frontend..."
echo "------------------------"

# Navegar para o frontend
cd frontend

# Instalar dependências do frontend
info "Instalando dependências do frontend..."
yarn install
success "Dependências do frontend instaladas"

# Verificar se .env.local existe
if [ ! -f .env.local ]; then
    info "Criando arquivo .env.local..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF
    success "Arquivo .env.local criado"
else
    success "Arquivo .env.local já existe"
fi

# Voltar para a raiz
cd ..

echo ""
echo "======================================"
success "Setup concluído com sucesso!"
echo "======================================"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "   Para iniciar o projeto, execute:"
echo -e "   ${GREEN}./start.sh${NC}"
echo ""
echo "   Ou manualmente em terminais separados:"
echo ""
echo "   Terminal 1 (Backend):"
echo -e "   ${BLUE}cd backend && yarn dev${NC}"
echo ""
echo "   Terminal 2 (Frontend):"
echo -e "   ${BLUE}cd frontend && yarn dev${NC}"
echo ""
echo "   O backend estará em: http://localhost:8080"
echo "   O frontend estará em: http://localhost:3000"
echo ""
