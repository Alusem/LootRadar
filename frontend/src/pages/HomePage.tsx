import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getGames, getDeals, createClaim } from '../api/client';
import type { Game, Deal } from '../api/client';
import { useUser } from '../context/UserContext';
import FilterBar from '../components/FilterBar';
import DealFilterBar from '../components/DealFilterBar';
import GameCard from '../components/GameCard';
import GameCardSkeleton from '../components/GameCardSkeleton';
import DealCard from '../components/DealCard';

type TabId = 'gratuitos' | 'promocoes';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const abaParam = searchParams.get('aba');
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    abaParam === 'promocoes' ? 'promocoes' : 'gratuitos'
  );

  const { user } = useUser();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState('');
  const [type, setType] = useState('');
  const [claimedIds, setClaimedIds] = useState<Set<number>>(new Set());
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [errorDeals, setErrorDeals] = useState<string | null>(null);
  const [dealStoreId, setDealStoreId] = useState('');
  const [dealUpperPrice, setDealUpperPrice] = useState('');

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGames({
        platform: platform || undefined,
        type: type || undefined,
      });
      setGames(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar ofertas.');
    } finally {
      setLoading(false);
    }
  }, [platform, type]);

  const loadDeals = useCallback(async () => {
    setLoadingDeals(true);
    setErrorDeals(null);
    try {
      const upper = dealUpperPrice.trim() ? parseFloat(dealUpperPrice) : undefined;
      const data = await getDeals({
        pageSize: 24,
        storeId: dealStoreId || undefined,
        upperPrice: Number.isFinite(upper) ? upper : undefined,
      });
      setDeals(data);
    } catch (e) {
      setErrorDeals(e instanceof Error ? e.message : 'Erro ao carregar promoções.');
    } finally {
      setLoadingDeals(false);
    }
  }, [dealStoreId, dealUpperPrice]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  useEffect(() => {
    if (activeTab === 'promocoes') {
      loadDeals();
    }
  }, [activeTab, loadDeals]);

  useEffect(() => {
    if (activeTab === 'promocoes') {
      setSearchParams({ aba: 'promocoes' }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
  };

  const handleClaim = async (game: Game) => {
    if (!user.userId || claimingId !== null) return;
    setClaimingId(game.id);
    try {
      await createClaim({
        userId: user.userId,
        gamerPowerItemId: game.id,
        title: game.title,
        open_giveaway_url: game.open_giveaway_url,
      });
      setClaimedIds((prev) => new Set(prev).add(game.id));
    } catch {
      setClaimedIds((prev) => new Set(prev).add(game.id));
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-gray-700">
        <button
          type="button"
          onClick={() => handleTabChange('gratuitos')}
          className={`px-4 py-2.5 font-medium rounded-t-lg transition-colors ${
            activeTab === 'gratuitos'
              ? 'bg-card text-accent border border-gray-700 border-b-0 -mb-px'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Jogos gratuitos
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('promocoes')}
          className={`px-4 py-2.5 font-medium rounded-t-lg transition-colors ${
            activeTab === 'promocoes'
              ? 'bg-card text-accent border border-gray-700 border-b-0 -mb-px'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Promoções
        </button>
      </div>

      {activeTab === 'gratuitos' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-2">Jogos gratuitos</h1>
          <p className="text-gray-400 text-sm mb-6">
            Jogos e loots 100% grátis. Clica em Resgatar para abrir o link oficial.
          </p>
          <FilterBar
            platform={platform}
            type={type}
            onPlatformChange={setPlatform}
            onTypeChange={setType}
          />
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-200">
              {error}
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          ) : games.length === 0 ? (
            <p className="text-gray-400">Nenhuma oferta encontrada com estes filtros.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isClaimed={claimedIds.has(game.id)}
                  onClaim={user.userId ? handleClaim : undefined}
                  isClaiming={claimingId === game.id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'promocoes' && (
        <>
          <h1 className="text-2xl font-bold text-white mb-2">Promoções atuais</h1>
          <p className="text-gray-400 text-sm mb-6">
            Descontos em jogos em várias lojas. Clica em Ver oferta para abrir o link.
          </p>
          <DealFilterBar
            storeId={dealStoreId}
            upperPrice={dealUpperPrice}
            onStoreChange={setDealStoreId}
            onUpperPriceChange={setDealUpperPrice}
          />
          {errorDeals && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-200">
              {errorDeals}
            </div>
          )}
          {loadingDeals ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          ) : deals.length === 0 ? (
            <p className="text-gray-400">Nenhuma promoção encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {deals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
          <p className="mt-6 text-xs text-gray-500">
            Dados de promoções via{' '}
            <a
              href="https://www.cheapshark.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-accent"
            >
              CheapShark.com
            </a>
          </p>
        </>
      )}
    </div>
  );
}
