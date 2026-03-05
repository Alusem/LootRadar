import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClaimsByUserId } from '../api/client';
import type { Claim } from '../api/client';
import { useUser } from '../context/UserContext';

export default function MyClaimsPage() {
  const { user } = useUser();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user.userId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getClaimsByUserId(user.userId)
      .then((data) => {
        if (!cancelled) setClaims(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erro ao carregar.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user.userId]);

  if (!user.userId) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Meus resgates</h1>
      <p className="text-gray-400 text-sm mb-6">
        Ofertas que já registaste. Clica no link para abrir a página de resgate.
      </p>
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-200">
          {error}
        </div>
      )}
      {loading ? (
        <p className="text-gray-400">A carregar…</p>
      ) : claims.length === 0 ? (
        <p className="text-gray-400">
          Ainda não registaste nenhum resgate. Vai às{' '}
          <Link to="/" className="text-accent hover:underline">
            ofertas
          </Link>{' '}
          e clica em Resgatar para guardar.
        </p>
      ) : (
        <ul className="space-y-3">
          {claims.map((claim) => (
            <li
              key={claim.id}
              className="bg-card border border-gray-700 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white truncate">{claim.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Resgatado em {new Date(claim.claimedAt).toLocaleDateString('pt-PT')}
                </p>
              </div>
              {(claim.open_giveaway_url ?? claim.openGiveawayUrl) ? (
                <a
                  href={claim.open_giveaway_url ?? claim.openGiveawayUrl ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Abrir oferta
                </a>
              ) : (
                <a
                  href={`https://www.gamerpower.com/open/giveaway/${claim.gamerPowerItemId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Abrir oferta
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
