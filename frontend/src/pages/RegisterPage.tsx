import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUser } from '../api/client';
import type { CreateUserResponse } from '../api/client';

const MIN_PASSWORD_LENGTH = 6;

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<CreateUserResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const u = username.trim();
    const em = email.trim().toLowerCase();
    if (!u || !em) {
      setError('Preenche o nome de utilizador e o email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(em)) {
      setError('Email inválido.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const user = await createUser({ username: u, email: em, password });
      setSuccess(user);
    } catch (e) {
      let msg = e instanceof Error ? e.message : 'Erro ao criar conta.';
      if (msg.length > 200 || msg.includes('invocation') || msg.includes("Can't reach")) {
        msg = 'Não foi possível ligar à base de dados. Verifica a ligação ou tenta mais tarde.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Conta criada</h1>
        <div className="p-4 rounded-lg bg-green-900/30 border border-green-700 text-green-200 text-sm space-y-3">
          <p>
            Enviámos um email de confirmação para <strong>{success.email}</strong>. Clica no link
            dentro do email para ativar a conta e depois entra com o teu email e senha.
          </p>
          <p className="text-gray-400 text-xs">
            Verifica também a pasta de spam. O link expira em 24 horas.
          </p>
          {success.verificationLink && (
            <p className="pt-2 border-t border-green-700">
              <span className="text-gray-400">Link direto (se não receberes o email): </span>
              <a
                href={success.verificationLink}
                className="text-accent hover:underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                Confirmar email
              </a>
            </p>
          )}
        </div>
        <p className="mt-6 text-center">
          <Link to="/entrar" className="text-accent hover:underline font-medium">
            Ir para Entrar
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

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Criar conta</h1>
      <p className="text-gray-400 text-sm mb-6">
        Regista-te com email e senha para guardar as ofertas que já resgataste.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-200 text-sm">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
            Nome de utilizador
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-card border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="ex: jogador123"
            autoComplete="username"
            disabled={loading}
          />
        </div>
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
            placeholder="Mín. 6 caracteres"
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-card border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Repete a senha"
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-accent text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-70"
        >
          {loading ? 'A criar conta…' : 'Registar'}
        </button>
      </form>
      <p className="mt-4 text-center text-gray-400 text-sm">
        Já tens conta?{' '}
        <Link to="/entrar" className="text-accent hover:underline">
          Entrar
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
