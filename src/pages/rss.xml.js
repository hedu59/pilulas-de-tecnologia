import articles from '../data/articles.json';
import { statSync } from 'node:fs';
import { join } from 'node:path';

const months = {jan:0,fev:1,mar:2,abr:3,mai:4,jun:5,jul:6,ago:7,set:8,out:9,nov:10,dez:11};
const escapeXml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[char]));

export function publicationDate(article) {
  if (article.publishedOn) {
    const parsed = new Date(String(article.publishedOn).slice(0,10) + 'T12:00:00Z');
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const match = /^(\d{1,2})\s+([a-zç]{3})\.?\s+(\d{4})/i.exec(String(article.date || '').trim());
  if (!match || months[match[2].toLowerCase()] === undefined) {
    throw new Error('Data de publicação inválida na pílula #' + article.num);
  }
  const date = new Date(Date.UTC(Number(match[3]), months[match[2].toLowerCase()], Number(match[1]), 12));
  if (Number.isNaN(date.getTime())) throw new Error('Data inválida na pílula #' + article.num);
  return date;
}

export function GET({ site }) {
  const root = new URL(import.meta.env.BASE_URL, site || 'https://hedu59.github.io/');
  const feedURL = new URL('rss.xml', root).href;
  const items = [...articles].sort((a,b) => publicationDate(b) - publicationDate(a) || Number(b.num)-Number(a));
  const lastPublication = items.length ? publicationDate(items[0]).toUTCString() : new Date(0).toUTCString();

  const rssItems = items.map(article => {
    if (!/^[a-z0-9-]+$/.test(article.slug)) throw new Error('Slug inseguro: ' + article.slug);
    if (!/^[a-z0-9_-]+\.webp$/.test(article.cover)) throw new Error('Arquivo de capa inválido: ' + article.cover);
    const link = new URL('pilulas/' + article.slug + '/', root).href;
    const cover = new URL('assets/' + article.cover, root).href;
    const bytes = statSync(join(process.cwd(), 'public', 'assets', article.cover)).size;
    return [
      '    <item>',
      '      <title>' + escapeXml('Pílula #' + article.num + ': ' + article.title) + '</title>',
      '      <link>' + escapeXml(link) + '</link>',
      '      <guid isPermaLink="true">' + escapeXml(link) + '</guid>',
      '      <description>' + escapeXml(article.excerpt) + '</description>',
      '      <category>' + escapeXml(article.category) + '</category>',
      '      <pubDate>' + publicationDate(article).toUTCString() + '</pubDate>',
      '      <media:content url="' + escapeXml(cover) + '" type="image/webp" medium="image" />',
      '      <enclosure url="' + escapeXml(cover) + '" length="' + bytes + '" type="image/webp" />',
      '    </item>'
    ].join('\n');
  }).join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">',
    '  <channel>',
    '    <title>Pílulas de Tecnologia</title>',
    '    <link>' + escapeXml(root.href) + '</link>',
    '    <description>Uma pílula por dia, alternando IA e engenharia de software: .NET, arquitetura e Byte.</description>',
    '    <language>pt-BR</language>',
    '    <lastBuildDate>' + lastPublication + '</lastBuildDate>',
    '    <atom:link href="' + escapeXml(feedURL) + '" rel="self" type="application/rss+xml" />',
    rssItems,
    '  </channel>',
    '</rss>'
  ].join('\n');
  return new Response(xml, {
    headers: {'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control':'public, max-age=300'}
  });
}
