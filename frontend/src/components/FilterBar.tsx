interface FilterBarProps {
  platform: string;
  type: string;
  onPlatformChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

const PLATFORMS = [
  { value: '', label: 'Todas as plataformas' },
  { value: 'pc', label: 'PC' },
  { value: 'steam', label: 'Steam' },
  { value: 'epic-games-store', label: 'Epic Games' },
  { value: 'gog', label: 'GOG' },
  { value: 'origin', label: 'Origin' },
  { value: 'ubisoft', label: 'Ubisoft' },
  { value: 'itch.io', label: 'Itch.io' },
];

const TYPES = [
  { value: '', label: 'Todos os tipos' },
  { value: 'game', label: 'Jogo' },
  { value: 'loot', label: 'Loot' },
  { value: 'beta', label: 'Beta' },
];

export default function FilterBar({ platform, type, onPlatformChange, onTypeChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <div className="flex items-center gap-2">
        <label htmlFor="platform" className="text-sm text-gray-400">
          Plataforma
        </label>
        <select
          id="platform"
          value={platform}
          onChange={(e) => onPlatformChange(e.target.value)}
          className="bg-card border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          {PLATFORMS.map((p) => (
            <option key={p.value || 'all'} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor="type" className="text-sm text-gray-400">
          Tipo
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="bg-card border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          {TYPES.map((t) => (
            <option key={t.value || 'all'} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
