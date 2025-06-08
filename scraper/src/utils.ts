import dotenv from 'dotenv';
import axios from 'axios';
import dayjs from 'dayjs';


dotenv.config();


export const START_DAY = (process.env.LIVE === "FALSE") ? '2020-01-01' : dayjs().format('YYYY-MM-DD');
export const END_DAY = dayjs(START_DAY).add(1, 'year').format('YYYY-MM-DD');


export function delaySeconds(sec: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

const API_KEYS: Record<string, string> = {
  football: process.env.APIFOOTBALL_API_KEY!
};

function getAPIHostKey(sport: string): [string, string] {
    const host = `v3.${sport.toLowerCase()}.api-sports.io`;
    const key = API_KEYS[sport.toLowerCase()];
    if (!key) {
        throw new Error(`No API key defined for sport: ${sport}`);
    }
    return [host, key]
}


async function downloadImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

export { getAPIHostKey, downloadImage };

