import express from 'express';
import { createSearchEvent } from '../controllers/searchEvent.controller.js';

const router = express.Router();

router.post('/', createSearchEvent);

export default router;
