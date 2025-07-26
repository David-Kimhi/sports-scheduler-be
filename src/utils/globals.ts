
import axios from "axios";
import { FREE_RPM, IS_FREE_PLAN, IS_PRO_PLAN, PRO_RPM } from "../config/index.js";



export function delayForLimit(rpm: number = FREE_RPM): Promise<void> {
    if (IS_FREE_PLAN) {
      rpm = FREE_RPM;
    }
    if (IS_PRO_PLAN) {
      rpm = PRO_RPM
    }

    const sec = 60/rpm;
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
  
  
  