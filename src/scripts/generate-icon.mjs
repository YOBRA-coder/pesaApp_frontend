// scripts/generate-icons.mjs
// Run: node scripts/generate-icons.mjs
// Requires: npm install -D sharp

import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'icons');

await mkdir(OUT, { recursive: true });

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// PesaApp SVG icon — green gradient "P"
const svgIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00e57a"/>
      <stop offset="100%" stop-color="#00c46a"/>
    </linearGradient>
    <linearGradient id="text" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="100%" stop-color="#003320"/>
    </linearGradient>
  </defs>
  <!-- Background rounded rect -->
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="url(#bg)"/>
  <!-- P letter -->
  <text
    x="${size * 0.5}"
    y="${size * 0.72}"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="${size * 0.62}"
    fill="url(#text)"
    text-anchor="middle"
  >P</text>
</svg>`;

// Maskable icon (full bleed — icon fills entire square)
const svgMaskable = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#00e57a"/>
      <stop offset="100%" stop-color="#009950"/>
    </linearGradient>
  </defs>
  <!-- Full bleed background for maskable -->
  <rect width="${size}" height="${size}" fill="url(#bg2)"/>
  <text
    x="${size * 0.5}"
    y="${size * 0.7}"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="${size * 0.55}"
    fill="#000"
    text-anchor="middle"
  >P</text>
</svg>`;

console.log('🎨 Generating PesaApp PWA icons...\n');

for (const size of SIZES) {
  const isMaskable = size === 512;
  const svg = isMaskable ? svgMaskable(size) : svgIcon(size);

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(OUT, `icon-${size}.png`));

  console.log(`  ✅ icon-${size}.png${isMaskable ? ' (maskable)' : ''}`);
}

// Also create favicon.ico (16x16 and 32x32 combined)
const faviconSvg = svgIcon(32);
await sharp(Buffer.from(faviconSvg)).resize(32).png().toFile(path.join(OUT, '..', 'favicon-32.png'));
await sharp(Buffer.from(svgIcon(16))).resize(16).png().toFile(path.join(OUT, '..', 'favicon-16.png'));

// Placeholder screenshots (gray)
const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
await mkdir(screenshotsDir, { recursive: true });

const screenshotSvg = `
<svg width="390" height="844" xmlns="http://www.w3.org/2000/svg">
  <rect width="390" height="844" fill="#080c14"/>
  <text x="195" y="422" font-family="Arial" font-size="24" fill="#00e57a" text-anchor="middle">PesaApp</text>
</svg>`;

for (const name of ['dashboard', 'aviator', 'sports', 'invest']) {
  await sharp(Buffer.from(screenshotSvg)).png().toFile(path.join(screenshotsDir, `${name}.png`));
  console.log(`  ✅ screenshots/${name}.png`);
}

console.log('\n🎉 All icons generated!\n');
console.log('Next steps:');
console.log('  1. npm install vite-plugin-pwa');
console.log('  2. Update vite.config.ts (already done)');
console.log('  3. npm run build');
console.log('  4. Deploy dist/ folder → PWA ready!\n');