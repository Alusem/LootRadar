import app from './app';
import { prisma } from './lib/prisma';

const PORT = process.env.PORT ?? 3000;

async function main() {
  try {
    await prisma.$connect();
    console.log('Base de dados conectada.');
  } catch (e) {
    console.warn('Aviso: nao foi possivel conectar à base de dados. /api/health e /api/games continuam disponiveis.');
  }
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`LootRadar API running at http://localhost:${PORT}`);
  });
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
