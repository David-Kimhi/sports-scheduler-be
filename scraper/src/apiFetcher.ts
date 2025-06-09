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
  
    // check if the API returned an error
    const errors = response?.data?.errors || {};

    if (Object.keys(errors).length > 0) {
      if (errors.requests?.includes("request limit")) {
        logger.error("❌ API limit reached. Exiting...");
        process.exit(1); // immediately terminate the app
      }

      // otherwise throw 
      throw new Error(`(API error) ${JSON.stringify(errors)}`);
    }
  

    logger.info(`Fetched ${response.data.response.length} records`)
  
    return response.data.response;
  
  } catch (err: any) {
    logger.error(`Error fetching ${endpoint}: ${err.response?.data || err.message}`);
    throw err;
  }
}

  
  