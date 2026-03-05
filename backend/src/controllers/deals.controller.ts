import { Request, Response, NextFunction } from 'express';
import { fetchDeals } from '../services/cheapshark.service';

export async function getDeals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const storeId = typeof req.query.storeId === 'string' ? req.query.storeId : undefined;
    const upperPrice =
      typeof req.query.upperPrice === 'string' && req.query.upperPrice !== ''
        ? parseFloat(req.query.upperPrice)
        : undefined;
    const pageSize =
      typeof req.query.pageSize === 'string' && req.query.pageSize !== ''
        ? parseInt(req.query.pageSize, 10)
        : undefined;

    const deals = await fetchDeals({
      storeId,
      upperPrice: Number.isFinite(upperPrice) ? upperPrice : undefined,
      pageSize: Number.isInteger(pageSize) && pageSize! > 0 ? pageSize : undefined,
    });
    try {
      res.json(deals);
    } catch (sendErr) {
      next(sendErr);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao obter promoções';
    const e = new Error(message) as Error & { statusCode?: number };
    e.statusCode = 502;
    next(e);
  }
}
