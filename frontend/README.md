# LootRadar Front-end

React + Vite + Tailwind. Consome a API do backend (proxy em dev para `http://localhost:3000`).

## Pré-requisitos

- Node.js 18+
- Back-end a correr em `http://localhost:3000`

## Instalação e execução

```bash
cd frontend
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173). O proxy envia pedidos `/api/*` para o backend.

## Build

```bash
npm run build
npm run preview
```

Para produção, define `VITE_API_URL` com a URL do backend (ex.: `https://api.seudominio.com`).
