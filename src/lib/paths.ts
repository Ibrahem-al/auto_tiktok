// Server-only path constants (uses Node.js 'path' module)
import path from 'path';
import fs from 'fs';

function resolveStorageDir(): string {
  // Try process.cwd()/storage first (local dev + Render Docker)
  const cwdStorage = path.join(process.cwd(), 'storage');
  try {
    fs.mkdirSync(cwdStorage, { recursive: true });
    return cwdStorage;
  } catch {
    // Fallback to /tmp (serverless environments)
    const tmpStorage = path.join('/tmp', 'lyricvision-storage');
    fs.mkdirSync(tmpStorage, { recursive: true });
    return tmpStorage;
  }
}

export const STORAGE_DIR = resolveStorageDir();
export const BACKGROUNDS_DIR = path.join(STORAGE_DIR, 'backgrounds');
export const OUTPUT_DIR = path.join(STORAGE_DIR, 'output');
export const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');
