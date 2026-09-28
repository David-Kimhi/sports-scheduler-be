import cors from 'cors';
import express, { type Request, type Response } from 'express';

import { LOCAL_PORT_FRONTEND } from './config/index.js';
import { analyticsRouter, footballRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');

  app.use(cors({
    origin: [
      `http://localhost:${LOCAL_PORT_FRONTEND}`,
      'https://sports-scheduler.com',
      'https://www.sports-scheduler.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());
  app.use(requestLogger);

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/v1/football', footballRouter);
  app.use('/v1/analytics', analyticsRouter);

  app.use(errorHandler);

  return app;
}
