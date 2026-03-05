# Especificações Técnicas e Arquitetura

## 1. Stack Tecnológico
Para garantir um desenvolvimento ágil, moderno e pronto para deploy em nuvem (Serverless), a stack será baseada no ecossistema JavaScript/TypeScript, utilizando banco de dados relacional hospedado.

* **Front-end:** React.js (via Vite) + TailwindCSS.
* **Back-end:** Node.js com Express.js.
* **Banco de Dados:** PostgreSQL (hospedado no Supabase), escolhido pela compatibilidade perfeita com a Vercel.
* **ORM:** Prisma (para facilitar as consultas, tipagem e migrações do banco de dados).

## 2. Arquitetura do Sistema
O sistema seguirá uma arquitetura cliente-servidor tradicional, preparada para ambientes Serverless.

1. O **Front-end (React)** fará requisições HTTP REST para o Back-end.
2. O **Back-end (Node.js)** terá duas responsabilidades:
   - Atuar como um *BFF (Backend For Frontend)*, fazendo as chamadas para a API pública da GamerPower, tratando a resposta e enviando para o Front-end.
   - Gerenciar a lógica de negócios e persistência de dados comunicando-se com o PostgreSQL (Supabase) via Prisma.

## 3. API Externa Utilizada
* **Nome:** GamerPower API
* **Endpoint Principal:** `https://www.gamerpower.com/api/giveaways`
* **Dados Retornados:** Título do jogo, imagem (thumbnail), descrição, plataforma, tipo (Game ou Loot), e URL de resgate (open_giveaway_url).

## 4. Modelagem do Banco de Dados (Schema Prisma)
O banco de dados terá um relacionamento simples de 1:N (Um usuário pode ter vários resgates salvos).

```prisma
model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  createdAt DateTime @default(now())
  claims    Claim[]
}

model Claim {
  id               String   @id @default(uuid())
  userId           String
  gamerPowerItemId Int      // ID do jogo/loot na API da GamerPower
  title            String   // Nome do jogo salvo para referência rápida
  claimedAt        DateTime @default(now())
  user             User     @relation(fields: [userId], references: [id])
}