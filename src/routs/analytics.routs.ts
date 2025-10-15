import express from 'express';
import analyticsRouter from './searchEvent.routs.js';

const router = express.Router();

router.use('/searchEvent', analyticsRouter);


export default router;
