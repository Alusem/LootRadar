import type { Deal } from '../api/client';

interface DealCardProps {
  deal: Deal;
}

function formatPrice(value: number): string {
  if (value === 0) return 'Grátis';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DealCard({ deal }: DealCardProps) {
  const handleVerOferta = () => {
    window.open(deal.storeUrl ?? deal.dealUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="bg-card rounded-xl border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors flex flex-col">
      <div className="aspect-video bg-gray-800 relative">
        {deal.thumbnail ? (
          <img
            src={deal.thumbnail}
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
        {deal.savings > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium bg-accent/90 text-white">
            -{Math.round(deal.savings)}%
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-white line-clamp-2 mb-2" title={deal.title}>
          {deal.title}
        </h3>
        {deal.storeName && (
          <p className="text-xs text-gray-400 mb-2 truncate" title={deal.storeName}>
            {deal.storeName}
          </p>
        )}
        <div className="flex items-baseline gap-2 mb-3 flex-wrap text-sm">
          {deal.normalPrice > 0 && deal.salePrice < deal.normalPrice && (
            <span className="text-gray-500 line-through">
              {formatPrice(deal.normalPrice)}
            </span>
          )}
          <span className="font-semibold text-accent">
            {formatPrice(deal.salePrice)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleVerOferta}
          className="mt-auto w-full py-2 rounded-lg font-medium transition-colors bg-accent text-white hover:bg-blue-600"
        >
          Ver oferta
        </button>
      </div>
    </article>
  );
}
