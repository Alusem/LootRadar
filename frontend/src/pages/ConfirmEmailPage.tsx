import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/client';
import { useUser } from '../context/UserContext';

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { setUser } = useUser();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Link inválido. Falta o token de confirmação.');
      return;
    }
    let cancelled = false;
    verifyEmail(token)
      .then((data) => {
        if (cancelled) return;
        setStatus('success');
        setMessage(data.message);
        setUsername(data.user.username);
        setUser(data.user.id, data.user.username);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Link inválido ou expirado.');
      });
    return () => {
      cancelled = true;
    };
  }, [token, setUser]);

  if (status === 'loading') {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <p className="text-gray-400">A confirmar o teu email…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Erro</h1>
        <div className="p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-200 text-sm mb-6">
          {message}
        </div>
        <p className="text-center">
          <Link to="/entrar" className="text-accent hover:underline">
            Ir para Entrar
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link to="/registar" className="text-gray-400 hover:text-white text-sm">
            Criar conta
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Email confirmado</h1>
      <div className="p-4 rounded-lg bg-green-900/30 border border-green-700 text-green-200 text-sm mb-6">
        {username ? (
          <p>
            Olá <strong>{username}</strong>, a tua conta está ativa. Já podes entrar e guardar os
            teus resgates.
          </p>
        ) : (
          <p>{message}</p>
        )}
      </div>
      <p className="text-center">
        <Link to="/meus-resgates" className="text-accent hover:underline font-medium">
          Ir para Meus resgates
        </Link>
      </p>
      <p className="mt-2 text-center">
        <Link to="/" className="text-gray-400 hover:text-white text-sm">
          Voltar às ofertas
        </Link>
      </p>
    </div>
  );
}
