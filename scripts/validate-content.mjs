import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const articles = JSON.parse(readFileSync(new URL('../src/data/articles.json', import.meta.url),'utf8'));
const slugs = new Set(); const numbers = new Set(); const errors=[];
for (const art of articles) {
  for (const k of ['num','slug','title','category','cover','excerpt','html']) if (!art[k]) errors.push(`${art.num}: ${k} vazio`);
  if (numbers.has(art.num)) errors.push(`${art.num}: número duplicado`); numbers.add(art.num);
  if (slugs.has(art.slug)) errors.push(`${art.slug}: slug duplicado`); slugs.add(art.slug);
  if (!existsSync(resolve('public/assets', art.cover))) errors.push(`${art.num}: capa inexistente: ${art.cover}`);
  if (!art.html.includes('h1')) errors.push(`${art.num}: título H1 ausente`);
  if (art.html.includes('src="../assets/')) errors.push(`${art.num}: imagem usa caminho relativo inválido`);
}
if (errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`OK: ${articles.length} pílulas, capas e rotas únicas validadas.`);