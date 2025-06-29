import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

export class FlagsManager {
  private flagFile: string;
  
  constructor(cwd: string) {
    this.flagFile = path.join(cwd, 'data', 'flags.json');;
  }

  private load(): Record<string, boolean> {
    if (!existsSync(this.flagFile)) return {};
    const raw = readFileSync(this.flagFile, 'utf-8');
    return JSON.parse(raw);
  }

  private save(flags: Record<string, boolean>) {
    writeFileSync(this.flagFile, JSON.stringify(flags, null, 2));
  }

  get(flagName: string): boolean | undefined {
    return this.load()[flagName];
  }

  set(flagName: string, value: boolean) {
    const flags = this.load();
    flags[flagName] = value;
    this.save(flags);
  }

  resetIfAllTrue() {
    const flags = this.load();
    if (Object.values(flags).every(v => v === true)) {
      Object.keys(flags).forEach(k => flags[k] = false);
      this.save(flags);
    }
  }

  async runOnce<T extends any[]>(
    flagName: string,
    fn: (...args: T) => Promise<void>,
    ...args: T
  ) {
    let flag = this.get(flagName);
    if (flag === undefined) {
      this.set(flagName, false);
      flag = false;
    }

    if (!flag) {
      await fn(...args);
      this.set(flagName, true);
    }
  }
}
