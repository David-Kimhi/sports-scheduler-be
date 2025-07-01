import axios from "axios";

export const TODAY = new Date();
export const YYYY_MM_DD = TODAY.toISOString().split('T')[0].replace(/-/g, '_');

export function delaySeconds(sec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

export  async function downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
}


  
  