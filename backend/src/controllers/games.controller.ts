import { Request, Response, NextFunction } from 'express';
import { fetchGiveaways } from '../services/gamerpower.service';

export async function getGames(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const platform = typeof req.query.platform === 'string' ? req.query.platform : undefined;
    const type = typeof req.query.type === 'string' ? req.query.type : undefined;
    const games = await fetchGiveaways(platform, type);
    try {
      res.json(games);
    } catch (sendErr) {
      next(sendErr);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao obter jogos';
    const e = new Error(message) as Error & { statusCode?: number };
    e.statusCode = 502;
    next(e);
  }
}
