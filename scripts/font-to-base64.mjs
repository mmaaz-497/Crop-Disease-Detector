/**
 * One-time script: converts NotoNaskhArabic-Regular.ttf → Base64 text file
 * used by lib/pdf.ts for Urdu PDF generation.
 *
 * Usage:
 *   1. Place NotoNaskhArabic-Regular.ttf in the project root
 *      (download from https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic)
 *   2. Run: node scripts/font-to-base64.mjs
 *   3. Commit the generated public/fonts/NotoNaskhArabic.b64.txt
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const inputPath = resolve(root, 'NotoNaskhArabic-Regular.ttf');
const outputDir = resolve(root, 'public', 'fonts');
const outputPath = resolve(outputDir, 'NotoNaskhArabic.b64.txt');

try {
  const ttfBuffer = readFileSync(inputPath);
  const base64 = ttfBuffer.toString('base64');
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, base64, 'utf8');
  console.log(`✅ Font encoded → ${outputPath} (${(base64.length / 1024).toFixed(0)} KB)`);
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error('❌ Font file not found at:', inputPath);
    console.error('   Download it from: https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic');
  } else {
    throw err;
  }
}
