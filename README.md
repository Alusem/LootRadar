# LootRadar

Aplicação web que centraliza jogos gratuitos e promoções em tempo real. Permite ver ofertas ativas, filtrar por plataforma e tipo, e abrir o link oficial de resgate.

## Stack

- **Front-end:** React (Vite) + TypeScript + TailwindCSS
- **Deploy:** Vercel (frontend + API serverless)
- **APIs externas:** [GamerPower](https://www.gamerpower.com/api/giveaways) (jogos gratuitos), [CheapShark](https://www.cheapshark.com) (promoções)

## Estrutura do repositório

- **`frontend/`** – App React (Vite), páginas e componentes
- **`frontend/api/`** – Funções serverless do Vercel (`/api/games`, `/api/deals`)
- **`backend/`** – API Node.js + Express + Prisma (opcional; usado em desenvolvimento local com BD)

## Como correr em desenvolvimento

### Frontend (e API via Vercel em produção)

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Em produção, o mesmo projeto é deployado no Vercel e as rotas `/api/games` e `/api/deals` são servidas por funções serverless.

### Backend (opcional, para BD local)

```bash
cd backend
npm install
npx prisma generate
# Configura DATABASE_URL no .env (ex.: Supabase)
npm run dev
```

Com o backend a correr em `http://localhost:3000`, o frontend em dev usa o proxy do Vite para `/api`.

## Deploy (Vercel)

O projeto está preparado para deploy no Vercel com **Root Directory** = `frontend`. As rotas `/api/games` e `/api/deals` são tratadas por funções serverless no mesmo projeto, pelo que o site funciona sem backend externo.

- **Repositório:** [Alusem/LootRadar](https://github.com/Alusem/LootRadar)
- Instruções detalhadas em [DEPLOY.md](DEPLOY.md).

## Licença

ISC
