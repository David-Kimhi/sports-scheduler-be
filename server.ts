import type { Request, Response } from 'express';
import "dotenv/config";

import { createApp } from './src/app.js';
import { API_MODULE, LOCAL_PORT_BACKEND, SPORT } from './src/config/index.js';
import { initializeModels } from './src/models/initializer.js';

async function startServer() {
  await initializeModels(SPORT, API_MODULE);

  const app = createApp();

  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.listen(LOCAL_PORT_BACKEND, () => {
    console.log(`🚀 Server running on port ${LOCAL_PORT_BACKEND}. Ready`);
  });
}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
