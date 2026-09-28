import type { Request, Response } from 'express';
import { Country } from '../models/Country.js';
import { sendOk } from '../utils/response.js';

export async function getCountries(req: Request, res: Response): Promise<void> {
  const results = await Country.fetchAll();
  sendOk(res, results);
}
