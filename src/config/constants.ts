import path from 'path';
import { fileURLToPath } from 'url';

export const BASE_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');
export const PORT = process.env.PORT || 3000;

export const TODAY = new Date();
export const YYYY_MM_DD = TODAY.toISOString().split('T')[0].replace(/-/g, '_');
export const SPORT = process.env.SPORT || 'football';
