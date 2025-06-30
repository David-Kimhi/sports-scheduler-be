import path from 'path';
import { fileURLToPath } from 'url';

export const BASE_PATH = path.dirname(fileURLToPath(import.meta.url));
export const PORT = process.env.PORT || 3000;

