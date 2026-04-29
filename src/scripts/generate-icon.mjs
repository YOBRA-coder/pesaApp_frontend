import sharp from 'sharp';
import { mkdir } from 'fs/promises';

const sizes = [72,96,128,144,152,192,384,512];
await mkdir('public/icons', { recursive: true });

for (const size of sizes) {
  // Create a simple green "P" icon
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size*0.2}" fill="#080c14"/>
      <rect width="${size}" height="${size}" rx="${size*0.2}" fill="url(#g)"/>
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#00e57a"/>
        <stop offset="100%" stop-color="#00c46a"/>
      </linearGradient></defs>
      <text x="50%" y="65%" font-family="Arial" font-weight="900" font-size="${size*0.65}" fill="black" text-anchor="middle">P</text>
    </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(`public/icons/icon-${size}.png`);
  console.log(`✅ icon-${size}.png`);
}