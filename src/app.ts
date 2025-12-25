import cors from 'cors';
import express from 'express';

import { LOCAL_PORT_FRONTEND } from './config/index.js';
import { analyticsRouter, footballRouter } from './routes/index.js';

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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());

  app.use('/football', footballRouter);
  app.use('/analytics', analyticsRouter);

  return app;
}
