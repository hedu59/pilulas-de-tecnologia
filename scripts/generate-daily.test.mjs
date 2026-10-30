import test from 'node:test';
import assert from 'node:assert/strict';
import {escapeHtml,slugify,selectTopic,formatDate,localDate,renderArticle,validateGenerated} from './generate-daily.mjs';

test('próxima pílula é PLAN após SPEC',()=>{
 assert.match(selectTopic(8)[0],/SPEC ao PLAN/);
 assert.equal(selectTopic(9)[1],'AI Engineering');
 assert.equal(selectTopic(13)[1],'.NET & C#');
});
test('slug e datas consistentes em pt-BR',()=>{
 assert.equal(slugify('Do SPEC ao PLAN: Organização!'),'do-spec-ao-plan-organizacao');
 assert.match(formatDate('2026-10-30'),/30 de out/i);
 assert.equal(localDate(new Date('2026-10-31T00:00:00.000Z')),'2026-10-30');
});
test('HTML gerado escapa scripts e nomes',()=>{
 const draft={title:'<script>alert(1)</script>',lead:'Material de qualidade para engenheiros.',
 sections:[{heading:'Arquitetura',paragraphs:['A '.repeat(50)],bullets:['<svg/onload=alert(1)>'],codeLanguage:'csharp',code:'if (x < 2) {}'}],
 interviewQuestion:'Qual a diferença?',interviewAnswer:'Toda decisão importa.',takeaways:['Revisar','Testar','Documentar']};
 const html=renderArticle({draft,num:'008',category:'AI Engineering',date:'2026-10-30',cover:'byte_icon.webp'});
 assert.ok(!html.includes('<script>'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(html.includes('if (x &lt; 2) {}'));
 assert.ok(!html.includes('<svg'));
});
test('validação bloqueia rascunhos superficiais',()=>{
 assert.throws(()=>validateGenerated({sections:[]},'Tema'),/Campo editorial/);
});