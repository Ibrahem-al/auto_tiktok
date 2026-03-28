import fs from 'fs';
import path from 'path';
import { BACKGROUNDS_DIR } from '../paths';

export async function downloadPexelsVideo(
  url: string,
  videoId: string
): Promise<string> {
  const outputPath = path.join(BACKGROUNDS_DIR, `${videoId}.mp4`);

  // Return cached version if it exists
  if (fs.existsSync(outputPath)) {
    return outputPath;
  }

  // Ensure directory exists
  fs.mkdirSync(BACKGROUNDS_DIR, { recursive: true });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download video: ${res.status} ${res.statusText}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);

  return outputPath;
}
