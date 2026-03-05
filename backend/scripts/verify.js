/**
 * Script de verificação: assume que o servidor está a correr em http://localhost:3000
 * Uso: node scripts/verify.js
 */
const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE = `http://localhost:${PORT}`;

function request(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function main() {
  console.log('A verificar LootRadar API em', BASE, '...\n');

  let ok = 0;
  let fail = 0;

  // 1. Health
  try {
    const health = await request('/api/health');
    if (health.status === 200 && health.body?.status === 'ok') {
      console.log('OK  GET /api/health');
      ok++;
    } else {
      console.log('FAIL GET /api/health', health.status, health.body);
      fail++;
    }
  } catch (e) {
    console.log('FAIL GET /api/health', e.message || e);
    fail++;
  }

  // 2. Games (GamerPower)
  try {
    const games = await request('/api/games');
    if (games.status === 200 && Array.isArray(games.body)) {
      console.log('OK  GET /api/games (', games.body.length, 'jogos)');
      ok++;
    } else {
      console.log('FAIL GET /api/games', games.status, typeof games.body);
      fail++;
    }
  } catch (e) {
    console.log('FAIL GET /api/games', e.message || e);
    fail++;
  }

  // 3. 404
  try {
    const notFound = await request('/api/nao-existe');
    if (notFound.status === 404) {
      console.log('OK  GET /api/nao-existe -> 404');
      ok++;
    } else {
      console.log('FAIL GET /api/nao-existe esperado 404, obtido', notFound.status);
      fail++;
    }
  } catch (e) {
    console.log('FAIL GET /api/nao-existe', e.message || e);
    fail++;
  }

  console.log('\n--- Resultado:', ok, 'ok,', fail, 'falhas ---');
  process.exit(fail > 0 ? 1 : 0);
}

main();
