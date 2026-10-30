# Pílulas de Tecnologia — Astro + GitHub Pages

Site estático educacional em **Astro**, reproduzindo o visual do antigo ChatGPT Sites e preservando as 7 pílulas originais e as artes do Byte.

## Rodar localmente

Pré-requisito: Node.js compatível com Astro 6 (consulte a documentação do Astro).

```bash
npm install
npm run dev
npm run build
```

## Publicar no GitHub Pages

1. Na conta GitHub `hedu59`, crie um repositório **público** chamado `pilulas-de-tecnologia` (vazio).
2. Envie os arquivos da raiz deste projeto ao repositório, na branch `main`.
3. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
4. O workflow `.github/workflows/deploy.yml` instalará o Astro com npm, validará os artigos, construirá e publicará o site ao receber novos commits na `main`.
5. Após o primeiro deploy bem-sucedido, o endereço será `https://hedu59.github.io/pilulas-de-tecnologia/`.

O arquivo `astro.config.mjs` deriva proprietário e repositório de `GITHUB_REPOSITORY`, permitindo outros nomes sem mexer manualmente no `base`.

## Organização

- `src/pages/index.astro`: biblioteca, filtros e busca.
- `src/pages/pilulas/[slug].astro`: páginas de cada pílula.
- `src/layouts/SiteLayout.astro`: layout e SEO compartilhados.
- `src/data/articles.json`: metadados e conteúdo das 7 pílulas; novos artigos podem ser adicionados aqui.
- `public/assets/`: artes originais, CSS, JavaScript e favicon do Byte.
- `.github/workflows/deploy.yml`: deploy contínuo GitHub Pages.

## Geração + publicação automática às 22h

O mesmo workflow `.github/workflows/deploy.yml` agora contempla **geração com IA, validação de conteúdo, versionamento no Git e deploy Astro no GitHub Pages**. Programado para `01:00 UTC`, que corresponde a **22h em Fortaleza (UTC−3)**. O GitHub Actions pode iniciar com atraso em horários de pico; não há garantia de segundo exato. Veja as execuções em [GitHub Actions](https://github.com/hedu59/pilulas-de-tecnologia/actions).

### Única configuração manual obrigatória

1. Crie uma chave de projeto na [plataforma OpenAI](https://platform.openai.com/api-keys) (pode exigir crédito/faturamento ativo). **ChatGPT Plus não inclui créditos da API.**
2. Em [Settings → Secrets and variables → Actions](https://github.com/hedu59/pilulas-de-tecnologia/settings/secrets/actions), crie um **Repository secret** com o nome exato `OPENAI_API_KEY` e cole a chave como valor. **Nunca** envie a chave pelo chat, commit ou arquivo de configuração.
3. Confira [Actions → Gerar e publicar Pílulas de Tecnologia](https://github.com/hedu59/pilulas-de-tecnologia/actions/workflows/deploy.yml). Em **Run workflow**, marque `Gerar e publicar uma nova pílula agora?` para gerar uma edição imediatamente (pode consumir créditos). Com a opção desmarcada, apenas reconstrói o site.

### Funcionamento

- `scripts/generate-daily.mjs`: escolhe a próxima pauta editorial (a #008 é SPEC → PLAN), chama a OpenAI Responses API (`gpt-5.4-mini`), valida e cria HTML escapado com exemplos de código, checklist e pergunta de entrevista.
- Gera uma nova ilustração do Byte com a API de edição de imagens (`gpt-image-1-mini`), usando o desenho original como referência; se a API de imagem estiver indisponível, a pílula usa uma capa do Byte já existente e **a geração do artigo não é descartada**.
- Adiciona o artigo ao início de `src/data/articles.json` e a imagem a `public/assets/`, registra um commit com `github-actions[bot]` e publica **dentro do mesmo workflow**. `GITHUB_TOKEN` não aciona outro workflow automaticamente por meio do push, por isso gerar e publicar é uma operação única.
- Se o artigo não passar nas validações, falha sem publicar. Se já houver edição gerada para a data local, não duplica o conteúdo. Os artigos anteriores permanecem intactos.
- O fluxo `push` continua publicando normalmente quando os arquivos são atualizados manualmente.

O código não acessa informações internas ou ferramentas corporativas. O modelo recebe apenas pautas editoriais e títulos anteriores. Modelos e custo podem ser ajustados via `OPENAI_TEXT_MODEL` / `OPENAI_IMAGE_MODEL` no workflow. O custo varia conforme tokens e ilustrações produzidas. **Conteúdo gerado por IA pode conter imprecisões; recomenda-se revisão editorial periódica.**

### Adicionar uma pílula manualmente

Acrescente um objeto no início de `src/data/articles.json` com `num`, `slug`, `title`, `category`, `date`, `reading`, `level`, `cover`, `keywords`, `excerpt` e `html`; copie a capa para `public/assets/`. Caminhos relativos no HTML devem usar o marcador `__ROOT__`, substituído automaticamente pelo prefixo do GitHub Pages.

## Cuidados

A automação monta HTML a partir de campos estruturados com *escaping* de conteúdo, sem permitir injeção direta do HTML gerado pelo modelo. Conteúdos legados de `articles.json` continuam de autoria controlada. **Nunca adicione HTML recebido de usuários não confiáveis sem sanitização.** A execução só é automática depois que o secret `OPENAI_API_KEY` for configurado e os créditos da API estiverem habilitados.