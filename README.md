# 🛒 Online Market

Sistema completo de marketplace online com gerenciamento de produtos, carrinho de compras e autenticação de usuários e vendedores.

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Rápida](#-instalação-rápida-recomendado)
- [Como Rodar o Projeto](#-como-rodar-o-projeto)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação dos Módulos](#-documentação-dos-módulos)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [API Endpoints](#-api-endpoints)

> 💡 **Dica:** Para mais informações sobre os scripts de automação, veja [SCRIPTS.md](SCRIPTS.md)

---

## 🚀 Tecnologias

### Backend

- **Node.js** com **TypeScript**
- **Fastify**
- **Prisma ORM**
- **SQLite**
- **JWT**
- **Bcrypt**
- **Zod**

### Frontend

- **Next.js 15**
- **React 19**
- **TypeScript**
- **CSS Modules**
- **React Hook Form**
- **Zod**

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
- **Yarn** (será instalado automaticamente se não estiver presente)

---

## � Instalação Rápida (Recomendado)

### Setup Automatizado

Clone o repositório e execute o script de setup:

```bash
git clone https://github.com/werean/online-market.git
cd online-market
./setup.sh
```

O script `setup.sh` irá automaticamente:

- ✓ Verificar e instalar dependências (Yarn, se necessário)
- ✓ Instalar pacotes do backend e frontend
- ✓ Criar arquivos `.env` com secrets gerados automaticamente
- ✓ Configurar o banco de dados (Prisma Client e migrations)
- ✓ Preparar o ambiente completo

---

## ▶️ Como Rodar o Projeto

### Opção 1: Script de início automático (Recomendado)

Após executar o setup, inicie ambos os servidores com um único comando:

```bash
./start.sh
```

Isso iniciará:

- **Backend** em `http://localhost:8080`
- **Frontend** em `http://localhost:3000`

Para parar os servidores, pressione `Ctrl+C`

### Opção 2: Rodar Backend e Frontend separadamente

**Terminal 1 - Backend:**

```bash
cd backend
yarn dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
yarn dev
```

---

## 🔧 Configuração Manual (Opcional)

<details>
<summary>Clique para expandir as instruções de configuração manual</summary>

### 1. Instalar dependências do Backend

```bash
cd backend
yarn install
```

### 2. Configurar variáveis de ambiente do Backend

Crie um arquivo `.env` na pasta `backend`:

```env
PORT=8080
FRONTEND_URL=http://localhost:3000
JWT_SECRET=seu_jwt_secret_aqui
COOKIE_SECRET=seu_cookie_secret_aqui
DATABASE_URL="file:./prisma/db/dev.db"
BCRYPT_SALT_ROUNDS=8
NODE_ENV=development
```

### 3. Configurar banco de dados

```bash
yarn prisma generate
yarn prisma migrate deploy
```

### 4. Instalar dependências do Frontend

```bash
cd ../frontend
yarn install
```

### 5. Configurar variáveis de ambiente do Frontend

Crie um arquivo `.env.local` na pasta `frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

</details>

---

## 📁 Estrutura do Projeto

```
online-market/
├── setup.sh                     # Script de setup automatizado
├── start.sh                     # Script para iniciar backend e frontend
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Schema do banco de dados
│   │   ├── migrations/          # Histórico de migrations
│   │   └── db/                  # Arquivo SQLite
│   ├── src/
│   │   ├── config/              # Configurações (env, prisma)
│   │   ├── modules/             # Módulos da aplicação
│   │   │   ├── auth/           # Autenticação
│   │   │   ├── users/          # Gerenciamento de usuários
│   │   │   ├── sellers/        # Gerenciamento de vendedores
│   │   │   ├── products/       # Gerenciamento de produtos
│   │   │   └── cart/           # Carrinho de compras
│   │   ├── types/              # Tipos TypeScript
│   │   ├── app.ts              # Configuração do Fastify
│   │   └── main.ts             # Entry point
│   ├── server.ts               # Servidor
│   └── package.json
│
└── frontend/
    ├── app/                     # App Router do Next.js
    │   ├── cart/               # Página do carrinho
    │   ├── checkout/           # Página de checkout
    │   ├── dashboard/          # Dashboard do seller
    │   ├── login/              # Login
    │   ├── register/           # Registro de usuário/seller
    │   ├── profile/            # Perfil do usuário/seller
    │   ├── product/            # Páginas relacionadas a produtos
    │   ├── recover-password/   # Recuperação de senha
    │   ├── reset-password/     # Reset de senha
    │   └── verify-token/       # Verificação de token OTP
    ├── components/             # Componentes reutilizáveis
    │   ├── Navbar/            # Barra de navegação
    │   ├── Cart/              # Componente do carrinho
    │   ├── form/              # Componentes de formulário
    │   ├── products/          # Cards de produtos
    │   ├── OTPInput/          # Input de código OTP
    │   └── Timer/             # Timer de contagem regressiva
    ├── lib/                    # Utilitários e helpers
    │   ├── contexts/          # Context API (Auth, Cart)
    │   ├── hooks/             # Custom hooks
    │   └── validators/        # Validações Zod
    └── package.json
```

---

## 📚 Documentação dos Módulos

## Backend

### 🔐 Módulo de Autenticação (`auth/`)

Responsável por toda a autenticação e autorização do sistema.

**Arquivos:**

- `auth.controller.ts` - Controlador com endpoints de autenticação
- `auth.service.ts` - Lógica de negócio (login, recuperação de senha)
- `auth.routes.ts` - Definição de rotas

**Funcionalidades:**

#### Login de Usuários e Vendedores

- Valida credenciais (email/senha)
- Gera token JWT com validade de 7 dias
- Diferencia usuários comuns de vendedores
- Implementa soft delete (não permite login de usuários deletados)

```typescript
POST /auth/login
Body: { email: string, password: string, isSeller: boolean }
```

#### Recuperação de Senha

Sistema completo de recuperação com código OTP de 6 dígitos:

1. **Gerar Código** - Envia código por email (console em dev)
   - Cooldown de 30 segundos entre solicitações
   - TTL de 15 minutos
   - Hash SHA-256 do código armazenado

```typescript
POST / auth / recover - password;
Body: {
  email: string;
}
```

2. **Verificar Código** - Valida o código OTP
   - Máximo de 3 tentativas
   - Bloqueia após exceder tentativas

```typescript
POST /auth/verify-token
Body: { email: string, token: string }
```

3. **Resetar Senha** - Define nova senha
   - Requer token verificado e válido
   - Hash bcrypt da nova senha

```typescript
POST /auth/reset-password
Body: { email: string, newPassword: string }
```

#### Obter Usuário Atual

```typescript
GET /auth/user
Headers: Cookie (com JWT)
Response: { user: User | Seller }
```

#### Logout

```typescript
POST / auth / logout;
```

---

### 👤 Módulo de Usuários (`users/`)

Gerencia usuários compradores da plataforma.

**Arquivos:**

- `user.controller.ts` - Controlador
- `user.service.ts` - Lógica de negócio
- `user.repository.ts` - Acesso ao banco de dados
- `user.routes.ts` - Rotas
- `dto/create-user.dto.ts` - Validação de dados

**Funcionalidades:**

#### Registro de Usuário

- Valida email único
- Hash da senha com bcrypt
- Campos: nome, email, endereço, senha

```typescript
POST / user / register;
Body: {
  name, email, address, password;
}
```

#### Listar Usuários

```typescript
GET /user/
```

#### Buscar Usuário por ID

```typescript
GET /user/:id
```

#### Atualizar Usuário

- Permite alterar nome, email, endereço
- Valida email único ao alterar

```typescript
PUT /user/update/:id
Body: { name?, email?, address? }
```

#### Deletar Usuário

- Implementa soft delete
- Marca `isDeleted: true` e `deletedAt: Date`
- Usuários deletados não podem fazer login

```typescript
DELETE /user/:id
```

**Modelo de Dados:**

```prisma
model User {
  id         String     @id @default(uuid())
  name       String
  address    String
  email      String     @unique
  password   String
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  isDeleted  Boolean    @default(false)
  deletedAt  DateTime?
  cartItems  CartItem[]
}
```

---

### 🏪 Módulo de Vendedores (`sellers/`)

Gerencia vendedores da plataforma (similar aos usuários, mas com produtos).

**Arquivos:**

- `seller.controller.ts`
- `seller.service.ts`
- `seller.repository.ts`
- `seller.routes.ts`
- `dto/create-seller.dto.ts`

**Funcionalidades:**

#### Registro de Vendedor

```typescript
POST / seller / register;
Body: {
  name, email, address, password;
}
```

#### Listar Vendedores

```typescript
GET /seller/
```

#### Buscar Vendedor por ID

```typescript
GET /seller/:id
```

#### Atualizar Vendedor

```typescript
PUT /seller/update/:id
Body: { name?, email?, address? }
```

#### Deletar Vendedor

```typescript
DELETE /seller/:id
```

**Modelo de Dados:**

```prisma
model Seller {
  id        String    @id @default(uuid())
  name      String
  address   String
  email     String    @unique
  password  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  isDeleted Boolean   @default(false)
  deletedAt DateTime?
  products  Product[]
}
```

---

### 📦 Módulo de Produtos (`products/`)

Gerencia o catálogo de produtos dos vendedores.

**Arquivos:**

- `product.controller.ts`
- `product.service.ts`
- `product.repository.ts`
- `product.routes.ts`
- `dto/create-product.dto.ts`

**Funcionalidades:**

#### Criar Produto (Individual)

- Upload de até 6 imagens
- Preço em centavos (Int)
- Vinculado ao vendedor autenticado

```typescript
POST /products/
FormData: {
  name: string
  description: string
  price: number (em centavos)
  stock: number
  images: File[] (máx 6)
}
```

#### Upload em Lote (CSV)

- Processa arquivo CSV com múltiplos produtos
- Formato: name, description, price, stock, images (URLs separadas por |)
- Valida cada linha antes de importar

```typescript
POST / products / csv;
FormData: {
  file: File(CSV);
}
```

#### Listar Produtos

- Suporta paginação
- Filtra produtos ativos (não deletados)

```typescript
GET /products/
Query: { page?: number, limit?: number }
```

#### Buscar Produto por ID

```typescript
GET /products/:id
```

#### Listar Produtos do Vendedor

```typescript
GET /products/seller/:sellerId
```

#### Atualizar Produto

- Apenas o vendedor dono pode atualizar
- Pode adicionar novas imagens (até o limite de 6 total)

```typescript
PUT /products/:id
FormData: { name?, description?, price?, stock?, newImages?: File[] }
```

#### Deletar Produto

- Apenas o vendedor dono pode deletar
- Remove permanentemente (hard delete)

```typescript
DELETE /products/:id
```

**Modelo de Dados:**

```prisma
model Product {
  id          String     @id @default(uuid())
  name        String
  description String?
  price       Int        # em centavos
  images      String     # URLs separadas por vírgula
  stock       Int
  sellerId    String
  seller      Seller     @relation(fields: [sellerId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  cartItems   CartItem[]

  @@index([sellerId])
  @@index([createdAt])
  @@index([price])
}
```

---

### 🛒 Módulo de Carrinho (`cart/`)

Gerencia o carrinho de compras dos usuários.

**Arquivos:**

- `cart.controller.ts`
- `cart.service.ts`
- `cart.repository.ts`
- `cart.routes.ts`

**Funcionalidades:**

#### Adicionar Item ao Carrinho

- Se o item já existe, incrementa a quantidade
- Valida se o produto existe e tem estoque
- Vinculado ao usuário autenticado

```typescript
POST /cart/
Body: { productId: string, quantity: number }
```

#### Obter Carrinho do Usuário

- Retorna todos os itens com informações do produto
- Inclui imagens, preço, estoque disponível

```typescript
GET /cart/
```

#### Atualizar Quantidade

- Permite aumentar ou diminuir quantidade
- Valida estoque disponível

```typescript
PUT /cart/:itemId
Body: { quantity: number }
```

#### Remover Item do Carrinho

```typescript
DELETE /cart/:itemId
```

#### Limpar Carrinho

- Remove todos os itens do usuário

```typescript
DELETE / cart / clear;
```

**Modelo de Dados:**

```prisma
model CartItem {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId])
}
```

---

## Frontend

### 🎨 Componentes Principais

#### Navbar (`components/Navbar/`)

Barra de navegação responsiva e adaptativa.

**Funcionalidades:**

- Logo com link para home
- Exibe nome do usuário logado
- **Usuários:**
  - Botão de perfil (ícone)
  - Botão de carrinho com badge de quantidade
  - Dropdown do carrinho ao clicar
- **Vendedores:**
  - Botão de perfil (ícone)
  - Links para "Novo Produto" e "Enviar CSV"
- **Não autenticados:**
  - Links para Login, Criar conta, Cadastrar como vendedor
  - Botão de carrinho (redireciona para login)
- Botão de logout

#### Cart (`components/Cart/`)

Componente de visualização do carrinho.

**Funcionalidades:**

- Lista todos os produtos no carrinho
- Mostra imagem, nome, preço e quantidade
- Permite alterar quantidade (+ / -)
- Botão para remover item
- Exibe total do carrinho
- Botão "Finalizar compra" (redireciona para checkout)

#### ProductCard (`components/products/`)

Card de exibição de produto.

**Funcionalidades:**

- Exibe primeira imagem do produto
- Nome, descrição e preço formatado
- Botão "Adicionar ao carrinho"
- Link para detalhes do produto

#### OTPInput (`components/OTPInput/`)

Input especializado para código de 6 dígitos.

**Funcionalidades:**

- 6 campos individuais
- Auto-foco no próximo campo ao digitar
- Suporta backspace entre campos
- Apenas números
- Colar código automaticamente

#### Timer (`components/Timer/`)

Timer de contagem regressiva.

**Funcionalidades:**

- Exibe tempo restante (MM:SS)
- Callback ao terminar
- Usado na verificação OTP

---

### 📄 Páginas Principais

#### Home (`app/page.tsx`)

- Lista todos os produtos disponíveis
- Grid responsivo de ProductCards
- Acesso público

#### Login (`app/login/page.tsx`)

- Formulário de login
- Toggle entre usuário e vendedor
- Validação com Zod
- Redireciona para dashboard (seller) ou home (user)

#### Registro (`app/register/page.tsx`)

- Registro de usuário comum
- Campos: nome, email, endereço, senha, confirmar senha
- Validação de email e força de senha

#### Registro de Vendedor (`app/register/seller/page.tsx`)

- Similar ao registro de usuário
- Cria conta de vendedor

#### Perfil (`app/profile/page.tsx`)

- Edição de perfil (nome, email, endereço)
- Campos pré-preenchidos
- Funciona para usuários e vendedores (detecta automaticamente)
- Opção de deletar perfil

#### Carrinho (`app/cart/page.tsx`)

- Visualização completa do carrinho
- Atualizar quantidades
- Remover itens
- Ver total
- Finalizar compra

#### Dashboard (`app/dashboard/page.tsx`)

- Painel do vendedor
- Lista produtos do vendedor
- Opção de editar/deletar produtos
- Estatísticas (opcional)

#### Novo Produto (`app/product/new/page.tsx`)

- Formulário de criação de produto
- Upload de múltiplas imagens (até 6)
- Preview das imagens
- Validação de campos

#### Upload CSV (`app/product/csv/page.tsx`)

- Upload de arquivo CSV
- Importação em lote de produtos
- Feedback de sucesso/erro

#### Recuperar Senha (`app/recover-password/page.tsx`)

- Solicita código de recuperação
- Timer de cooldown (30s)
- Redireciona para verificação

#### Verificar Token (`app/verify-token/page.tsx`)

- Input OTP de 6 dígitos
- Timer de expiração (15 min)
- 3 tentativas
- Redireciona para reset de senha

#### Reset de Senha (`app/reset-password/page.tsx`)

- Define nova senha
- Confirmação de senha
- Validação de força

---

### 🔄 Contexts

#### AuthContext (`lib/contexts/AuthContext.tsx`)

Gerencia estado de autenticação global.

**Funcionalidades:**

- `user: User | null` - Usuário atual
- `loading: boolean` - Estado de carregamento
- `refreshUser()` - Recarrega dados do usuário
- Verifica sessão ao carregar
- Provê dados para toda a aplicação

**Interface User:**

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  isSeller: boolean;
}
```

#### CartContext (`lib/contexts/CartContext.tsx`)

Gerencia carrinho de compras global.

**Funcionalidades:**

- `items: CartItem[]` - Itens do carrinho
- `loading: boolean`
- `addItem(productId, quantity)` - Adiciona item
- `updateQuantity(itemId, quantity)` - Atualiza quantidade
- `removeItem(itemId)` - Remove item
- `clearCart()` - Limpa carrinho
- `refreshCart()` - Recarrega carrinho
- Sincroniza com backend
- Persiste estado durante navegação

---

### 🎯 Hooks Customizados

#### useSession (`lib/hooks/useSession.ts`)

Hook para verificar autenticação.

```typescript
const { user, loading } = useSession();
```

#### useProtectedRoute (`lib/hooks/useProtectedRoute.ts`)

Protege rotas que requerem autenticação.

```typescript
useProtectedRoute(); // Redireciona para /login se não autenticado
useProtectedRoute(true); // Redireciona para / se já autenticado
```

---

### 🔒 Validações (Zod)

#### Login (`lib/validators/login.ts`)

```typescript
{
  email: string().email();
  password: string().min(6);
  isSeller: boolean();
}
```

#### Registro (`lib/validators/register.ts`)

```typescript
{
  name: string().min(2);
  email: string().email();
  address: string().min(5);
  password: string().min(8);
  confirmPassword: string();
}
```

#### Recuperar Senha (`lib/validators/recover-password.ts`)

```typescript
{
  email: string().email();
}
```

#### Reset de Senha (`lib/validators/reset-password.ts`)

```typescript
{
  password: string().min(8);
  confirmPassword: string();
}
```

---

## 🔑 Variáveis de Ambiente

### Backend (`.env`)

```env
# Servidor
PORT=8080

# Frontend (CORS)
FRONTEND_URL=http://localhost:3000

# Autenticação
JWT_SECRET=seu_jwt_secret_muito_seguro
COOKIE_SECRET=seu_cookie_secret_muito_seguro

# Database
DATABASE_URL="file:./prisma/db/dev.db"

# Bcrypt
BCRYPT_SALT_ROUNDS=8

# Environment
NODE_ENV=development
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 🌐 API Endpoints

### Autenticação

- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/user` - Usuário atual
- `POST /auth/recover-password` - Solicitar recuperação
- `POST /auth/verify-token` - Verificar código
- `POST /auth/reset-password` - Resetar senha

### Usuários

- `POST /user/register` - Registrar
- `GET /user/` - Listar todos
- `GET /user/:id` - Buscar por ID
- `PUT /user/update/:id` - Atualizar
- `DELETE /user/:id` - Deletar

### Vendedores

- `POST /seller/register` - Registrar
- `GET /seller/` - Listar todos
- `GET /seller/:id` - Buscar por ID
- `PUT /seller/update/:id` - Atualizar
- `DELETE /seller/:id` - Deletar

### Produtos

- `POST /products/` - Criar produto
- `POST /products/csv` - Upload CSV
- `GET /products/` - Listar todos
- `GET /products/:id` - Buscar por ID
- `GET /products/seller/:sellerId` - Produtos do vendedor
- `PUT /products/:id` - Atualizar
- `DELETE /products/:id` - Deletar

### Carrinho

- `GET /cart/` - Ver carrinho
- `POST /cart/` - Adicionar item
- `PUT /cart/:itemId` - Atualizar quantidade
- `DELETE /cart/:itemId` - Remover item
- `DELETE /cart/clear` - Limpar carrinho

---

## 👨‍💻 Autor

Desenvolvido por [werean](https://github.com/werean)
