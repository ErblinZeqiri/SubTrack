import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';

const raw = readFileSync('./src/assets/abopti-icon.svg', 'utf8');
// Supprime le bloc <style> (Google Fonts ne fonctionne pas dans resvg)
const svg = raw.replace(/<style>[\s\S]*?<\/style>/g, '');

const sizes = [
  { folder: 'mipmap-mdpi',    size: 48  },
  { folder: 'mipmap-hdpi',    size: 72  },
  { folder: 'mipmap-xhdpi',   size: 96  },
  { folder: 'mipmap-xxhdpi',  size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

for (const { folder, size } of sizes) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const png = resvg.render().asPng();
  const base = `android/app/src/main/res/${folder}`;
  writeFileSync(`${base}/ic_launcher.png`, png);
  writeFileSync(`${base}/ic_launcher_round.png`, png);
  console.log(`✓ ${folder} (${size}px)`);
}
