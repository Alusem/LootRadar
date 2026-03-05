import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, resendVerificationEmail } from '../api/client';
import { useUser } from '../context/UserContext';

export default function LoginPage() {
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendLink, setResendLink] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendMessage(null);
    const em = email.trim().toLowerCase();
    if (!em || !password) {
      setError('Indica o email e a senha.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(em)) {
      setError('Email inválido.');
      return;
    }
    setLoading(true);
    try {
      const user = await login({ email: em, password });
      setUser(user.id, user.username);
      navigate('/meus-resgates');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao iniciar sessão.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const em = email.trim().toLowerCase();
    if (!em) {
      setError('Indica o teu email para reenviar o link.');
      return;
    }
    setResendLoading(true);
    setResendMessage(null);
    setResendLink(null);
    setError(null);
    try {
      const data = await resendVerificationEmail(em);
      setResendMessage(data.message);
      if (data.verificationLink) setResendLink(data.verificationLink);
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : 'Erro ao reenviar.');
    } finally {
      setResendLoading(false);
    }
  };

  const isEmailNotVerified =
    error?.includes('Confirma o teu email') || error?.toLowerCase().includes('confirma');

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Entrar</h1>
      <p className="text-gray-400 text-sm mb-6">
        Usa o email e a senha com que te registaste.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-200 text-sm">
            {error}
            {isEmailNotVerified && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="mt-2 block w-full py-2 rounded bg-red-800/50 hover:bg-red-800 text-sm font-medium disabled:opacity-70"
              >
                {resendLoading ? 'A reenviar…' : 'Reenviar email de confirmação'}
              </button>
            )}
          </div>
        )}
        {resendMessage && !error && (
          <div className="p-4 rounded-lg bg-green-900/30 border border-green-700 text-green-200 text-sm space-y-2">
            <p>{resendMessage}</p>
            {resendLink && (
              <p>
                <a
                  href={resendLink}
                  className="text-accent hover:underline break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Confirmar email agora
                </a>
              </p>
            )}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-card border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="ex: email@exemplo.com"
            autoComplete="email"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-card border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-accent text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-70"
        >
          {loading ? 'A entrar…' : 'Entrar'}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-400 text-sm">
        Ainda não tens conta?{' '}
        <Link to="/registar" className="text-accent hover:underline">
          Criar conta
        </Link>
      </p>
      <p className="mt-2 text-center">
        <Link to="/" className="text-accent hover:underline">
          Voltar às ofertas
        </Link>
      </p>
    </div>
  );
}
