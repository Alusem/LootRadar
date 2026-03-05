import axios from 'axios';

const GAMERPOWER_API = 'https://www.gamerpower.com/api/giveaways';
const REQUEST_TIMEOUT_MS = 60000; // 60s — a API pode demorar com muitos registos
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos em cache

let cache: { data: GameDto[]; key: string; expiresAt: number } | null = null;

export interface GameDto {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
  platform: string;
  type: string;
  open_giveaway_url: string;
}

interface GamerPowerRawItem {
  id: number;
  title?: string;
  thumbnail?: string;
  description?: string;
  platforms?: string;
  type?: string;
  open_giveaway_url?: string;
  [key: string]: unknown;
}

function mapToGameDto(item: GamerPowerRawItem): GameDto {
  return {
    id: item.id,
    title: item.title ?? '',
    thumbnail: item.thumbnail ?? '',
    description: item.description ?? '',
    platform: item.platforms ?? '',
    type: item.type ?? 'Game',
    open_giveaway_url: item.open_giveaway_url ?? '',
  };
}

export async function fetchGiveaways(platform?: string, type?: string): Promise<GameDto[]> {
  const cacheKey = [platform ?? '', type ?? ''].join('|');
  if (cache && cache.key === cacheKey && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  const params: Record<string, string> = {};
  if (platform) params.platform = platform;
  if (type) params.type = type;

  const { data } = await axios.get<GamerPowerRawItem[]>(GAMERPOWER_API, {
    params,
    timeout: REQUEST_TIMEOUT_MS,
    validateStatus: (status) => status === 200,
  });

  if (!Array.isArray(data)) {
    throw new Error('Resposta inválida da GamerPower API');
  }

  const result = data.map(mapToGameDto);
  cache = { data: result, key: cacheKey, expiresAt: Date.now() + CACHE_TTL_MS };
  return result;
}
