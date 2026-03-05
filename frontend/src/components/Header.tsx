import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Header() {
  const { user, logout } = useUser();

  return (
    <header className="bg-card border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-white hover:text-accent transition-colors">
          LootRadar
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6 flex-wrap">
          {user.userId && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400 truncate max-w-[120px]" title={user.username ?? ''}>
                {user.username}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sair
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
