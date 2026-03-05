# LootRadar Back-end

API REST em Node.js + Express + Prisma (PostgreSQL) para o projeto LootRadar.

## Pré-requisitos

- **Opção A (local):** Node.js 18+
- **Opção B (Docker):** [Docker](https://docker.com/get-started/) instalado — não é necessário instalar Node no Windows
- Conta no [Supabase](https://supabase.com) (ou PostgreSQL local) para a base de dados

---

## Executar com Docker (recomendado se não tiveres Node instalado)

Na pasta `backend/`:

1. **Primeira vez — aplicar migrações na base de dados:**

   ```powershell
   docker compose run --rm backend npx prisma migrate dev --name init
   ```

2. **Construir e iniciar o servidor:**

   ```powershell
   docker compose up --build
   ```

O servidor fica disponível em **http://localhost:3000**. Para parar: `Ctrl+C`.

**Comandos úteis:**
- Entrar no container com shell: `docker compose run --rm backend sh` (depois podes correr `node -v`, `npm -v`, etc.)
- Ver logs: `docker compose logs -f backend`

---

## Instalação (sem Docker)

```bash
cd backend
npm install
```

## Configuração

1. Copie o ficheiro de exemplo das variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

2. Edite `.env` e defina:
   - `DATABASE_URL` — connection string do PostgreSQL (Supabase)
   - `SITE_URL` — URL do frontend (ex.: `http://localhost:5173`) para links no email de confirmação
   - `RESEND_API_KEY` — chave da API [Resend](https://resend.com) para enviar emails de confirmação (opcional: sem esta chave, o link de confirmação aparece na resposta do registo para uso em desenvolvimento)
   - `EMAIL_FROM` — remetente dos emails (ex.: `LootRadar <onboarding@resend.dev>`)

3. Gere o cliente Prisma e aplique as migrações:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

## Comandos

| Comando | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (hot-reload) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Inicia o servidor em produção (após `npm run build`) |
| `npm run verify` | Verifica se a API está a responder (servidor deve estar a correr) |
| `npx prisma migrate dev` | Cria/aplica migrações da base de dados |

## Iniciar o servidor

Em desenvolvimento:

```bash
npm run dev
```

O servidor fica disponível em `http://localhost:3000` (ou na porta definida em `PORT` no `.env`). O front-end (Vite) corre noutra porta (ex.: 5173) e em desenvolvimento pode usar o proxy para `/api`; caso contrário, define `VITE_API_URL` no front-end para apontar a este servidor.

## Verificação

Com o servidor a correr noutro terminal:

```bash
npm run verify
```

O script testa o endpoint de saúde (`/api/health`), a listagem de jogos (`/api/games`) e que rotas inexistentes devolvem 404.

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Estado da API (útil para verificar se está online) |
| GET | `/api/games` | Lista jogos gratuitos (GamerPower API). Query params opcionais: `platform`, `type` |
| POST | `/api/users` | Cria um utilizador. Body: `{ "username", "email", "password" }`. Envia email de confirmação. |
| POST | `/api/users/login` | Login. Body: `{ "email", "password" }`. Requer email confirmado. |
| GET | `/api/users/verify-email?token=xxx` | Confirma o email com o token recebido por email. |
| POST | `/api/users/resend-verification` | Reenvia o email de confirmação. Body: `{ "email" }` |
| POST | `/api/claims` | Regista um resgate. Body: `{ "userId", "gamerPowerItemId", "title", "open_giveaway_url" (opcional) }` |
| GET | `/api/users/:userId/claims` | Lista todos os resgates de um utilizador |
