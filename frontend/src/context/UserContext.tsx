import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'lootradar_user';

interface UserState {
  userId: string | null;
  username: string | null;
}

const UserContext = createContext<{
  user: UserState;
  setUser: (userId: string, username: string) => void;
  logout: () => void;
} | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserState>({ userId: null, username: null });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { userId, username } = JSON.parse(raw) as { userId: string; username: string };
        if (userId && username) setUserState({ userId, username });
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setUser = useCallback((userId: string, username: string) => {
    setUserState({ userId, username });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, username }));
  }, []);

  const logout = useCallback(() => {
    setUserState({ userId: null, username: null });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
