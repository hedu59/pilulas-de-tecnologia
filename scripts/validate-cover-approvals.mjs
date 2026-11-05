import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = new URL('../', import.meta.url);
const articles = JSON.parse(readFileSync(new URL('../src/data/articles.json', import.meta.url), 'utf8'));
const snapshot = JSON.parse(readFileSync(new URL('../.github/legacy-cover-snapshot.json', import.meta.url), 'utf8')).articles;

const REPO = 'hedu59/pilulas-de-tecnologia';
const ISSUE = 1;
const OWNER = 'hedu59';
const approvalPattern = /^APROVO CAPA #(\d{3}) ARQUIVO=([A-Za-z0-9._-]+) BLOB=([0-9a-f]{40})$/;
const revokePattern = /^REVOGO CAPA #(\d{3}) ARQUIVO=([A-Za-z0-9._-]+) BLOB=([0-9a-f]{40})$/;

function gitBlobSha(bytes) {
  return createHash('sha1').update(Buffer.from('blob ' + bytes.length + '\0')).update(bytes).digest('hex');
}

async function loadAuthorApprovals() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN ausente. Sem token não é possível confirmar aprovação do autor. Deploy bloqueado.');
  const approvals = new Map();
  for (let page = 1; page <= 30; page++) {
    const response = await fetch('https://api.github.com/repos/' + REPO + '/issues/' + ISSUE + '/comments?per_page=100&page=' + page, {
      headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + token, 'X-GitHub-Api-Version': '2022-11-28' }
    });
    if (!response.ok) throw new Error('Não foi possível verificar aprovações no GitHub (HTTP ' + response.status + '). Deploy bloqueado.');
    const comments = await response.json();
    if (!Array.isArray(comments)) throw new Error('Resposta inválida da API de aprovações. Deploy bloqueado.');
    for (const comment of comments) {
      if (comment.user?.login !== OWNER || comment.user?.type !== 'User') continue;
      const line = String(comment.body ?? '').trim();
      const approved = approvalPattern.exec(line);
      const revoked = revokePattern.exec(line);
      if (!approved && !revoked) continue;
      const [, num, file, hash] = approved || revoked;
      const key = [num, file, hash].join('|');
      if (approved) approvals.set(key, true);
      else approvals.delete(key);
    }
    if (comments.length < 100) return approvals;
  }
  throw new Error('Limite de comentários de aprovação excedido. Revisão manual necessária.');
}

const errors = [];
const needsApproval = [];
for (const article of articles) {
  const id = String(article.num);
  const file = String(article.cover || '');
  if (!/^\d{3}$/.test(id) || !/^[A-Za-z0-9][A-Za-z0-9._-]*\.(webp|png|jpe?g)$/.test(file) || file.includes('..')) {
    errors.push('Pílula #' + id + ': nome/número de capa inválido.');
    continue;
  }
  const path = resolve(new URL('../public/assets/', import.meta.url).pathname, file);
  if (!existsSync(path)) { errors.push('Pílula #' + id + ': capa não encontrada (' + file + ').'); continue; }
  const bytes = readFileSync(path);
  if (bytes.length < 1024) { errors.push('Pílula #' + id + ': arquivo de capa vazio ou pequeno demais.'); continue; }
  const blob = gitBlobSha(bytes);
  const legacy = snapshot[article.slug];
  if (legacy && legacy.num === id && legacy.file === file && legacy.blob === blob) continue;
  if (!String(article.html || '').includes('assets/' + file)) {
    errors.push('Pílula #' + id + ': a capa indicada não aparece no corpo do artigo.');
    continue;
  }
  needsApproval.push({ id, file, blob, slug: article.slug });
}

if (needsApproval.length) {
  try {
    const approvals = await loadAuthorApprovals();
    for (const pending of needsApproval) {
      const key = [pending.id, pending.file, pending.blob].join('|');
      if (!approvals.get(key)) {
        errors.push('BLOQUEADO — Pílula #' + pending.id + ' sem aprovação de arte pelo titular. ' +
          'Na issue https://github.com/' + REPO + '/issues/' + ISSUE + ' a conta ' + OWNER +
          ' precisa comentar exatamente: APROVO CAPA #' + pending.id +
          ' ARQUIVO=' + pending.file + ' BLOB=' + pending.blob);
      }
    }
  } catch (error) { errors.push(error.message); }
}

if (errors.length) {
  console.error('\nGUARDRAIL DE ARTES: publicação interrompida.\n' + errors.join('\n') + '\n');
  process.exit(1);
}
console.log('GUARDRAIL DE ARTES: ' + articles.length + ' pílulas verificadas, ' + needsApproval.length + ' arte(s) com aprovação explícita do autor.');
