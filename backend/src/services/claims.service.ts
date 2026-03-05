import { prisma } from '../lib/prisma';
import { findUserById } from './users.service';

export interface CreateClaimInput {
  userId: string;
  gamerPowerItemId: number;
  title: string;
  openGiveawayUrl?: string;
}

export async function createClaim(data: CreateClaimInput) {
  const user = await findUserById(data.userId);
  if (!user) {
    const notFound = new Error('Utilizador não encontrado') as Error & { statusCode?: number };
    notFound.statusCode = 404;
    throw notFound;
  }

  const existing = await prisma.claim.findFirst({
    where: {
      userId: data.userId,
      gamerPowerItemId: data.gamerPowerItemId,
    },
  });
  if (existing) {
    const conflict = new Error('Este jogo já foi resgatado por este utilizador') as Error & { statusCode?: number };
    conflict.statusCode = 409;
    throw conflict;
  }

  return prisma.claim.create({
    data: {
      userId: data.userId,
      gamerPowerItemId: data.gamerPowerItemId,
      title: data.title.trim(),
      ...(data.openGiveawayUrl != null && data.openGiveawayUrl.trim() !== ''
        ? { openGiveawayUrl: data.openGiveawayUrl.trim() }
        : {}),
    },
  });
}

export async function getClaimsByUserId(userId: string) {
  const user = await findUserById(userId);
  if (!user) return null;

  return prisma.claim.findMany({
    where: { userId },
    orderBy: { claimedAt: 'desc' },
  });
}
