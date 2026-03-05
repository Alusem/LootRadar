# Deploy do LootRadar

## 1. GitHub (concluído)

O projeto já está em: **https://github.com/Alusem/LootRadar**

---

## 2. Deploy no Vercel (frontend)

### Passo a passo

1. **Entra no Vercel**  
   Acede a [vercel.com](https://vercel.com) e inicia sessão (pode ser com a conta GitHub).

2. **Importar o repositório**  
   - Clica em **“Add New…”** → **“Project”**.  
   - Escolhe o repositório **Alusem/LootRadar** (se não aparecer, liga primeiro a conta GitHub em Settings).  
   - Clica em **Import**.

3. **Configurar o projeto**  
   - **Root Directory:** clica em **Edit** e define **`frontend`** (a pasta do frontend).  
   - **Framework Preset:** Vercel deve detetar **Vite**.  
   - **Build Command:** `npm run build` (normalmente já vem preenchido).  
   - **Output Directory:** `dist` (normalmente já vem preenchido).  
   - Deixa o resto como está e clica em **Deploy**.

4. **Variável de ambiente (opcional)**  
   Se mais tarde colocares o backend noutro serviço (Railway, Render, etc.):  
   - No projeto no Vercel: **Settings** → **Environment Variables**.  
   - Adiciona `VITE_API_URL` com o URL da API (ex.: `https://teu-backend.railway.app`).  
   - Faz um novo deploy para aplicar.

5. **Ver o site**  
   No final do deploy o Vercel mostra um URL (ex.: `lootradar.vercel.app`). Esse é o teu site.

### Nota sobre a API

- Em **desenvolvimento**, o frontend usa o proxy do Vite para `/api` (backend em `localhost:3000`).  
- No **Vercel**, só o frontend está em deploy; não há backend. As chamadas a `/api` vão falhar a menos que:  
  - configures **rewrites** no Vercel para um backend que tenhas noutro URL, ou  
  - faças deploy do backend noutro serviço e definas **VITE_API_URL** com esse URL.

Para ter jogos e promoções a funcionar em produção, precisas de fazer deploy do **backend** (por exemplo em [Railway](https://railway.app) ou [Render](https://render.com)) e depois definir `VITE_API_URL` no Vercel com o URL desse backend.
