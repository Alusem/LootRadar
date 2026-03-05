import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { sendVerificationEmail } from './email.service';

const DB_CONNECTION_MSG =
  'Não foi possível ligar à base de dados. Verifica a ligação à internet ou tenta mais tarde.';
const DB_SCHEMA_MSG =
  'Base de dados desatualizada. No backend executa: npx prisma migrate deploy';
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY_HOURS = 24;
const SITE_URL = process.env.SITE_URL ?? 'http://localhost:5173';

function isConnectionError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return err.code === 'P1001' || err.code === 'P1002' || err.code === 'P1017';
  }
  if (err instanceof Error) {
    return (
      err.message.includes("Can't reach database") ||
      err.message.includes('Connection refused') ||
      err.message.includes('ETIMEDOUT') ||
      err.message.includes('ENOTFOUND')
    );
  }
  return false;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
}

export interface CreateUserResult {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  verificationLink?: string;
}

export async function createUser(data: CreateUserInput): Promise<CreateUserResult> {
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  try {
    const user = await prisma.user.create({
      data: {
        username: data.username.trim(),
        email: data.email.trim().toLowerCase(),
        passwordHash,
        emailVerificationToken: token,
        emailVerificationExpiresAt: expiresAt,
      },
    });

    const result: CreateUserResult = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
    try {
      const emailResult = await sendVerificationEmail(user.email, user.username, token);
      if (emailResult.verificationLink) result.verificationLink = emailResult.verificationLink;
    } catch {
      result.verificationLink = `${SITE_URL.replace(/\/$/, '')}/confirmar-email?token=${encodeURIComponent(token)}`;
    }
    return result;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const conflict = new Error('Username ou email já existente') as Error & { statusCode?: number };
      conflict.statusCode = 409;
      throw conflict;
    }
    if (isConnectionError(err)) {
      const connectionErr = new Error(DB_CONNECTION_MSG) as Error & { statusCode?: number };
      connectionErr.statusCode = 503;
      throw connectionErr;
    }
    const errMessage = err instanceof Error ? err.message : String(err);
    if (
      errMessage.includes('Unknown arg') ||
      errMessage.includes('Invalid prisma') ||
      errMessage.includes('passwordHash') ||
      errMessage.includes('emailVerification')
    ) {
      const schemaErr = new Error(DB_SCHEMA_MSG) as Error & { statusCode?: number };
      schemaErr.statusCode = 503;
      throw schemaErr;
    }
    throw err;
  }
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function findUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, username: true },
    });
  } catch (err) {
    if (isConnectionError(err)) {
      const connectionErr = new Error(DB_CONNECTION_MSG) as Error & { statusCode?: number };
      connectionErr.statusCode = 503;
      throw connectionErr;
    }
    throw err;
  }
}

export async function findUserByEmailForLogin(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, username: true, passwordHash: true, emailVerifiedAt: true },
    });
  } catch (err) {
    if (isConnectionError(err)) {
      const connectionErr = new Error(DB_CONNECTION_MSG) as Error & { statusCode?: number };
      connectionErr.statusCode = 503;
      throw connectionErr;
    }
    throw err;
  }
}

export async function loginWithPassword(
  email: string,
  password: string
): Promise<{ id: string; username: string } | { needVerify: true } | { needPassword: true } | null> {
  const user = await findUserByEmailForLogin(email);
  if (!user) return null;
  if (!user.passwordHash) return { needPassword: true };
  if (!user.emailVerifiedAt) return { needVerify: true };
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return null;
  return { id: user.id, username: user.username };
}

export async function verifyEmailToken(
  token: string
): Promise<{ id: string; username: string } | null> {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: { gt: new Date() },
    },
    select: { id: true, username: true },
  });
  if (!user) return null;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
  });
  return user;
}

export async function resendVerificationEmail(
  email: string
): Promise<{ ok: boolean; verificationLink?: string; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, username: true, email: true, emailVerifiedAt: true },
    });
    if (!user) return { ok: false, error: 'Não existe conta com este email.' };
    if (user.emailVerifiedAt) return { ok: false, error: 'Este email já está confirmado.' };
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiresAt: expiresAt,
      },
    });
    return await sendVerificationEmail(user.email, user.username, token);
  } catch (err) {
    if (isConnectionError(err)) return { ok: false, error: DB_CONNECTION_MSG };
    throw err;
  }
}
