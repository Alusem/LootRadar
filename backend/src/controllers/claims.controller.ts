import { Request, Response } from 'express';
import { createClaim, getClaimsByUserId as getClaimsByUserIdService } from '../services/claims.service';

export async function postClaim(req: Request, res: Response): Promise<void> {
  const { userId, gamerPowerItemId, title, open_giveaway_url: openGiveawayUrl } = req.body ?? {};

  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    res.status(400).json({ error: 'userId é obrigatório' });
    return;
  }
  if (typeof gamerPowerItemId !== 'number' || !Number.isInteger(gamerPowerItemId)) {
    res.status(400).json({ error: 'gamerPowerItemId deve ser um número inteiro' });
    return;
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    res.status(400).json({ error: 'title é obrigatório' });
    return;
  }

  try {
    const claim = await createClaim({
      userId: userId.trim(),
      gamerPowerItemId,
      title: title.trim(),
      openGiveawayUrl: typeof openGiveawayUrl === 'string' ? openGiveawayUrl : undefined,
    });
    res.status(201).json(claim);
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    const message = err instanceof Error ? err.message : 'Erro ao registar resgate';
    res.status(status).json({ error: message });
  }
}

export async function getClaimsByUserId(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ error: 'userId é obrigatório' });
    return;
  }

  try {
    const claims = await getClaimsByUserIdService(userId);
    if (claims === null) {
      res.status(404).json({ error: 'Utilizador não encontrado' });
      return;
    }
    res.json(claims);
  } catch (_err) {
    res.status(500).json({ error: 'Erro ao listar resgates' });
  }
}
