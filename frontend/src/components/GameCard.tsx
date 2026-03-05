import type { Game } from '../api/client';

interface GameCardProps {
  game: Game;
  isClaimed?: boolean;
  onClaim?: (game: Game) => void;
  isClaiming?: boolean;
}

export default function GameCard({ game, isClaimed, onClaim, isClaiming }: GameCardProps) {
  const handleResgate = () => {
    window.open(game.open_giveaway_url, '_blank', 'noopener,noreferrer');
    if (onClaim && !isClaimed && !isClaiming) onClaim(game);
  };

  return (
    <article className="bg-card rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors flex flex-col">
      <div className="aspect-video bg-gray-800 relative">
        {game.thumbnail ? (
          <img
            src={game.thumbnail}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
            Sem imagem
          </div>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium bg-accent/90 text-white">
          {game.type === 'Game' ? 'Jogo' : game.type}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-white line-clamp-2 mb-2" title={game.title}>
          {game.title}
        </h3>
        {game.platform && (
          <p className="text-xs text-gray-400 mb-3 truncate" title={game.platform}>
            {game.platform}
          </p>
        )}
        <button
          type="button"
          onClick={handleResgate}
          disabled={isClaiming}
          className={`mt-auto w-full py-2 rounded-lg font-medium transition-colors ${
            isClaimed
              ? 'bg-gray-600 text-gray-400 cursor-default'
              : 'bg-accent text-white hover:bg-blue-600'
          } ${isClaiming ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isClaimed ? 'Já resgatado' : isClaiming ? 'A guardar…' : 'Resgatar'}
        </button>
      </div>
    </article>
  );
}
