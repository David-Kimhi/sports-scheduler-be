
import axios from "axios";



export function delaySeconds(sec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

export  async function downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
}


export function buildFilter(fieldPaths: string, obj: any): object {
    const filter: Record<string, any> = {};
  
    for (const path of fieldPaths.split(',')) {
      const trimmedPath = path.trim();
      const parts = trimmedPath.split('.');
      let value = obj;
  
      for (const part of parts) {
        if (value && part in value) {
          value = value[part];
        } else {
          throw new Error(`Field "${trimmedPath}" not found in document.`);
        }
      }
  
      filter[trimmedPath] = value;
    }
  
    return filter;
  }
  
  
  