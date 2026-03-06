/**
 * Resolve o redirect da CheapShark e redireciona o utilizador para o URL final da loja
 * (Epic, GOG, etc.). Para ofertas Steam usamos o link direto; para as outras, este
 * endpoint segue o redirect e devolve 302 para a página do jogo na loja.
 */
const CHEAPSHARK_REDIRECT = 'https://www.cheapshark.com/redirect';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dealID = url.searchParams.get('dealID');
  if (!dealID || !dealID.trim()) {
    return new Response(JSON.stringify({ error: 'dealID em falta' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const redirectUrl = `${CHEAPSHARK_REDIRECT}?dealID=${encodeURIComponent(dealID.trim())}`;
    const res = await fetch(redirectUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'LootRadar/1.0 (https://github.com/Alusem/LootRadar)',
      },
      signal: AbortSignal.timeout(10000),
    });
    const finalUrl = res.url;
    if (!finalUrl || finalUrl.startsWith('https://www.cheapshark.com')) {
      return new Response(JSON.stringify({ error: 'Não foi possível obter o link da loja' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(null, {
      status: 302,
      headers: { Location: finalUrl },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao resolver o link';
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
