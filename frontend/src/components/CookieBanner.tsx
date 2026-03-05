import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lootradar_cookies_accepted';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-900/95 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 z-50 border-t border-blue-700">
      <p className="text-sm">
        Ao usar o site, aceitas a nossa{' '}
        <span className="underline">política de privacidade</span>.
      </p>
      <button
        type="button"
        onClick={accept}
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium transition-colors"
      >
        Aceitar
      </button>
    </div>
  );
}
