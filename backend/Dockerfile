# Imagem oficial Node.js 24 (Alpine)
FROM node:24-alpine

WORKDIR /app

# Copiar ficheiros de dependências
COPY package.json package-lock.json* ./

# Instalar dependências (inclui devDependencies para dev)
RUN npm install

# Copiar o resto da aplicação
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Porta do servidor
EXPOSE 3000

# Gerar Prisma e iniciar servidor em modo desenvolvimento
CMD ["sh", "-c", "npx prisma generate && npm run dev"]
