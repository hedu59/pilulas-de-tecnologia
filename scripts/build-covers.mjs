import { readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import sharp from 'sharp';

const directory = fileURLToPath(new URL('../public/assets/', import.meta.url));
const candidates = (await readdir(directory)).filter(name => name.endsWith('.svg'));
for (const name of candidates) {
  const input = join(directory, name);
  const output = join(directory, name.replace(/\.svg$/i, '.webp'));
  const sourceInfo = await stat(input);
  const targetInfo = await stat(output).catch(() => null);
  if (targetInfo && targetInfo.mtimeMs >= sourceInfo.mtimeMs) continue;
  await sharp(input, { density: 96 })
    .webp({ quality: 84, effort: 6 })
    .toFile(output);
  console.log('Capa gerada:', name, '→', output.split('/').at(-1));
}
