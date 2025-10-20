# 📜 Scripts de Automação

Este projeto inclui scripts automatizados para facilitar o setup e execução.

## 🔧 setup.sh

Script de configuração inicial que prepara todo o ambiente.

### O que faz:

1. **Verifica pré-requisitos**

   - Confirma se Node.js está instalado
   - Instala Yarn se não estiver presente

2. **Configura o Backend**

   - Instala todas as dependências via `yarn install`
   - Cria arquivo `.env` com secrets gerados automaticamente (se não existir)
   - Cria diretório do banco de dados
   - Gera o Prisma Client
   - Executa as migrations do banco de dados

3. **Configura o Frontend**
   - Instala todas as dependências via `yarn install`
   - Cria arquivo `.env.local` (se não existir)

### Como usar:

```bash
./setup.sh
```

### Primeiro uso:

Se você clonou o repositório pela primeira vez, este é o único comando que precisa executar antes de rodar o projeto.

---

## ▶️ start.sh

Script que inicia tanto o backend quanto o frontend simultaneamente.

### O que faz:

1. Inicia o servidor backend em `http://localhost:8080`
2. Inicia o servidor frontend em `http://localhost:3000`
3. Redireciona os logs para arquivos (`backend.log` e `frontend.log`)
4. Exibe os logs em tempo real no terminal
5. Gerencia ambos os processos - ao pressionar `Ctrl+C`, encerra ambos os servidores

### Como usar:

```bash
./start.sh
```

### Logs:

Os logs são salvos em:

- `backend.log` - Logs do servidor backend
- `frontend.log` - Logs do servidor frontend

Você pode visualizar os logs separadamente:

```bash
# Ver logs do backend
tail -f backend.log

# Ver logs do frontend
tail -f frontend.log
```

---

## 🛠️ Solução de Problemas

### Permissão negada ao executar scripts

Se você receber um erro de permissão, torne os scripts executáveis:

```bash
chmod +x setup.sh start.sh
```

### Porta já em uso

Se as portas 8080 (backend) ou 3000 (frontend) já estiverem em uso:

1. Encontre o processo usando a porta:

   ```bash
   # Linux/Mac
   lsof -i :8080
   lsof -i :3000
   ```

2. Encerre o processo ou mude a porta nos arquivos `.env`

### Erro ao instalar dependências

Se houver erro ao instalar dependências:

1. Limpe o cache do Yarn:

   ```bash
   yarn cache clean
   ```

2. Delete `node_modules` e reinstale:
   ```bash
   rm -rf backend/node_modules frontend/node_modules
   ./setup.sh
   ```

### Banco de dados corrompido

Se o banco de dados apresentar problemas:

```bash
cd backend
rm -rf prisma/db/dev.db
yarn prisma migrate deploy
```

---

## 🔄 Alternativas Manuais

Se preferir não usar os scripts, você pode executar os comandos manualmente:

### Setup Manual:

```bash
# Backend
cd backend
yarn install
yarn prisma generate
yarn prisma migrate deploy

# Frontend
cd ../frontend
yarn install
```

### Iniciar Manualmente:

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

## 📝 Personalização

### Modificar portas

**Backend:** Edite `backend/.env`

```env
PORT=8080  # Altere para a porta desejada
```

**Frontend:** O Next.js usa a porta 3000 por padrão. Para mudar:

```bash
cd frontend
yarn dev -p 3001  # Usa porta 3001
```

### Variáveis de ambiente

Os scripts criam arquivos `.env` padrão. Você pode editá-los manualmente após o setup:

- `backend/.env` - Configurações do backend
- `frontend/.env.local` - Configurações do frontend

---

## 🎯 Fluxo Recomendado

Para novos desenvolvedores no projeto:

```bash
# 1. Clone o repositório
git clone https://github.com/werean/online-market.git
cd online-market

# 2. Execute o setup (apenas uma vez)
./setup.sh

# 3. Inicie o projeto
./start.sh

# 4. Acesse http://localhost:3000
```

Pronto! 🚀
