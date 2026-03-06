const CHEAPSHARK_BASE = 'https://www.cheapshark.com/api/1.0';

interface DealDto {
  id: string;
  title: string;
  thumbnail: string;
  salePrice: number;
  normalPrice: number;
  savings: number;
  storeId: string;
  storeName: string;
  dealUrl: string;
}

async function getStoreNames(): Promise<Record<string, string>> {
  const res = await fetch(`${CHEAPSHARK_BASE}/stores`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return {};
  const data = await res.json();
  const storeName: Record<string, string> = {};
  if (Array.isArray(data)) {
    data.forEach((s: { storeID?: string | number; storeName?: string }) => {
      const id = String(s.storeID ?? '');
      storeName[id] = (s.storeName && String(s.storeName).trim()) || `Loja ${id}`;
    });
  }
  return storeName;
}

function mapDeal(item: Record<string, unknown>, storeNames: Record<string, string>): DealDto {
  const dealId = String(item.dealID ?? '');
  const storeId = String(item.storeID ?? '');
  const salePrice = typeof item.salePrice === 'number' ? item.salePrice : parseFloat(String(item.salePrice ?? '0')) || 0;
  const normalPrice = typeof item.normalPrice === 'number' ? item.normalPrice : parseFloat(String(item.normalPrice ?? '0')) || 0;
  const savings = typeof item.savings === 'number' ? item.savings : parseFloat(String(item.savings ?? '0')) || 0;
  return {
    id: dealId,
    title: String(item.title ?? ''),
    thumbnail: String(item.thumb ?? ''),
    salePrice,
    normalPrice,
    savings,
    storeId,
    storeName: storeNames[storeId] ?? `Loja ${storeId}`,
    dealUrl: `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(dealId)}`,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pageSize = url.searchParams.get('pageSize') || '24';
    const storeId = url.searchParams.get('storeId') ?? '';
    const upperPrice = url.searchParams.get('upperPrice') ?? '';
    const params = new URLSearchParams();
    params.set('pageSize', pageSize);
    if (storeId) params.set('storeID', storeId);
    if (upperPrice) params.set('upperPrice', upperPrice);
    const [dealsRes, storeNames] = await Promise.all([
      fetch(`${CHEAPSHARK_BASE}/deals?${params}`, { signal: AbortSignal.timeout(15000) }),
      getStoreNames(),
    ]);
    if (!dealsRes.ok) {
      return new Response(JSON.stringify({ error: 'CheapShark API indisponível' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const data = await dealsRes.json();
    if (!Array.isArray(data)) {
      return new Response(JSON.stringify({ error: 'Resposta inválida da CheapShark API' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const result = data.map((item: Record<string, unknown>) => mapDeal(item, storeNames));
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao obter promoções';
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
