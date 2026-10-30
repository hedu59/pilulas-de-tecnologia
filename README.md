# Pílulas de Tecnologia — Astro + GitHub Pages

Blog de engenharia de software, .NET e AI Engineering desenvolvido em **Astro**, com o mascote Byte e as sete pílulas iniciais preservadas.

**Site:** https://hedu59.github.io/pilulas-de-tecnologia/

## Publicação sem API da OpenAI

A publicação é **sob demanda**:

1. O conteúdo e a ilustração da próxima pílula são preparados no ChatGPT, quando solicitados pelo autor.
2. Os novos dados são adicionados a `src/data/articles.json` e as ilustrações a `public/assets/`, via integração com o GitHub.
3. Um commit na branch `main` aciona automaticamente `.github/workflows/deploy.yml`.
4. O GitHub Actions valida os sete artigos iniciais e os futuros, compila o Astro e publica o GitHub Pages.

**Não há geração automática diária no GitHub. Não é necessário cadastrar `OPENAI_API_KEY`.** A rotina "Engineering Mastery diário" das 22h, quando ativa no ChatGPT, entrega o estudo no próprio ChatGPT; a publicação no blog requer um pedido separado.

O workflow também oferece execução manual (GitHub Actions → Publicar Pílulas de Tecnologia → Run workflow) para reconstruir o site sem gerar novos artigos.

## Arquivos principais

- `src/data/articles.json`: lista de pílulas, com título, corpo e metadados.
- `src/pages/index.astro`: homepage, cards, filtros e busca.
- `src/pages/pilulas/[slug].astro`: páginas de leitura.
- `src/layouts/SiteLayout.astro`: estrutura e metadados comuns.
- `public/assets/`: estilos, imagens e arquivos do Byte.
- `.github/workflows/deploy.yml`: validação, build e publicação GitHub Pages.
- `scripts/validate-content.mjs`: checagens de artigos e assets.

Os arquivos `scripts/generate-daily.mjs` e `scripts/generate-daily.test.mjs` são protótipos **desativados**, não executados pelo workflow. Não realizam chamadas à API enquanto estiverem inativos.

## Desenvolvimento local

Requer Node.js compatível com Astro 6.

```bash
npm install
npm run validate
npm run dev
npm run build
```

## Novo artigo

Adicione um objeto em `src/data/articles.json`, seguindo o esquema existente, e sua capa em `public/assets/`. O workflow fará o deploy quando o commit chegar à branch `main`.

**Cuidados editoriais:** revise exemplos técnicos, links e dados; não publique informações corporativas confidenciais.

## Política editorial e LinkedIn

Consulte [EDITORIAL.md](EDITORIAL.md). O plano de conteúdo combina **uma pílula de IA e outra de engenharia por dia**; as duas são entregues no ChatGPT e só são enviadas ao blog mediante solicitação do autor.

O feed RSS público é `https://hedu59.github.io/pilulas-de-tecnologia/rss.xml`. Para compartilhar automaticamente cada novo artigo no perfil pessoal, conecte **RSS by Zapier → New Item in Feed** com **LinkedIn → Create Share Update**, usando o GUID/URL para identificar novidades, e mapeie título, resumo, imagem e link. Não é preciso uma chave da API da OpenAI para isso.
