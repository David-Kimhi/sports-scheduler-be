import axios from "axios";

export function delaySeconds(sec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

export  async function downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
}
  
  