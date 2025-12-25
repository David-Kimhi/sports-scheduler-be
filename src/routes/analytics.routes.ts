import express from 'express';
import searchEventRouter from './searchEvent.routes.js';

const router = express.Router();

router.use('/searchEvent', searchEventRouter);

export default router;
