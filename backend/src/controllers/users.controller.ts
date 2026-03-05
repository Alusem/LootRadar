import { Request, Response } from 'express';
import {
  createUser,
  loginWithPassword,
  verifyEmailToken,
  resendVerificationEmail,
} from '../services/users.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export async function postUser(req: Request, res: Response): Promise<void> {
  const { username, email, password } = req.body ?? {};

  if (!username || typeof username !== 'string' || !username.trim()) {
    res.status(400).json({ error: 'Nome de utilizador é obrigatório' });
    return;
  }
  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400).json({ error: 'Email é obrigatório' });
    return;
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    res.status(400).json({ error: 'Email inválido' });
    return;
  }
  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Senha é obrigatória' });
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    return;
  }

  try {
    const user = await createUser({
      username: username.trim(),
      email: email.trim(),
      password,
    });
    res.status(201).json(user);
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    const message = err instanceof Error ? err.message : 'Erro ao criar utilizador';
    res.status(status).json({ error: message });
  }
}

export async function postLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body ?? {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400).json({ error: 'Email é obrigatório' });
    return;
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    res.status(400).json({ error: 'Email inválido' });
    return;
  }
  if (!password || typeof password !== 'string' || !password.length) {
    res.status(400).json({ error: 'Senha é obrigatória' });
    return;
  }

  try {
    const result = await loginWithPassword(email.trim(), password);
    if (!result) {
      res.status(401).json({ error: 'Email ou senha incorretos.' });
      return;
    }
    if ('needPassword' in result && result.needPassword) {
      res.status(400).json({
        error: 'Esta conta foi criada antes das senhas. Cria uma nova conta com email e senha.',
      });
      return;
    }
    if ('needVerify' in result && result.needVerify) {
      res.status(403).json({
        error: 'Confirma o teu email primeiro. Verifica a caixa de entrada (e o spam).',
        code: 'EMAIL_NOT_VERIFIED',
      });
      return;
    }
    if ('id' in result && 'username' in result) {
      res.status(200).json({ id: result.id, username: result.username });
    }
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    const message = err instanceof Error ? err.message : 'Erro ao iniciar sessão';
    res.status(status).json({ error: message });
  }
}

export async function getVerifyEmail(req: Request, res: Response): Promise<void> {
  const token = typeof req.query.token === 'string' ? req.query.token.trim() : '';
  if (!token) {
    res.status(400).json({ error: 'Token em falta' });
    return;
  }
  try {
    const user = await verifyEmailToken(token);
    if (!user) {
      res.status(400).json({ error: 'Link inválido ou expirado. Pede um novo email de confirmação.' });
      return;
    }
    res.status(200).json({ message: 'Email confirmado.', user: { id: user.id, username: user.username } });
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    const message = err instanceof Error ? err.message : 'Erro ao confirmar email';
    res.status(status).json({ error: message });
  }
}

export async function postResendVerification(req: Request, res: Response): Promise<void> {
  const { email } = req.body ?? {};
  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400).json({ error: 'Email é obrigatório' });
    return;
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    res.status(400).json({ error: 'Email inválido' });
    return;
  }
  try {
    const result = await resendVerificationEmail(email.trim());
    if (!result.ok && !result.verificationLink) {
      res.status(400).json({ error: result.error ?? 'Não foi possível reenviar o email.' });
      return;
    }
    res.status(200).json({
      message: result.ok
        ? 'Email de confirmação reenviado. Verifica a caixa de entrada.'
        : 'Email não configurado. Usa o link abaixo para confirmar.',
      verificationLink: result.verificationLink,
    });
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    const message = err instanceof Error ? err.message : 'Erro ao reenviar email';
    res.status(status).json({ error: message });
  }
}
