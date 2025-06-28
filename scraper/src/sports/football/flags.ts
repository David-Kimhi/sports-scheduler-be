import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Dynamically get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build absolute path to flags file
const FLAG_FILE = path.join(__dirname, 'flags', 'flags.json');

export function loadFlags(): Record<string, boolean> {
  if (!existsSync(FLAG_FILE)) return {};
  const raw = readFileSync(FLAG_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function saveFlags(flags: Record<string, boolean>) {
    writeFileSync(FLAG_FILE, JSON.stringify(flags, null, 2));
}

export function setFlag(flagName: string, value: boolean) {
    const flags = loadFlags();
    flags[flagName] = value;
    saveFlags(flags);
}

export function getFlag(flagName: string): boolean | undefined {
    const flags = loadFlags();
    return flags[flagName];
}

export function resetFlags() {
    const flags = loadFlags();
    const allTrue = Object.values(flags).every(v => v === true);

    if (allTrue) {
        Object.keys(flags).forEach(key => flags[key] = false);
        saveFlags(flags);
    }
}

export async function runOnce<T extends any[]>(
  flagName: string,
  fn: (...args: T) => Promise<void>,
  ...args: T
) {
  let flag = getFlag(flagName);

  if (flag === undefined) {
    setFlag(flagName, false);
    flag = false;
  }

  if (!flag) {
    await fn(...args);
    setFlag(flagName, true);
  }
}

  
  