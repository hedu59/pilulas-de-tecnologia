# Política editorial — Pílulas de Tecnologia

## Uma pílula por dia, alternando trilhas

**Regra editorial atualizada em 30/10/2026:** gerar **exatamente UMA pílula por dia**, alternando rigorosamente entre:

- **AI Engineering**: SDD, GitHub Spec Kit (constitution/spec/plan/tasks), agentes, skills, MCP, context engineering, RAG, embeddings, evals, guardrails, prompt injection, segurança, tracing, custos e integração .NET/Angular.
- **Engenharia de software (não IA)**: C#, .NET/ASP.NET Core, APIs, Angular, EF Core/Dapper, SQL Server/Oracle/Postgres, performance, SOLID, DDD, Clean/Hexagonal, CQRS, design patterns, sistemas distribuídos, mensageria, consistência, observabilidade, Docker, Kubernetes, Cloud, CI/CD e DevSecOps.

**Nunca publicar duas pílulas no mesmo dia como parte da programação**, nem repetir a mesma trilha em dias consecutivos. Cada nova pílula ocupa um número único na sequência do blog. Consultar edições anteriores para evitar repetição de temas.

## Próximas edições planejadas

- **#008 — IA (próximo dia):** Do SPEC ao PLAN — requisitos para decisões arquiteturais com IA.
- **#009 — Engenharia de software (dia seguinte):** Concorrência e requisições assíncronas no ASP.NET Core — quando usar `async/await` e o que não resolve.
- **#010 — IA**; **#011 — Engenharia de software**; e assim sucessivamente, mantendo a alternância.

As pautas são planejamento; não significam que os artigos já tenham sido publicados.

## Qualidade técnica

Cada artigo deve ter um conceito para 15–20 minutos, problema real, explicação e analogia, exemplo de código, alternativas e trade-offs, armadilhas, diagrama técnico, entrevista Sênior com resposta, desafio, referência oficial e ilustração original do Byte (quando disponível). Respeitar informações confidenciais.

## Criação, publicação e distribuição

- A automação **Engineering Mastery** do ChatGPT entrega **uma única pílula diariamente às 22h** (fuso America/Sao_Paulo), alternando temas.
- O autor solicita **separadamente** o envio do artigo ao blog. Não há geração automática por API da OpenAI no GitHub.
- Cada commit na branch `main` aciona o GitHub Actions para validar, compilar e publicar o site Astro.
- O feed `src/pages/rss.xml.js` lista individualmente as pílulas que já foram efetivamente publicadas, com GUID permanente, link, descrição, trilha, data e capa do Byte.
- Opcionalmente, RSS by Zapier pode compartilhar **cada novo artigo publicado** no LinkedIn pessoal, após conexão e ativação pelo autor.

O RSS não divulga textos gerados somente no ChatGPT sem que sejam publicados no repositório. O agendamento não garante que o artigo já esteja no blog ou no LinkedIn.
