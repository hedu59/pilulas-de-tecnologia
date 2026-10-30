/**
 * Geração segura de uma pílula por execução, diretamente no formato da biblioteca Astro.
 * Exige OPENAI_API_KEY; nunca grava credenciais no repositório.
 * A geração é idempotente por data local (America/Fortaleza).
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ARTICLES_PATH = resolve(ROOT, 'src/data/articles.json');
const ASSETS_PATH = resolve(ROOT, 'public/assets');
const TIMEZONE = 'America/Fortaleza';
const MODEL = process.env.OPENAI_TEXT_MODEL || 'gpt-5.4-mini';
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1-mini';

// Sequência editorial para manter a continuidade de Spec-Driven Development.
// Após esse roteiro, novos assuntos são escolhidos pelos eixos abaixo.
const EDITORIAL_PLAN = {
  8: ['Do SPEC ao PLAN: transformando requisitos em arquitetura com IA', 'AI Engineering', 'Spec Kit, /speckit.plan, decisões de arquitetura, trade-offs e ASP.NET Core'],
  9: ['Do PLAN ao TASKS: decompondo uma implementação para agentes de IA', 'AI Engineering', 'Spec Kit, /speckit.tasks, dependências, paralelismo e critérios de pronto'],
  10: ['IMPLEMENT: executando tarefas com agentes sem perder qualidade', 'AI Engineering', 'Spec Kit, code review, diffs, testes e rastreabilidade de requisitos'],
  11: ['VALIDATE: testando o software produzido com IA', 'AI Engineering', 'testes de contrato, testes de integração, segurança e validação por cenários'],
  12: ['Agentes e subagentes: divisão de responsabilidades em projetos reais', 'AI Engineering', 'agentes, orquestração, limites, ferramentas e responsabilidade humana'],
  13: ['Idempotência em APIs ASP.NET Core: do conceito à implementação', '.NET & C#', 'idempotency keys, concorrência, SQL Server e pagamentos'],
  14: ['Guardrails para IA: segurança além do prompt', 'AI Engineering', 'prompt injection, autorização, mínimos privilégios e proteção de dados'],
  15: ['MCP na engenharia corporativa: ferramentas com fronteiras de confiança', 'AI Engineering', 'MCP, ferramentas, scopes, allowlists e auditoria'],
  16: ['Outbox Pattern: consistência entre banco de dados e mensageria', '.NET & C#', 'EF Core, RabbitMQ, persistência transacional e retries'],
  17: ['Context Engineering avançado: memória, recuperação e limites', 'AI Engineering', 'RAG, memória, resumo, versionamento de contexto e relevância'],
  18: ['Skills e instruções para agentes de código', 'AI Engineering', 'skills, agentes especializados, versionamento e segurança'],
  19: ['Observabilidade de agentes: traces, métricas e avaliação', 'AI Engineering', 'logs estruturados, tracing, custo, testes e qualidade'],
  20: ['Concorrência otimista no EF Core com RowVersion', '.NET & C#', 'SQL Server, RowVersion, DbUpdateConcurrencyException e retentativas'],
};

const LATER_TOPICS = [
  ['Avaliação de agentes em produção: datasets e testes de regressão', 'AI Engineering', 'evals, datasets, rastreabilidade, scorecards'],
  ['Prompts, specs e constitutions: como definir hierarquia de instruções', 'AI Engineering', 'prompting, context engineering, políticas, precedência'],
  ['Rate limiting e proteção de APIs ASP.NET Core', '.NET & C#', 'rate limit, middleware, partitioning, resiliência'],
  ['RAG confiável: recuperação, citações e validação de respostas', 'AI Engineering', 'RAG, chunking, embeddings, re-ranking'],
  ['IA na revisão de código: evitar falso positivo e regressões', 'AI Engineering', 'pull requests, testes, review, qualidade'],
  ['Saga Pattern em microsserviços .NET', '.NET & C#', 'sagas, compensação, orquestração, RabbitMQ'],
  ['Execução segura de código gerado por agentes', 'AI Engineering', 'sandboxing, least privilege, CI, supply chain'],
  ['Custos e latência de agentes: escolhas arquiteturais', 'AI Engineering', 'token budget, caching, retries, observabilidade'],
  ['Evolução de schemas em sistemas distribuídos', '.NET & C#', 'API versioning, migrations, eventos'],
  ['Desenvolvimento com IA baseado em testes: do contrato ao CI', 'AI Engineering', 'contract tests, TDD, validação de specs'],
];

export const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function localDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const v = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${v.year}-${v.month}-${v.day}`;
}

export function formatDate(isoDate) {
  const [y,m,d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y,m-1,d,12));
  return new Intl.DateTimeFormat('pt-BR', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date);
}

export function selectTopic(nextNumber) {
  return EDITORIAL_PLAN[nextNumber] || LATER_TOPICS[(nextNumber - 21) % LATER_TOPICS.length];
}

export function slugify(s) {
  return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 66).replace(/-$/,'');
}

const schema = {
  type: 'object', additionalProperties: false,
  properties: {
    title: {type:'string'}, excerpt:{type:'string'}, keywords:{type:'string'},
    lead:{type:'string'}, imageScene:{type:'string'},
    sections: {type:'array', items:{type:'object',additionalProperties:false,
      properties:{heading:{type:'string'},paragraphs:{type:'array',items:{type:'string'}},bullets:{type:'array',items:{type:'string'}},codeLanguage:{type:'string'},code:{type:'string'}},
      required:['heading','paragraphs','bullets','codeLanguage','code']}},
    interviewQuestion:{type:'string'}, interviewAnswer:{type:'string'}, takeaways:{type:'array',items:{type:'string'}}
  },
  required:['title','excerpt','keywords','lead','imageScene','sections','interviewQuestion','interviewAnswer','takeaways']
};

export function validateGenerated(draft, topicTitle) {
  if (!draft || typeof draft !== 'object') throw new Error('Resposta da IA vazia.');
  for (const k of ['title','excerpt','keywords','lead','imageScene','interviewQuestion','interviewAnswer']) {
    if (typeof draft[k] !== 'string' || draft[k].trim().length < 12) throw new Error(`Campo editorial inválido: ${k}`);
  }
  if (!Array.isArray(draft.sections) || draft.sections.length < 5 || draft.sections.length > 9) throw new Error('O artigo precisa de 5 a 9 seções.');
  if (!draft.sections.some(s => s.code?.trim().length > 30)) throw new Error('O artigo precisa de exemplo de código concreto.');
  for (const s of draft.sections) {
    if (typeof s.heading !== 'string' || !Array.isArray(s.paragraphs) || s.paragraphs.length < 1 || !Array.isArray(s.bullets) || typeof s.code !== 'string') throw new Error('Estrutura de seção inválida.');
    if (s.paragraphs.some(p => typeof p !== 'string' || p.length < 90)) throw new Error('Parágrafos muito superficiais ou inválidos.');
  }
  if (!Array.isArray(draft.takeaways) || draft.takeaways.length < 3) throw new Error('Faltam conclusões práticas.');
  const text = [draft.lead,...draft.sections.flatMap(s=>[s.heading,...s.paragraphs,...s.bullets,s.code]),draft.interviewAnswer].join(' ');
  if (text.length < 5000) throw new Error('Artigo curto demais para uma pílula profunda.');
  if (/\b(TODO|lorem ipsum|a preencher|placeholder)\b/i.test(text)) throw new Error('Conteúdo incompleto detectado.');
  if (/https?:\/\//i.test(text)) throw new Error('Não publique URLs não verificadas geradas pelo modelo.');
  if (!topicTitle) throw new Error('Pauta ausente.');
}

export function renderArticle({draft,num,category,date,cover}) {
  const e = escapeHtml;
  const blocks = draft.sections.map((s,i) => [
    `<h2>${i+1}. ${e(s.heading)}</h2>`,
    ...s.paragraphs.map(p=>`<p>${e(p)}</p>`),
    s.bullets.length?`<ul>${s.bullets.map(b=>`<li>${e(b)}</li>`).join('')}</ul>`:'',
    s.code.trim()?`<pre class="wp-block-code"><code>${e(s.code.trim())}</code></pre>`:''
  ].join('\n')).join('\n');
  return `<span class="tag">Pílula #${e(num)}</span> <span class="tag coral">${e(category)}</span> <span class="tag soft">15–20 min</span>`+
    `<h1>${e(draft.title)}</h1><p class="lead">${e(draft.lead)}</p>`+
    `<div class="article-meta"><span>${e(formatDate(date))}</span><span>Por Eduardo Oliveira · Conteúdo gerado com auxílio de IA</span></div>`+
    `<figure><img src="__ROOT__assets/${e(cover)}" alt="Byte ilustra ${e(draft.title)}" loading="lazy" /><figcaption>Byte acompanha a pílula de hoje.</figcaption></figure>`+
    `${blocks}<h2>Pergunta de entrevista</h2><p><strong>${e(draft.interviewQuestion)}</strong></p><p>${e(draft.interviewAnswer)}</p>`+
    `<h2>Checklist para aplicar</h2><ul>${draft.takeaways.map(t=>`<li>${e(t)}</li>`).join('')}</ul>`+
    `<p><em>Nota editorial: conteúdo produzido com apoio de IA; execute os exemplos e confira a documentação oficial antes de aplicar em produção.</em></p>`;
}

function getOutputText(result) {
  const parts = (result.output || []).flatMap(o => o.type === 'message' ? (o.content || []) : [])
    .filter(c => c.type === 'output_text').map(c=>c.text);
  if (parts.length === 0) throw new Error('A API não retornou texto publicável.');
  return parts.join('');
}

async function apiRequest(endpoint, body, asMultipart=false) {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 180_000);
  try {
    const response = await fetch(`https://api.openai.com/v1/${endpoint}`, {
      method:'POST',signal:controller.signal,
      headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,...(asMultipart?{}:{'Content-Type':'application/json'})},
      body:asMultipart?body:JSON.stringify(body)
    });
    if (!response.ok) {
      const data = (await response.text()).slice(0,1500);
      throw new Error(`OpenAI API ${endpoint}: HTTP ${response.status} ${data.replace(/sk-[\w-]+/g,'[redacted]')}`);
    }
    return await response.json();
  } finally { clearTimeout(timeout); }
}

async function generateText(num,topic,older) {
  const [title,category,focus]=topic;
  const previous = older.slice(0,10).map(a=>`${a.num}: ${a.title}`).join('; ');
  const input = [
    {role:'system', content:`Você é um editor técnico rigoroso de um blog de engenharia de software sênior, em pt-BR. Escreva material original, preciso e instrutivo, para engenheiros .NET/Angular/AI Engineering. Aprofunde decisões, código, exceções e trade-offs. NÃO invente APIs, nomes de métodos, links, citações, métricas nem bibliotecas. Não mencione clientes, sistemas internos ou dados empresariais reais. Use somente cenários genéricos ou fictícios. Mantenha a redação humana, sem promessas exageradas. Produza cerca de 1000–1500 palavras estruturadas. Pelo menos um bloco de código real executável ou plausível, tecnicamente correto e contextualizado (.NET 8/C# ou shell; se IA Engineering, também inclua exemplo de spec, prompt ou workflow quando couber). Use 5 a 7 seções com parágrafos de 2 a 5 frases (>=90 caracteres por parágrafo), tópicos práticos, erros comuns, revisão humana e segurança. Não use HTML nem Markdown nas strings. O campo 'code' contém código cru; nenhum bloco markdown cercado por crases. Evite texto genérico ou repetitivo. imageScene deve descrever objetos/metáfora visual do tema sem pedir texto escrito na imagem.`},
    {role:'user', content:`Crie Pílula #${num}: ${title}. Trilha: ${category}. Tópicos obrigatórios: ${focus}. Artigos anteriores (não repetir): ${previous}. ${num === '008' ? 'Continuação da #007 (SPEC): explique PLAN no Spec Kit, separando o quê do como; inclua um exemplo genérico de corretora de seguros com .NET 8, Angular, SQL Server e critérios de revisão.' : 'Faça um artigo independente que conecte o assunto às lições anteriores quando fizer sentido.'} Não trate decisões arquiteturais ou de segurança como responsabilidade exclusiva da IA. Gere JSON conforme schema.`}
  ];
  const result = await apiRequest('responses', {
    model:MODEL, input, store:false, max_output_tokens:8500,
    text:{format:{type:'json_schema',name:'pilula_tecnologia',strict:true,schema}}
  });
  if(result.status === 'incomplete') throw new Error('Geração de texto incompleta (limite de saída).');
  return JSON.parse(getOutputText(result));
}

async function generateIllustration(num,scene,topicTitle) {
  const sourcePath=resolve(ASSETS_PATH,'byte_icon.webp');
  const reference=await readFile(sourcePath);
  const form = new FormData();
  form.append('model',IMAGE_MODEL);
  form.append('image[]',new Blob([reference],{type:'image/webp'}),'byte-icon.webp');
  form.append('prompt',`Use o macaquinho Byte da imagem fornecida como REFERÊNCIA DE IDENTIDADE: mesmo rosto caramelo, focinho creme, olhos expressivos, cabelo e moletom turquesa. Faça uma ilustração editorial original, horizontal 3:2, profissional, divertida, com traço vetorial suave, paleta menta/creme/coral, fundo limpo. Byte interagindo com elementos de engenharia de software para o tema "${topicTitle}". Cena detalhada: ${scene}. Não inclua nenhum texto, letras, números, logotipos, marcas d'água ou interfaces legíveis. Evite qualquer semelhança a mascotes de marcas.`);
  form.append('size','1536x1024');
  form.append('quality','medium');
  form.append('output_format','webp');
  form.append('output_compression','82');
  const result=await apiRequest('images/edits',form,true);
  const b64=result.data?.[0]?.b64_json;
  if(!b64) throw new Error('API de imagem não retornou base64.');
  const buffer=Buffer.from(b64,'base64');
  if(buffer.length<5_000 || buffer.length>6_000_000) throw new Error('Imagem retornada com tamanho inválido.');
  // Checa o header RIFF/WEBP antes de salvar.
  if(buffer.toString('ascii',0,4)!=='RIFF' || buffer.toString('ascii',8,12)!=='WEBP') throw new Error('API não retornou WebP como solicitado.');
  return buffer;
}

export async function main(argv=process.argv.slice(2)) {
  const articles=JSON.parse(await readFile(ARTICLES_PATH,'utf8'));
  const date=localDate();
  const dryRun=argv.includes('--dry-run');
  const force=argv.includes('--force');
  const nextNumber=Math.max(...articles.map(a=>Number(a.num)))+1;
  const topic=selectTopic(nextNumber);
  const num=String(nextNumber).padStart(3,'0');
  console.log(`Próxima edição: #${num} — ${topic[0]} (${date}, ${TIMEZONE})`);
  if(articles.some(a=>a.publishedOn===date) && !force) { console.log('Já existe uma edição para esta data. Nenhuma alteração.'); return; }
  if(dryRun) {console.log('Dry-run: sem API e sem alterações.'); return;}
  if(!process.env.OPENAI_API_KEY) throw new Error('Falta configurar OPENAI_API_KEY em Settings → Secrets and variables → Actions.');

  const draft=await generateText(num,topic,articles);
  validateGenerated(draft,topic[0]);
  const slug=`${num}-${slugify(topic[0])}`;
  if(articles.some(a=>a.slug===slug)) throw new Error(`Slug duplicado: ${slug}`);
  let cover='byte_no_computador_suave.webp';
  let imageData;
  try {
    imageData=await generateIllustration(num,draft.imageScene,topic[0]);
    cover=`pilula_${num}_${slugify(topic[0]).slice(0,42)}.webp`;
  } catch(e) {console.warn(`Ilustração não gerada; mantendo capa original do Byte. Detalhes: ${e.message}`);}
  const article={
    num,slug,title:draft.title,category:topic[1],date:formatDate(date),publishedOn:date,
    reading:'15–20 min',level:'Conceitos → Prática',cover,keywords:draft.keywords,excerpt:draft.excerpt,
    html:renderArticle({draft,num,category:topic[1],date,cover})
  };
  // Grava a ilustração antes de publicar a referência, mas somente após validar o conteúdo.
  await mkdir(ASSETS_PATH,{recursive:true});
  if(imageData) await writeFile(resolve(ASSETS_PATH,cover),imageData);
  await writeFile(ARTICLES_PATH,JSON.stringify([article,...articles],null,2)+'\n','utf8');
  console.log(`Gerada: Pílula #${num} — ${article.title}; capa: ${cover}; slug: ${slug}`);
}

if(process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(e=>{console.error(`ERRO na geração diária: ${e.message}`); process.exitCode=1;});
}