interface DealFilterBarProps {
  storeId: string;
  upperPrice: string;
  onStoreChange: (value: string) => void;
  onUpperPriceChange: (value: string) => void;
}

const STORES = [
  { value: '', label: 'Todas as lojas' },
  { value: '1', label: 'Steam' },
  { value: '25', label: 'Epic Games Store' },
  { value: '7', label: 'GOG' },
  { value: '11', label: 'Humble Store' },
  { value: '15', label: 'Fanatical' },
  { value: '13', label: 'Ubisoft' },
  { value: '3', label: 'GreenManGaming' },
  { value: '21', label: 'WinGameStore' },
  { value: '23', label: 'GameBillet' },
  { value: '27', label: 'Gamesplanet' },
  { value: '28', label: 'Gamesload' },
  { value: '29', label: '2Game' },
  { value: '30', label: 'IndieGala' },
  { value: '35', label: 'DreamGame' },
];

export default function DealFilterBar({
  storeId,
  upperPrice,
  onStoreChange,
  onUpperPriceChange,
}: DealFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <div className="flex items-center gap-2">
        <label htmlFor="deal-store" className="text-sm text-gray-400">
          Loja
        </label>
        <select
          id="deal-store"
          value={storeId}
          onChange={(e) => onStoreChange(e.target.value)}
          className="bg-card border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          {STORES.map((s) => (
            <option key={s.value || 'all'} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="deal-price" className="text-sm text-gray-400">
          Preço máx. (R$)
        </label>
        <input
          id="deal-price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Qualquer"
          value={upperPrice}
          onChange={(e) => onUpperPriceChange(e.target.value)}
          className="bg-card border border-gray-600 rounded-lg px-3 py-2 text-sm text-white w-24 focus:ring-2 focus:ring-accent focus:border-transparent placeholder-gray-500"
        />
      </div>
    </div>
  );
}
