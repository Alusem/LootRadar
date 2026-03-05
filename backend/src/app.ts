import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err && typeof err === 'object' && 'stack' in err && typeof (err as Error).stack === 'string') {
    console.error((err as Error).stack);
  }
  if (res.headersSent) return;
  const status = (err as { statusCode?: number }).statusCode ?? 500;
  const message =
    err instanceof Error && err.message
      ? err.message
      : typeof err === 'object' && err !== null && 'toString' in err
        ? String((err as { toString: () => string }).toString())
        : String(err);
  const safeMessage = (message && message.trim()) || 'Erro interno do servidor.';
  res.setHeader('Content-Type', 'application/json');
  res.status(status).send(JSON.stringify({ error: safeMessage }));
});

export default app;
