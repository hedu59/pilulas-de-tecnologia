# Política editorial — Pílulas de Tecnologia

## Duas trilhas, dois artigos por dia

**Regra definida em 29/10/2026:** a programação de conteúdo deve ter **exatamente duas pílulas diferentes por dia**:

1. **Uma de AI Engineering**, por exemplo: SDD, GitHub Spec Kit (constitution/spec/plan/tasks), agentes, skills, MCP, context engineering, RAG, embeddings, avaliação de agentes (evals), guardrails, prompt injection, segurança, tracing, observabilidade, custos e integração com .NET/Angular.
2. **Uma de engenharia de software não dedicada a IA**, alternando: C#, .NET/ASP.NET Core, APIs, Angular, EF Core/Dapper, SQL Server/Oracle/Postgres, performance, SOLID, DDD, Clean Architecture, CQRS, design patterns, sistemas distribuídos, mensageria, consistência, observabilidade, Docker, Kubernetes, Cloud, CI/CD e DevSecOps.

As pílulas são **artigos autônomos**, com números diferentes e ordenados em uma única sequência no blog. Deve-se conferir a última edição antes de numerar e não repetir assuntos já cobertos.

Para cada uma: problema prático, explicação, exemplo de código, decisões e trade-offs, diagrama técnico, ilustração original do Byte (se disponível), armadilhas, entrevista Sênior com resposta, desafio curto e fontes oficiais. Sempre evitar material confidencial.

## Próximas edições planejadas

- **#008 / AI Engineering:** Do SPEC ao PLAN — como transformar requisitos em decisões arquiteturais com IA.
- **#009 / .NET & C#:** Concorrência e requisições assíncronas no ASP.NET Core — quando usar `async/await` e o que não resolve.

Esses títulos são uma **proposta de pauta**, não significam que já tenham sido publicados. As pautas seguintes devem alternar assunto e aprofundar os conceitos sem repetição.

## Rotina e publicação

- Uma automação existente no ChatGPT prepara as duas pílulas diariamente às 22h (America/Sao_Paulo).
- O autor **solicita separadamente** a publicação no blog, evitando uso de API paga de IA.
- Um commit na branch `main` aciona GitHub Actions para compilar e publicar o site.
- `src/pages/rss.xml.js` gera o feed RSS de cada artigo publicado, incluindo título, descrição, link permanente, data, trilha e a capa original do Byte.
- Um Zap externo pode detectar **cada nova entrada** do RSS e compartilhar automaticamente no LinkedIn pessoal. Não se deve configurar a postagem do LinkedIn antes de confirmar/autorizar a conta do autor.

**O RSS publica somente artigos efetivamente presentes no repositório**, não textos gerados apenas no ChatGPT.

## Distribuição

Publicar as duas entradas no mesmo dia é o objetivo editorial; a ordem ou horários exatos no site dependem do pedido do autor e do deploy. No LinkedIn, cada entrada tem seu próprio GUID imutável para evitar repostagem indevida em atualizações de estilo ou documentação.
