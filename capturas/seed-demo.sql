-- Dados fictícios da empresa "Provedor Demonstração" (companyId 1) para as capturas de tela da Central de Ajuda.
-- Usuários: 4 = Mariana Souza (admin), 5 = Carlos Lima (atendente), 6 = Juliana Prado (atendente).
BEGIN;
-- as sequencias avancam mesmo em rollback; recomeçar para que os ids fixos abaixo batam
SELECT setval(pg_get_serial_sequence(quote_ident(t), 'id'), 1, false) FROM unnest(ARRAY['Queues','Whatsapps','Tags','TicketSubjects','QuickAnswers','Contacts','ContactCustomFields','Tickets']) AS t;

INSERT INTO "Queues" (name, color, "greetingMessage", "companyId", "createdAt", "updatedAt") VALUES
 ('Suporte', '#176b63', 'Olá! Você está na fila de Suporte. Em instantes um técnico vai atender.', 1, now(), now()),
 ('Financeiro', '#a87422', 'Olá! Você está na fila do Financeiro. Em instantes vamos atender.', 1, now(), now()),
 ('Comercial', '#3567c8', 'Olá! Você está na fila Comercial. Já vamos falar com você.', 1, now(), now());

INSERT INTO "UserQueues" ("userId", "queueId", "createdAt", "updatedAt")
 SELECT u.id, q.id, now(), now() FROM "Users" u CROSS JOIN "Queues" q
 WHERE u."companyId" = 1 AND (u.id = 4 OR (u.id = 5 AND q.name IN ('Suporte','Financeiro')) OR (u.id = 6 AND q.name IN ('Comercial','Financeiro')));

INSERT INTO "Whatsapps" (name, status, "isDefault", retries, "companyId", "connectionType", "connectedNumber", "greetingMessage", "farewellMessage", "createdAt", "updatedAt") VALUES
 ('Atendimento Principal', 'CONNECTED', true, 0, 1, 'baileys', '5522999990001', E'Olá! Bem-vindo ao Provedor Demonstração. Escolha uma opção:\n1 - Suporte\n2 - Financeiro\n3 - Comercial', 'Obrigado pelo contato! Até a próxima.', now(), now()),
 ('WhatsApp Oficial (WABA)', 'CONNECTED', false, 0, 1, 'waba', '5522999990002', NULL, NULL, now(), now()),
 ('Site do provedor', 'CONNECTED', false, 0, 1, 'webchat', NULL, NULL, NULL, now(), now());

UPDATE "Whatsapps" SET "webchatToken" = 'demo-webchat-token', "webchatTitle" = 'Fale com a gente', "webchatSubtitle" = 'Respondemos em minutos', "webchatColor" = '#176b63' WHERE "connectionType" = 'webchat';

INSERT INTO "WhatsappQueues" ("whatsappId", "queueId", "createdAt", "updatedAt")
 SELECT w.id, q.id, now(), now() FROM "Whatsapps" w CROSS JOIN "Queues" q WHERE w."companyId" = 1;

INSERT INTO "Tags" (name, color, "companyId", "createdAt", "updatedAt") VALUES
 ('Sem internet', '#d32f2f', 1, now(), now()),
 ('2ª via boleto', '#a87422', 1, now(), now()),
 ('Troca de plano', '#3567c8', 1, now(), now()),
 ('Elogio', '#176b63', 1, now(), now());

INSERT INTO "TicketSubjects" (name, "isActive", "companyId", "countInDashboard", "createdAt", "updatedAt") VALUES
 ('Lentidão', true, 1, true, now(), now()),
 ('Sem conexão', true, 1, true, now(), now()),
 ('Fatura', true, 1, true, now(), now()),
 ('Novo contrato', true, 1, true, now(), now()),
 ('Cancelamento', true, 1, true, now(), now());

INSERT INTO "QuickAnswers" (shortcut, message, "companyId", "createdAt", "updatedAt") VALUES
 ('bomdia', 'Bom dia! Aqui é do Provedor Demonstração. Em que posso ajudar?', 1, now(), now()),
 ('reiniciar', 'Por favor, desligue o roteador da tomada, aguarde 30 segundos e ligue novamente. Me avise quando as luzes estabilizarem.', 1, now(), now()),
 ('boleto', 'Sua 2ª via do boleto pode ser emitida pela Central do Assinante: https://central.provedor.com.br. Se preferir, eu envio por aqui.', 1, now(), now()),
 ('visita', 'Agendei a visita técnica. O técnico vai entrar em contato por este número antes de ir até o endereço.', 1, now(), now()),
 ('encerrar', 'Fico feliz em ter ajudado! Qualquer coisa é só chamar. Tenha um ótimo dia!', 1, now(), now());

INSERT INTO "Contacts" (name, number, email, "isGroup", "companyId", "createdAt", "updatedAt") VALUES
 ('Ana Paula Ribeiro', '5522988881001', 'ana.ribeiro@email.com', false, 1, now(), now()),
 ('Roberto Carvalho', '5522988881002', '', false, 1, now(), now()),
 ('Padaria Pão Quente', '5522988881003', 'contato@paoquente.com.br', false, 1, now(), now()),
 ('Fernanda Martins', '5522988881004', '', false, 1, now(), now()),
 ('Lucas Andrade', '5522988881005', '', false, 1, now(), now()),
 ('Marcos Vinícius', '5522988881006', '', false, 1, now(), now()),
 ('Beatriz Nogueira', '5522988881007', 'bia.nogueira@email.com', false, 1, now(), now()),
 ('Condomínio Vista Verde', '5522988881008', '', false, 1, now(), now());

INSERT INTO "ContactCustomFields" (name, value, "contactId", "createdAt", "updatedAt") VALUES
 ('Código do cliente', '10234', 1, now(), now()),
 ('Plano', 'Fibra 500 Mega', 1, now(), now()),
 ('Código do cliente', '10877', 2, now(), now());

-- Tickets: abertos (com dono), aguardando (sem dono) e encerrados
INSERT INTO "Tickets" (status, "lastMessage", "contactId", "userId", "whatsappId", "isGroup", "unreadMessages", "queueId", "companyId", "createdAt", "updatedAt") VALUES
 ('open',    'Reiniciei e continua sem sinal na luz LOS', 1, 5, 1, false, 2, 1, 1, now() - interval '35 minutes', now() - interval '2 minutes'),
 ('open',    'Pode me mandar a 2ª via?', 2, 5, 1, false, 0, 2, 1, now() - interval '1 hour', now() - interval '12 minutes'),
 ('open',    'Quero migrar para o plano de 1 Giga', 4, 6, 2, false, 1, 3, 1, now() - interval '20 minutes', now() - interval '5 minutes'),
 ('pending', 'Boa tarde, minha internet está muito lenta hoje', 3, NULL, 1, false, 1, 1, 1, now() - interval '8 minutes', now() - interval '8 minutes'),
 ('pending', 'Olá, gostaria de contratar um plano', 5, NULL, 1, false, 1, 3, 1, now() - interval '3 minutes', now() - interval '3 minutes'),
 ('pending', 'Oi', 7, NULL, 3, false, 1, NULL, 1, now() - interval '1 minute', now() - interval '1 minute'),
 ('closed',  'Obrigado, resolveu!', 6, 5, 1, false, 0, 1, 1, now() - interval '1 day', now() - interval '23 hours'),
 ('closed',  'Perfeito, muito obrigada', 8, 6, 1, false, 0, 2, 1, now() - interval '2 days', now() - interval '2 days');

UPDATE "Tickets" SET "closedAt" = "updatedAt", "closedByType" = 'user', "closedByUserId" = "userId" WHERE status = 'closed';

INSERT INTO "TicketTags" ("ticketId", "tagId", "createdAt", "updatedAt") VALUES (1, 1, now(), now()), (2, 2, now(), now()), (3, 3, now(), now()), (7, 4, now(), now());

INSERT INTO "Messages" (id, body, ack, read, "mediaType", "ticketId", "contactId", "fromMe", "isDeleted", "createdAt", "updatedAt") VALUES
 ('m1-1', 'Boa tarde! Minha internet caiu faz uma hora. A luz LOS do aparelho está vermelha.', 3, true, 'chat', 1, 1, false, false, now() - interval '35 minutes', now() - interval '35 minutes'),
 ('m1-2', 'Boa tarde, Ana! Aqui é o Carlos, do Suporte. Vou verificar agora. Pode me confirmar se as outras luzes estão acesas?', 3, true, 'chat', 1, 1, true, false, now() - interval '33 minutes', now() - interval '33 minutes'),
 ('m1-3', 'Sim, só a LOS está vermelha e piscando', 3, true, 'chat', 1, 1, false, false, now() - interval '31 minutes', now() - interval '31 minutes'),
 ('m1-4', 'Por favor, desligue o roteador da tomada, aguarde 30 segundos e ligue novamente. Me avise quando as luzes estabilizarem.', 3, true, 'chat', 1, 1, true, false, now() - interval '30 minutes', now() - interval '30 minutes'),
 ('m1-5', 'Reiniciei e continua sem sinal na luz LOS', 0, false, 'chat', 1, 1, false, false, now() - interval '2 minutes', now() - interval '2 minutes'),
 ('m2-1', 'Oi, bom dia. Não recebi o boleto deste mês.', 3, true, 'chat', 2, 2, false, false, now() - interval '1 hour', now() - interval '1 hour'),
 ('m2-2', 'Bom dia, Roberto! Vou verificar seu cadastro. Um momento.', 3, true, 'chat', 2, 2, true, false, now() - interval '55 minutes', now() - interval '55 minutes'),
 ('m2-3', 'Pode me mandar a 2ª via?', 3, true, 'chat', 2, 2, false, false, now() - interval '12 minutes', now() - interval '12 minutes'),
 ('m3-1', 'Olá! Hoje tenho o plano de 500 mega. Quanto fica o de 1 giga?', 3, true, 'chat', 3, 4, false, false, now() - interval '20 minutes', now() - interval '20 minutes'),
 ('m3-2', 'Olá, Fernanda! O plano Fibra 1 Giga sai por R$ 129,90/mês com instalação grátis. Quer que eu faça a migração?', 3, true, 'chat', 3, 4, true, false, now() - interval '15 minutes', now() - interval '15 minutes'),
 ('m3-3', 'Quero migrar para o plano de 1 Giga', 0, false, 'chat', 3, 4, false, false, now() - interval '5 minutes', now() - interval '5 minutes'),
 ('m4-1', 'Boa tarde, minha internet está muito lenta hoje', 0, false, 'chat', 4, 3, false, false, now() - interval '8 minutes', now() - interval '8 minutes'),
 ('m5-1', 'Olá, gostaria de contratar um plano', 0, false, 'chat', 5, 5, false, false, now() - interval '3 minutes', now() - interval '3 minutes'),
 ('m6-1', 'Oi', 0, false, 'chat', 6, 7, false, false, now() - interval '1 minute', now() - interval '1 minute'),
 ('m7-1', 'Minha internet está caindo toda hora', 3, true, 'chat', 7, 6, false, false, now() - interval '1 day', now() - interval '1 day'),
 ('m7-2', 'Identifiquei um sinal fraco na sua fibra. Agendei a visita técnica para amanhã de manhã.', 3, true, 'chat', 7, 6, true, false, now() - interval '1 day' + interval '10 minutes', now() - interval '1 day' + interval '10 minutes'),
 ('m7-3', 'Obrigado, resolveu!', 3, true, 'chat', 7, 6, false, false, now() - interval '23 hours', now() - interval '23 hours'),
 ('m8-1', 'Preciso da nota fiscal de setembro', 3, true, 'chat', 8, 8, false, false, now() - interval '2 days', now() - interval '2 days'),
 ('m8-2', 'Segue a nota fiscal em anexo. Qualquer dúvida estou à disposição.', 3, true, 'chat', 8, 8, true, false, now() - interval '2 days' + interval '5 minutes', now() - interval '2 days' + interval '5 minutes'),
 ('m8-3', 'Perfeito, muito obrigada', 3, true, 'chat', 8, 8, false, false, now() - interval '2 days' + interval '6 minutes', now() - interval '2 days' + interval '6 minutes');

COMMIT;

-- assunto obrigatório ao resolver (faz a janela "Resolver chamado" aparecer); a migration já cria a linha como 'disabled'
UPDATE "Settings" SET value = 'enabled' WHERE "companyId" = 1 AND key = 'ticketSubjectRequired';
INSERT INTO "Settings" (key, value, "companyId", "createdAt", "updatedAt")
 SELECT 'ticketSubjectRequired', 'enabled', 1, now(), now()
 WHERE NOT EXISTS (SELECT 1 FROM "Settings" WHERE "companyId" = 1 AND key = 'ticketSubjectRequired');

-- pacote de canais completo e bloqueio de contatos liberado para a empresa de demonstração
UPDATE "Companies" SET "connectionPlan" = '{"baileys":{"enabled":true,"limit":null},"waba":{"enabled":true,"limit":null},"webchat":{"enabled":true,"limit":null},"instagram":{"enabled":true,"limit":null},"messenger":{"enabled":true,"limit":null}}'::jsonb, "allowContactBlocking" = true, "allowPendingTicketPreview" = true WHERE id = 1;
