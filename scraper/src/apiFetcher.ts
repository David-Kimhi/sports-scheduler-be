import axios from 'axios';
import { getAPIHostKey } from './utils.js';
import { MODULE } from './config.js';
import { createLogger } from '../../logger.js';

// create a logger for writing actions
const logger = createLogger(`${MODULE}-apiFetcher`);

export async function fetchSportData(
  sport: string,
  endpoint: string,
  params?: Record<string | number, string | number>
) {
  const [host, key] = getAPIHostKey(sport);

  const url = `https://${host}/${endpoint}`;
  const config = {
    method: 'get' as const,
    url: url,
    headers: {
      'x-rapidapi-key': key,
      'x-rapidapi-host': host
    },
    params: params 
  };

  try {
    const response = await axios(config);
  
    if (response.data.errors.length > 0) {
      logger.error(`API error(s) fetching ${endpoint}:`, response.data.errors);
      throw new Error(`API returned errors for ${endpoint}`);
    }

    logger.info(`Fetched ${response.data.response.length} records`)
  
    return response.data.response;
  
  } catch (err: any) {
    logger.error(`Request error fetching ${endpoint}:`, err.response?.data || err.message);
    throw err;
  }
}

  
  