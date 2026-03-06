const GAMERPOWER_API = 'https://www.gamerpower.com/api/giveaways';

interface GameDto {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
  platform: string;
  type: string;
  open_giveaway_url: string;
}

function mapItem(item: Record<string, unknown>): GameDto {
  return {
    id: Number(item.id) || 0,
    title: String(item.title ?? ''),
    thumbnail: String(item.thumbnail ?? ''),
    description: String(item.description ?? ''),
    platform: String(item.platforms ?? ''),
    type: String(item.type ?? 'Game'),
    open_giveaway_url: String(item.open_giveaway_url ?? ''),
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const platform = url.searchParams.get('platform') ?? '';
    const type = url.searchParams.get('type') ?? '';
    const params = new URLSearchParams();
    if (platform) params.set('platform', platform);
    if (type) params.set('type', type);
    const apiUrl = `${GAMERPOWER_API}${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'GamerPower API indisponível' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      return new Response(JSON.stringify({ error: 'Resposta inválida da GamerPower API' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const result = data.map((item: Record<string, unknown>) => mapItem(item));
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao obter jogos';
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
