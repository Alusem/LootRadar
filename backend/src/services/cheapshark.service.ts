import axios from 'axios';

const CHEAPSHARK_BASE = 'https://www.cheapshark.com/api/1.0';
const REQUEST_TIMEOUT_MS = 15000;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache: { data: DealDto[]; key: string; expiresAt: number } | null = null;

export interface DealDto {
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

interface CheapSharkRawDeal {
  dealID?: string | number;
  title?: string;
  thumb?: string;
  salePrice?: string | number;
  normalPrice?: string | number;
  savings?: string | number;
  storeID?: string | number;
  [key: string]: unknown;
}

interface CheapSharkStore {
  storeID: string | number;
  storeName?: string;
}

let storesCache: { storeName: Record<string, string>; expiresAt: number } | null = null;

async function getStoreNames(): Promise<Record<string, string>> {
  if (storesCache && Date.now() < storesCache.expiresAt) {
    return storesCache.storeName;
  }
  try {
    const { data } = await axios.get<CheapSharkStore[]>(`${CHEAPSHARK_BASE}/stores`, {
      timeout: REQUEST_TIMEOUT_MS,
      validateStatus: (status) => status === 200,
    });
    const storeName: Record<string, string> = {};
    if (Array.isArray(data)) {
      data.forEach((s) => {
        const id = String(s.storeID ?? '');
        storeName[id] = (s.storeName && String(s.storeName).trim()) || `Loja ${id}`;
      });
    }
    storesCache = { storeName, expiresAt: Date.now() + CACHE_TTL_MS };
    return storeName;
  } catch (err) {
    storesCache = null;
    throw err;
  }
}

function mapToDealDto(item: CheapSharkRawDeal, storeNames: Record<string, string>): DealDto {
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

export interface FetchDealsParams {
  storeId?: string;
  upperPrice?: number;
  pageSize?: number;
}

export async function fetchDeals(params?: FetchDealsParams): Promise<DealDto[]> {
  const storeId = params?.storeId ?? '';
  const upperPrice = params?.upperPrice;
  const pageSize = params?.pageSize ?? 24;
  const cacheKey = [storeId, upperPrice ?? '', pageSize].join('|');

  if (cache && cache.key === cacheKey && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  const queryParams: Record<string, string | number> = {
    pageSize,
  };
  if (storeId) queryParams.storeID = storeId;
  if (upperPrice != null) queryParams.upperPrice = upperPrice;

  try {
    const [dealsRes, storeNames] = await Promise.all([
      axios.get<CheapSharkRawDeal[]>(`${CHEAPSHARK_BASE}/deals`, {
        params: queryParams,
        timeout: REQUEST_TIMEOUT_MS,
        validateStatus: (status) => status === 200,
      }),
      getStoreNames(),
    ]);

    const data = dealsRes.data;
    if (!Array.isArray(data)) {
      throw new Error('Resposta inválida da CheapShark API');
    }

    const result = data.map((item) => mapToDealDto(item, storeNames));
    cache = { data: result, key: cacheKey, expiresAt: Date.now() + CACHE_TTL_MS };
    return result;
  } catch (err) {
    cache = null;
    if (axios.isAxiosError(err)) {
      const msg = err.response?.status ? `CheapShark API respondeu ${err.response.status}` : err.message || 'Erro ao contactar CheapShark';
      throw new Error(msg);
    }
    throw err;
  }
}
