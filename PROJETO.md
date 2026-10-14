# Projeto: Central de Ajuda do Altchat (manual de usuário e administrador)

Data: 13/10/2026 · Status: PROPOSTA (nada foi construído ainda)

---

## 1. Resumo em 10 linhas

- **O que**: uma Central de Ajuda em português, pública, em `ajuda.altchat.com.br`, com manual completo para **atendente**, **supervisor/admin da empresa** e **super admin (DeskAdvisor/Altarede)**, mais API e solução de problemas.
- **Como**: *docs-as-code* em Markdown, gerada pelo **Astro Starlight** (open source, busca local, modo escuro, acessível, zero custo de licença), servida por um contêiner nginx no mesmo padrão dos outros serviços.
- **Diferenciais que a pesquisa aponta como tendência 2026**: busca e **"Pergunte ao Altchat" (IA sobre a documentação)**, `llms.txt` para que ChatGPT/Claude respondam corretamente sobre o produto, **screenshots geradas automaticamente** pelo próprio sistema (nunca envelhecem), vídeos curtos por tarefa, **botão "?" dentro do Altchat** que abre a página certa para a tela em que o usuário está, feedback "Foi útil?" e página de **Novidades** gerada do histórico de commits.
- **Base do conteúdo**: o código da linha `Altchat_rc27` (commit `6955720`, a que está em produção na Work, Telecomnet e SaaS). Hoje não existe manual nenhum: o README é o do Whaticket, e a ajuda no app se resume a ~7 tooltips.
- **Entrega em 5 fases**; a fase 1 (esqueleto + identidade + seção piloto do atendente) serve para você aprovar estética e tom antes de escrevermos o resto.
- **Decisões que preciso de você** antes de começar: seção 10.

---

## 2. O que a pesquisa mostrou

### 2.1 Tendências (State of Docs 2026 e análises de mercado)

| Tendência | Dado | Consequência para o Altchat |
|---|---|---|
| IA é o primeiro leitor | Chat sobre docs é o recurso mais implantado (38%) e o mais planejado (32%); busca com IA em 2º (29%) | Ter um "Pergunte ao Altchat" e páginas auto-contidas (cada página responde sozinha) |
| Ajuda contextual cresce mais que tudo | Preferência por assistência contextual subiu de 51% para 62% em um ano | Botão de ajuda dentro do app apontando para a página da tela atual |
| Tutoriais interativos estabilizaram | 51% → 53% | Vale ter, mas não é onde investir primeiro |
| Docs legíveis por máquina | `llms.txt`, páginas `.md` e servidores MCP viram padrão | Publicar `llms.txt` e `llms-full.txt` (plugin pronto no Starlight) |
| Estrutura > volume | Categorias claras, busca no topo, "foi útil?", conteúdo além de FAQ | Arquitetura da informação por perfil e por tarefa (seção 5) |

### 2.2 Ferramentas avaliadas

| Categoria | Opções | Veredito para nós |
|---|---|---|
| **Gerador de site de docs (open source)** | **Astro Starlight**, Docusaurus, VitePress, Fumadocs | **Starlight**: busca Pagefind embutida (funciona offline, sem Algolia), i18n nativo (pt/en/es, igual ao app), tema claro/escuro, acessibilidade, quase zero JS, componentes prontos (Passos, Abas, Avisos, Cards, Badges), plugins `starlight-llms-txt`, `starlight-openapi`, `starlight-image-zoom`, `starlight-videos`. Docusaurus só ganha em versionamento por versão de produto, que não precisamos (SaaS único; nas instalações dedicadas basta a marca "disponível desde"). |
| **Plataformas gerenciadas** | Mintlify, GitBook, Document360, ReadMe | Bonitas, mas custam de US$ 65 a US$ 250+/mês, são em inglês por padrão e a IA fica no fornecedor. Mintlify é a referência estética que vamos copiar (hero com busca, cards, barra lateral limpa). |
| **Wiki self-hosted (edição visual)** | BookStack, Docmost, Outline, Wiki.js | Boas para wiki interna, ruins para um manual público bonito; sem `llms.txt`, sem screenshots automáticas, difícil versionar com o código. Descartadas para o manual; BookStack pode servir depois para base interna da operação. |
| **IA sobre docs** | kapa.ai, Inkeep, DocsBot, construção própria | kapa custa ~US$ 25 mil/ano; Inkeep é "source-available". Construção própria é barata: a documentação inteira cabe no contexto do Claude com cache de prompt, dispensando RAG. E podemos usar **o próprio WebChat do Altchat + n8n** como interface (o produto documentando a si mesmo). |
| **Capturas e demos** | Scribe, Tango (guias passo a passo), Arcade/Navattic/Supademo (demos clicáveis), shot-scraper/Playwright (automação) | Scribe/Tango geram guia rápido mas envelhecem. **Playwright/shot-scraper** contra o stack de teste local (`docker-compose.fulltest`) gera todas as telas em um comando, com destaque CSS no elemento certo, e roda de novo a cada release. Demos clicáveis ficam para fase futura. |
| **Ajuda dentro do app** | Userpilot, Appcues, Pendo | Caras e dependem de script externo. Fazemos o essencial nós mesmos: mapa rota → página da doc + painel com a página embutida. |

### 2.3 Benchmarks de concorrentes

- **Chatwoot** (chatwoot.com/docs): separação clara "Guia do usuário / Self-hosting / API", glossário de conceitos (canal, caixa de entrada, automação). Só em inglês: oportunidade para nós em PT-BR.
- **Evolution API** (doc.evolution-api.com, PT-BR, estilo Mintlify): referência estética do ecossistema WhatsApp brasileiro.
- **Digisac**: só FAQ na home e blog; sem manual estruturado. Nossa doc pode ser argumento de venda na migração (a Work está migrando da Digisac).
- **Stripe / Linear**: referências de estética que o mercado cita: tipografia limpa, muito espaço em branco, screenshots com moldura e sombra suave, callouts discretos, busca por atalho `Ctrl+K`.

---

## 3. Diagnóstico do Altchat

- **Linhas de código**: há 3 cópias de trabalho. A que vale é `Altchat_rc27` (`redesign/rc27-baileys`, `6955720`), com Monitoramento, Auditoria, Avaliações, Logs, Gupshup, mensagens automáticas e timeouts. A `Altchat_Github` (stable-v2.1.11) não tem esses recursos e sua marca interna é "DeskAdvisor". O manual documenta o que está em produção.
- **Perfis**: `user` (atendente), `admin` (empresa) e `superadmin` (operação central). O menu muda por perfil.
- **Telas** (menu em PT-BR): Dashboard, Atendimento, Chat Interno, Tickets internos, Contatos, Respostas Rápidas | Administração: Atendimentos, Monitoramento, API Tools, Auditoria, Avaliações, Empresa, Conexões, Filas, Usuários, Ramais (só com SIP), Tags, Assuntos, Configurações | Super admin: Empresas, Avisos, Logs do sistema, Backups.
- **Canais**: WhatsApp QR (Baileys), WABA (API oficial da Meta, direta ou via Gupshup), WebChat (widget + app Flutter), Instagram Direct, Facebook Messenger. Em preparação: Telegram, e-mail, SMS, Reclame Aqui.
- **Documentação existente**: nenhuma para usuário. Existe material de instalação em `docs/cliente/` e coleção Postman da API. Idiomas do app: pt, en, es.
- **Conhecimento tácito a aproveitar**: o histórico desta operação (LID, Baileys 405, fila padrão × bot, mensagens automáticas, timeouts, visibilidade de fila por usuário, histórico entre tickets, foto de perfil, link de continuação) vira seções de "Como funciona" e "Solução de problemas" que nenhum concorrente tem.

---

## 4. Princípios

1. **Diátaxis**: cada página é de um tipo só: *Primeiros passos* (tutorial), *Como fazer* (tarefa), *Referência* (telas e campos) ou *Entenda* (conceitos). Evita o manual-que-mistura-tudo.
2. **Uma tarefa, uma página, auto-contida**: título com verbo ("Transferir um atendimento para outra fila"), pré-requisitos, passos numerados, resultado esperado, erros comuns. É o formato que humanos e IA leem melhor.
3. **Por perfil**: cada página carrega etiqueta Atendente / Admin / Super admin; o leitor filtra pelo que lhe cabe.
4. **Nunca envelhece**: screenshots e lista de configurações vêm do sistema, não de edição manual; cada release tem um checklist "a doc mudou?".
5. **Linguagem**: PT-BR direto, "você", sem jargão sem glossário, termos iguais aos da interface (Fila, Conexão, Atendimento, Ticket).

---

## 5. Arquitetura da informação (sumário proposto)

```
Início (hero com busca + 3 cards: Sou atendente / Sou administrador / Sou da operação)
│
├─ Comece aqui
│   ├─ O que é o Altchat (canais, filas, atendimentos: o modelo mental)
│   ├─ Perfis e permissões (atendente, admin, super admin)
│   ├─ Primeiro acesso e trocar senha
│   ├─ Tour pela tela de atendimento (anatomia com legendas)
│   └─ Glossário
│
├─ Para atendentes
│   ├─ Aceitar, responder e encerrar um atendimento
│   ├─ Abas Abertos / Aguardando / Pesquisa, filtros e badge do menu
│   ├─ Transferir (para fila ou atendente) e o que o cliente recebe
│   ├─ Respostas rápidas (texto, mídia, atalhos)
│   ├─ Enviar e receber mídia, áudio, documentos (limites por canal; zip não vai na WABA)
│   ├─ Anotações internas × mensagem ao cliente
│   ├─ Tags e Assuntos do chamado
│   ├─ Contatos: cadastro, campos personalizados, bloqueio, histórico, importar do telefone
│   ├─ Histórico entre tickets (quando aparece e quando não)
│   ├─ Chat interno e Tickets internos
│   ├─ Status de presença (online, ausente) e sons
│   ├─ Avaliação do cliente: como funciona pelo lado do atendente
│   └─ Atalhos de teclado e dicas de produtividade
│
├─ Para supervisores e administradores
│   ├─ Dashboard e fusos horários
│   ├─ Monitoramento em tempo real (carga viva por fila e atendente)
│   ├─ Atendimentos (relatórios, exportação)
│   ├─ Auditoria: o que é registrado e como investigar
│   ├─ Avaliações: ativar, mensagens, prazo, ler resultados
│   ├─ Filas: criar, cores, saudação, horário por fila, fila padrão (e por que ela interrompe o bot)
│   ├─ Visibilidade de fila por usuário
│   ├─ Usuários: criar, perfil, filas, permissões especiais (apagar chat interno, ver pendentes)
│   ├─ Empresa: operação da equipe, contatos bloqueados, horário de atendimento, feriados
│   ├─ Conexões
│   │   ├─ WhatsApp por QR Code: parear, reparar, foto de perfil, limites e boas práticas
│   │   ├─ WABA (API oficial da Meta): requisitos, templates, janela de 24h, link de continuação
│   │   ├─ WABA via Gupshup: cadastro, webhook, diferenças
│   │   ├─ WebChat: configurar, cores, instalar o widget no site, uso pelo app do provedor
│   │   ├─ Instagram Direct e Messenger
│   │   └─ Pacote de canais e limites contratados
│   ├─ Configurações
│   │   ├─ Geral (ausência, fuso)
│   │   ├─ Mensagens de atendimento (aceite, transferência, anotação)
│   │   ├─ Tempos de espera (timeouts: ação, fila de destino, aviso ao cliente)
│   │   ├─ Avaliações
│   │   └─ Integrações: transcrição de áudio, tokens de API
│   ├─ Ramais SIP e gravação de chamadas (quando contratado)
│   └─ Tags e Assuntos: padronizar a operação
│
├─ Integrações e API
│   ├─ Tokens de integração e webhooks
│   ├─ Enviar mensagens pela API (exemplos curl, PHP, n8n)
│   ├─ Referência da API (gerada da coleção Postman / OpenAPI)
│   ├─ Chatbots com n8n e Typebot: fila do bot, fila padrão, quando o bot para
│   ├─ Widget WebChat: instalação, token, personalização
│   └─ App do provedor (WebChat identificado): o que o programador precisa
│
├─ Operação central (super admin)  ← pode ficar restrita, ver decisão 10.3
│   ├─ Empresas: criar, pacote de canais, limites, flags (SIP, bloqueio, prévia de pendentes)
│   ├─ Avisos globais
│   ├─ Logs do sistema e Backups
│   ├─ Licenciamento (modo degradado: o que bloqueia)
│   └─ Instalação e atualização em servidor dedicado (reaproveita docs/cliente)
│
├─ Solução de problemas
│   ├─ A conexão QR caiu / pede pareamento de novo
│   ├─ Mensagem não enviada (ack 0, erro 10/2593180 da Meta, janela 24h)
│   ├─ Cliente não aparece na fila certa
│   ├─ Bot não para quando transfiro
│   ├─ Mídia não abre / arquivo recusado
│   ├─ Não recebo em tempo real (modo suporte)
│   └─ Foto de perfil não aparece
│
├─ Novidades (changelog por mês, gerado dos commits e revisado à mão)
└─ Perguntas frequentes
```

Estimativa: ~80 páginas, sendo ~45 "Como fazer", ~20 "Referência", ~10 "Entenda", ~7 "Solução de problemas".

---

## 6. Stack técnica

| Peça | Escolha | Observação |
|---|---|---|
| Gerador | Astro + Starlight | Markdown/MDX em Git; build estático; `npm run build` gera HTML puro |
| Busca | Pagefind (embutido) | Índice local em PT-BR, atalho `Ctrl+K`, sem serviço externo |
| Tema | Tokens da marca Altchat: primário `#176b63` (verde), secundário `#a87422` (dourado), info `#3567c8`; fonte Inter; claro/escuro | Extraídos do `App.js` do frontend; mesma paleta do painel |
| Componentes | Steps, Tabs, Aside (Dica/Atenção/Cuidado), Card, Badge de perfil, Kbd, zoom em imagem, vídeo | `starlight-image-zoom`, `starlight-videos` |
| Diagramas | Mermaid (fluxo do ticket, canais, timeouts) | renderizado no build |
| Legível por IA | `starlight-llms-txt` → `/llms.txt`, `/llms-full.txt`, `.md` por página | plugin da comunidade Starlight |
| API | `starlight-openapi` a partir de um `openapi.yaml` derivado da coleção Postman | referência navegável com exemplos |
| Screenshots | Playwright (ou shot-scraper) contra `docker-compose.fulltest` (:3196) com empresa "Demonstração" semeada; um arquivo `capturas/*.json` declara URL, seletor a destacar e nome do arquivo | roda em um comando; artefatos em `src/assets/telas/` |
| Vídeos curtos | Playwright grava `.webm` de 10 a 30 s por tarefa; legendas e zoom via HyperFrames quando valer a pena | opcional, fase 3 |
| Hospedagem | Contêiner nginx:alpine com o `dist/`; `docker-compose` no servidor do SaaS; `ajuda.altchat.com.br` com TLS no mesmo proxy | ~5 MB, sem backend |
| Repositório | `altchat-docs` separado do produto (publicação independente; pode ficar público) | GitHub Actions opcional para build |
| Feedback | "Esta página ajudou?" → POST em webhook do n8n → planilha/Altchat | sem serviço de terceiros |
| IA | Fase 4: "Pergunte ao Altchat" | ver 7.3 |

---

## 7. Recursos inovadores (ordem de valor × esforço)

1. **Botão "?" contextual no Altchat** (esforço baixo, valor alto). Um ícone na AppBar abre um painel lateral com a página da doc correspondente à rota atual (`/connections` → Conexões; dentro de um ticket → Atendimento). Mapa rota→URL em um arquivo JSON; a doc abre em `iframe` ou nova aba. Primeiro contato de muitos usuários com o manual.
2. **Screenshots que se regeneram** (esforço médio, valor alto). Cada release roda o script e as imagens mudam sozinhas; o PR da doc mostra o diff visual. Nenhum concorrente nacional faz isso.
3. **"Pergunte ao Altchat"** (esforço médio, valor alto). Widget WebChat do próprio Altchat na doc, ligado a um fluxo n8n que chama o Claude com `llms-full.txt` no sistema (cache de prompt torna barato). Responde em PT-BR e cita a página. Dupla função: ajuda e demonstração viva do produto. Alternativa sem IA externa: busca Pagefind já resolve 80%.
4. **`llms.txt` + páginas `.md`** (esforço mínimo). ChatGPT/Claude/Perplexity passam a responder sobre o Altchat com a nossa fonte.
5. **Novidades geradas dos commits** (esforço baixo). Script agrupa commits por mês e produz rascunho que revisamos; vira também material para o aviso global do app.
6. **Vídeos de 15 s por tarefa** (esforço médio). Loop mudo, sem narração, no topo das páginas "Como fazer" mais usadas (aceitar, transferir, resposta rápida, parear QR).
7. **Modo impressão / PDF por seção** (esforço baixo). Clientes que exigem "manual em PDF" recebem a mesma fonte.
8. **Filtro por perfil** (esforço baixo). Chip "Mostrar só o que o atendente vê" esconde páginas de admin.
9. Para depois: demos clicáveis (tipo Arcade) e MCP server da doc.

---

## 8. Estética (o que você verá na fase 1)

- **Home**: fundo claro, logo, uma frase ("Tudo sobre o Altchat, do primeiro atendimento à API"), campo de busca grande no centro, 3 cards por perfil com ícone, abaixo "Mais procurados" (6 links) e "Novidades deste mês".
- **Página de tarefa**: cabeçalho com badge do perfil e tempo de leitura; "Antes de começar" em caixa discreta; passos numerados com a screenshot ao lado de cada passo (elemento em destaque com contorno verde); "Resultado"; "Problemas comuns"; "Páginas relacionadas"; "Esta página ajudou?".
- **Screenshots**: moldura de janela leve, sombra suave, cantos arredondados, zoom ao clicar; dados fictícios coerentes (empresa "Provedor Demonstração", contatos com nomes brasileiros).
- **Barra lateral**: grupos por perfil, página atual destacada, recolhível; índice da página à direita.
- **Modo escuro** automático, mesmo verde da marca ajustado para contraste.
- **Tipografia**: Inter 16 px, linha de 70 caracteres, títulos com verbo, sem paredes de texto.

---

## 9. Fases, entregas e esforço

| Fase | Entrega | Esforço estimado | Você aprova |
|---|---|---|---|
| **1. Fundação** | Projeto Starlight, identidade visual, home, sumário vazio, 8 páginas da seção "Para atendentes" completas com screenshots reais, rodando em `localhost` e em contêiner | 2 a 3 dias | Estética, tom, estrutura de página |
| **2. Conteúdo** | Todas as ~80 páginas (atendente, admin, integrações, solução de problemas, glossário), screenshots automáticas para todas, Novidades dos últimos 3 meses | 6 a 8 dias | Revisão técnica por amostra |
| **3. Mídia** | Vídeos curtos nas 10 tarefas mais usadas, diagramas Mermaid, PDF por seção | 2 dias | — |
| **4. Inteligência** | `llms.txt`, "Pergunte ao Altchat" via WebChat + n8n + Claude, feedback por página | 2 a 3 dias | Custo da API (estimo centavos por pergunta) |
| **5. Dentro do app e publicação** | Botão "?" contextual no frontend do Altchat (patch pequeno, levar aos 4 servidores), `ajuda.altchat.com.br` no ar, checklist "a doc mudou?" no fluxo de release | 1 a 2 dias | Deploy |

Manutenção depois: cada patch que muda tela ou comportamento inclui a página da doc; rodar o script de screenshots a cada release.

---

## 10. Decisões que preciso de você

1. **Nome e domínio**: `ajuda.altchat.com.br` (proposta) ou `docs.altchat.com.br`? Público ou só para logados?
2. **Marca**: "Altchat" em todo o manual (os servidores dedicados usam o mesmo nome?) ou neutro para permitir white-label (ex.: a Govista enxerga outro nome?).
3. **Operação central e instalação em servidor**: incluir na mesma doc em seção separada, ou manter interno (hoje `docs/README.md` proíbe enviar `docs/central` ao cliente)?
4. **"Pergunte ao Altchat"**: fazer com Claude (precisa de chave da API e de um fluxo n8n no servidor) ou só busca local na fase 1?
5. **Ordem**: começar por atendente (maior volume de usuários) ou por admin (quem compra e configura)?
6. **Idiomas**: só PT-BR agora, estrutura pronta para EN/ES depois (proposta), ou já traduzir?
7. **Stack de teste para screenshots**: posso usar o `docker-compose.fulltest` (:3196) com uma empresa semeada "Demonstração", ou prefere capturar no SaaS com uma empresa de teste?

---

## 11. Fontes

- State of Docs 2026: https://www.stateofdocs.com/2026/ai-and-documentation-consumption
- Tendências 2026: https://www.fluidtopics.com/blog/industry-insights/technical-documentation-trends-2026/ · https://document360.com/blog/ai-documentation-trends/ · https://www.rasepi.com/blog/the-state-of-docs-in-2026/
- Comparativos de ferramentas: https://dupple.com/learn/best-documentation-tools · https://www.gitbook.com/blog/best-software-documentation-tools · https://www.mintlify.com/library/7-best-software-documentation-tools-in-2026 · https://documentation.ai/blog/mintlify-alternatives
- Geradores open source: https://www.pkgpulse.com/guides/docusaurus-vs-vitepress-vs-nextra-vs-starlight-2026 · https://docsio.co/blog/starlight-vs-docusaurus · https://fumadocs.dev/docs/comparisons
- Wikis self-hosted: https://docmost.com/blog/self-hosted-documentation-tools/ · https://contabo.com/blog/best-self-hosted-wiki-tools/
- IA sobre docs: https://www.kapa.ai/library/kapa.ai-vs-inkeep-(2026)-comparing-two-approaches-to-ai-for-technical-documentation · https://docs.inkeep.com/pricing · https://buildwithfern.com/post/kapa-reviews-pricing-alternatives
- Capturas e demos: https://simonwillison.net/2022/Mar/10/shot-scraper/ · https://dev.to/jakexkim/playwright-screenshots-for-documentation-what-to-automate-and-what-to-review-3h44 · https://www.arcade.software/post/product-tour-software-saas · https://www.guidejar.com/blog/top-10-scribehow-alternatives-2026-best-tools-for-process-documentation
- Design de central de ajuda: https://userpilot.com/blog/15-saas-best-help-center-designs · https://herothemes.com/blog/help-center-examples/ · https://www.jivochat.com.br/blog/comunicacao/base-de-conhecimento-como-criar-uma-central-de-ajuda.html
- llms.txt: https://dev.to/hayerhans/what-is-llmstxt-1hgg
- Benchmarks: https://chatwoot.com/docs · https://doc.evolution-api.com/v2/pt/get-started/introduction · https://digisac.com.br/
