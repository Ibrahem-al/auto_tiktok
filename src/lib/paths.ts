// Server-only path constants (uses Node.js 'path' module)
import path from 'path';

export const STORAGE_DIR = path.join(process.cwd(), 'storage');
export const BACKGROUNDS_DIR = path.join(STORAGE_DIR, 'backgrounds');
export const OUTPUT_DIR = path.join(STORAGE_DIR, 'output');
export const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');
