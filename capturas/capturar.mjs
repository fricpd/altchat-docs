// Capturas automáticas das telas do Altchat para a Central de Ajuda.
// Roda contra o stack local (frontend :3099 / backend :8099) com a empresa "Provedor Demonstração".
// Uso: node capturar.mjs [nome-da-captura ...]
// Saída: ../site/src/assets/telas/<nome>.png
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = process.env.ALTCHAT_URL || 'http://localhost:3099';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'site', 'src', 'assets', 'telas');
mkdirSync(OUT, { recursive: true });

const USUARIOS = {
	atendente: { email: 'carlos@demo.local', senha: 'Demo@2026' },
	admin: { email: 'admin@demo.local', senha: 'Demo@2026' },
};

const VERDE = '#176b63';

/** Contorno verde no elemento. */
async function destacar(loc) {
	const n = await loc.count();
	for (let i = 0; i < n; i++) {
		await loc.nth(i).evaluate((el) => {
			el.style.outline = '3px solid #176b63';
			el.style.outlineOffset = '4px';
			el.style.borderRadius = el.style.borderRadius || '10px';
			el.style.boxShadow = '0 0 0 8px rgba(23,107,99,0.16)';
		});
	}
}

/** Caminhos de ícones do Material UI usados para achar botões sem rótulo. */
const ICONE = {
	moreVert: 'path[d^="M12 8c1.1"]',
	replay: 'path[d^="M12 5V1L7 6l5 5V7"]',
	checkCircle: 'path[d^="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5"]',
	pause: 'path[d^="M9 16h2V8H9v8zm3-14C6.48"]',
};

const menu = (page, rotulo) => page.getByRole('listitem').filter({ hasText: rotulo }).first();
const abrirTicket = async (page, nomeContato) => {
	await menu(page, 'Atendimento').click();
	await page.waitForTimeout(1200);
	await page.getByText(nomeContato).first().click();
	await page.waitForTimeout(1500);
};
const ORDEM_HEADER = { pause: 0, replay: 1, checkCircle: 2, moreVert: 3 };
// Os 4 botões de ação ficam no grupo imediatamente anterior ao botão "Mostrar detalhes"
const botaoHeader = (page, icone) => icone === 'moreVert' ? page.locator('main button:has(svg)').filter({ has: page.locator(ICONE.moreVert) }).first() : page.getByRole('button', { name: 'Mostrar detalhes' }).locator('xpath=preceding-sibling::*[1]').getByRole('button').nth(ORDEM_HEADER[icone]);
const caixaMensagem = (page) => page.locator('main').getByRole('textbox').last();

/** Manifesto: nome → { usuario, passos(page), destaque?(page) → locator, inteira? } */
const CAPTURAS = {
	'menu-lateral': {
		usuario: 'atendente',
		passos: async (page) => { await menu(page, 'Dashboard').click(); await page.waitForTimeout(800); },
		destaque: (page) => page.getByRole('list').first(),
	},
	'tela-atendimento': {
		usuario: 'atendente',
		passos: async (page) => abrirTicket(page, 'Ana Paula Ribeiro'),
	},
	'abas-atendendo-aguardando': {
		usuario: 'atendente',
		passos: async (page) => abrirTicket(page, 'Ana Paula Ribeiro'),
		destaque: (page) => page.getByRole('tab', { name: /Atendendo/ }).locator('xpath=..'),
	},
	'abas-individuais-grupos': {
		usuario: 'atendente',
		passos: async (page) => abrirTicket(page, 'Ana Paula Ribeiro'),
		destaque: (page) => page.getByRole('tablist', { name: 'conversation type tabs' }),
	},
	'aguardando-aceitar': {
		usuario: 'atendente',
		passos: async (page) => {
			await menu(page, 'Atendimento').click();
			await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: /Aguardando/ }).click();
			await page.waitForTimeout(1000);
			await page.getByText('Padaria Pão Quente').first().hover();
			await page.waitForTimeout(400);
		},
		destaque: (page) => page.getByRole('button', { name: 'Aceitar', exact: true }).first(),
	},
	'cabecalho-ticket': {
		usuario: 'atendente',
		passos: async (page) => abrirTicket(page, 'Ana Paula Ribeiro'),
		destaque: (page) => page.getByRole('button', { name: 'Mostrar detalhes' }).locator('xpath=preceding-sibling::*[1]'),
	},
	'botao-resolver': {
		usuario: 'atendente',
		passos: async (page) => abrirTicket(page, 'Ana Paula Ribeiro'),
		destaque: (page) => botaoHeader(page, 'checkCircle'),
	},
	'resolver-dialog': {
		usuario: 'atendente',
		passos: async (page) => {
			await abrirTicket(page, 'Ana Paula Ribeiro');
			await botaoHeader(page, 'checkCircle').click({ force: true });
			await page.waitForTimeout(900);
		},
	},
	'botao-retornar': {
		usuario: 'atendente',
		passos: async (page) => abrirTicket(page, 'Ana Paula Ribeiro'),
		destaque: (page) => botaoHeader(page, 'replay'),
	},
	'menu-mais-opcoes': {
		usuario: 'atendente',
		passos: async (page) => {
			await abrirTicket(page, 'Ana Paula Ribeiro');
			await botaoHeader(page, 'moreVert').click();
			await page.waitForTimeout(600);
		},
		destaque: (page) => page.getByRole('menu'),
	},
	'transferir-modal': {
		usuario: 'atendente',
		passos: async (page) => {
			await abrirTicket(page, 'Ana Paula Ribeiro');
			await botaoHeader(page, 'moreVert').click();
			await page.getByRole('menuitem', { name: 'Transferir' }).click();
			await page.waitForTimeout(900);
		},
	},
	'tags-modal': {
		usuario: 'atendente',
		passos: async (page) => {
			await abrirTicket(page, 'Ana Paula Ribeiro');
			await botaoHeader(page, 'moreVert').click();
			await page.getByRole('menuitem', { name: 'Tags' }).click();
			await page.waitForTimeout(900);
		},
	},
	'caixa-mensagem': {
		usuario: 'atendente',
		passos: async (page) => abrirTicket(page, 'Ana Paula Ribeiro'),
		destaque: (page) => caixaMensagem(page).locator('xpath=ancestor::*[.//button[@aria-label="upload" or @title="upload"] or .//*[@aria-label="upload"]][1]'),
	},
	'respostas-rapidas-barra': {
		usuario: 'atendente',
		passos: async (page) => {
			await abrirTicket(page, 'Ana Paula Ribeiro');
			await caixaMensagem(page).click();
			await caixaMensagem(page).type('/');
			await page.waitForTimeout(900);
		},
	},
	'comentario-interno': {
		usuario: 'atendente',
		passos: async (page) => {
			await abrirTicket(page, 'Ana Paula Ribeiro');
			await page.getByRole('checkbox', { name: 'Comentario interno' }).check({ force: true });
			await page.waitForTimeout(300);
			await caixaMensagem(page).click();
			await caixaMensagem(page).type('Cliente relatou LOS vermelha após reinício. Abrir OS para visita técnica.');
			await page.waitForTimeout(400);
		},
		destaque: (page) => page.getByRole('checkbox', { name: 'Comentario interno' }).locator('xpath=ancestor::label[1]'),
	},
	'assinar': {
		usuario: 'atendente',
		passos: async (page) => abrirTicket(page, 'Ana Paula Ribeiro'),
		destaque: (page) => page.getByRole('checkbox', { name: 'Assinar' }).locator('xpath=ancestor::label[1]'),
	},
	'anexar-e-audio': {
		usuario: 'atendente',
		passos: async (page) => abrirTicket(page, 'Ana Paula Ribeiro'),
		destaque: (page) => page.locator('[aria-label="upload"], button[title="upload"], [aria-label="showRecorder"], button[title="showRecorder"]'),
	},
	'busca': {
		usuario: 'atendente',
		passos: async (page) => {
			await abrirTicket(page, 'Ana Paula Ribeiro');
			await page.getByRole('button', { name: 'Busca' }).click();
			await page.waitForTimeout(500);
			await page.getByRole('searchbox').first().fill('boleto');
			await page.waitForTimeout(1500);
		},
		destaque: (page) => page.getByRole('searchbox').first(),
	},
	'filtros-avancados': {
		usuario: 'atendente',
		passos: async (page) => {
			await abrirTicket(page, 'Ana Paula Ribeiro');
			await page.getByRole('button', { name: 'Filtros' }).click();
			await page.waitForTimeout(900);
		},
	},
	'novo-ticket': {
		usuario: 'atendente',
		passos: async (page) => {
			await abrirTicket(page, 'Ana Paula Ribeiro');
			await page.getByRole('button', { name: 'Novo' }).click();
			await page.waitForTimeout(900);
		},
	},
	'detalhes-contato': {
		usuario: 'atendente',
		passos: async (page) => {
			await abrirTicket(page, 'Ana Paula Ribeiro');
			await page.getByRole('button', { name: 'Mostrar detalhes' }).click();
			await page.waitForTimeout(1200);
		},
	},
	'respostas-rapidas-pagina': {
		usuario: 'atendente',
		passos: async (page) => { await menu(page, 'Respostas Rápidas').click(); await page.waitForTimeout(1200); },
	},
	'respostas-rapidas-nova': {
		usuario: 'atendente',
		passos: async (page) => {
			await menu(page, 'Respostas Rápidas').click();
			await page.waitForTimeout(1000);
			await page.getByRole('button', { name: 'Adicionar Resposta Rápida' }).click();
			await page.waitForTimeout(800);
		},
	},
	'contatos': {
		usuario: 'atendente',
		passos: async (page) => { await menu(page, 'Contatos').click(); await page.waitForTimeout(1200); },
	},
	'contato-novo': {
		usuario: 'atendente',
		passos: async (page) => {
			await menu(page, 'Contatos').click();
			await page.waitForTimeout(1000);
			await page.getByRole('button', { name: 'Adicionar Contato' }).click();
			await page.waitForTimeout(800);
		},
	},
	'chat-interno': {
		usuario: 'atendente',
		passos: async (page) => { await menu(page, 'Chat Interno').click(); await page.waitForTimeout(1200); },
	},
	'tickets-internos': {
		usuario: 'atendente',
		passos: async (page) => { await menu(page, 'Tickets internos').click(); await page.waitForTimeout(1200); },
	},
	'dashboard': {
		usuario: 'atendente',
		passos: async (page) => { await menu(page, 'Dashboard').click(); await page.waitForTimeout(1500); },
	},
	'perfil-usuario': {
		usuario: 'atendente',
		passos: async (page) => {
			await menu(page, 'Dashboard').click();
			await page.waitForTimeout(800);
			await page.getByRole('button', { name: 'account of current user' }).click();
			await page.waitForTimeout(600);
		},
		destaque: (page) => page.getByRole('menu'),
	},
	'barra-superior': {
		usuario: 'atendente',
		passos: async (page) => { await menu(page, 'Dashboard').click(); await page.waitForTimeout(800); },
		destaque: (page) => page.getByRole('banner'),
	},

	// ───────────── Administrador ─────────────
	'admin-menu-lateral': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Dashboard').click(); await page.waitForTimeout(800); },
		destaque: (page) => page.getByRole('list').first(),
	},
	'admin-dashboard': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Dashboard').click(); await page.waitForTimeout(1500); },
	},
	'admin-dashboard-periodo': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Dashboard').click(); await page.waitForTimeout(1200); },
		destaque: (page) => page.getByRole('button', { name: 'Hoje' }).locator('xpath=..'),
	},
	'atendimentos-historico': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Atendimentos').click(); await page.waitForTimeout(1500); },
	},
	'atendimentos-filtros': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Atendimentos').click(); await page.waitForTimeout(1200);
			await page.getByRole('button', { name: 'Exibir filtros' }).click(); await page.waitForTimeout(800);
		},
	},
	'atendimentos-gerenciamento': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Atendimentos').click(); await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: 'Gerenciamento' }).click({ force: true }); await page.waitForTimeout(1200);
		},
	},
	'atendimentos-resumo': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Atendimentos').click(); await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: 'Resumo por fila e atendente' }).click({ force: true }); await page.waitForTimeout(1200);
		},
	},
	'monitoramento-atendente': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Monitoramento').click(); await page.waitForTimeout(1500); },
	},
	'monitoramento-fila': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Monitoramento').click(); await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: 'Por fila' }).click(); await page.waitForTimeout(900);
		},
	},
	'auditoria': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Auditoria').click(); await page.waitForTimeout(1500); },
	},
	'avaliacoes': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Avaliações').click(); await page.waitForTimeout(1500); },
	},
	'empresa-operacao': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Empresa').click(); await page.waitForTimeout(1500); },
	},
	'empresa-bloqueados': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Empresa').click(); await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: 'Contatos bloqueados' }).click(); await page.waitForTimeout(800);
		},
	},
	'empresa-horario': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Empresa').click(); await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: 'Horário de atendimento' }).click(); await page.waitForTimeout(800);
		},
	},
	'empresa-feriados': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Empresa').click(); await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: 'Horário de atendimento' }).click(); await page.waitForTimeout(600);
			await page.getByRole('button', { name: 'Cadastrar feriados' }).click(); await page.waitForTimeout(1000);
		},
	},
	'conexoes-lista': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Conexões').click(); await page.waitForTimeout(1500); },
	},
	'conexoes-catalogo': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Conexões').click(); await page.waitForTimeout(1200);
			await page.getByRole('button', { name: 'Adicionar' }).click(); await page.waitForTimeout(1200);
		},
	},
	'conexao-nova-qr': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Conexões').click(); await page.waitForTimeout(1200);
			await page.getByRole('button', { name: 'Adicionar' }).click(); await page.waitForTimeout(1000);
			await page.getByRole('button', { name: 'Nova conexão' }).first().click(); await page.waitForTimeout(1000);
		},
	},
	'conexao-nova-waba': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Conexões').click(); await page.waitForTimeout(1200);
			await page.getByRole('button', { name: 'Adicionar' }).click(); await page.waitForTimeout(1000);
			await page.getByRole('button', { name: 'Nova conexão' }).nth(1).click(); await page.waitForTimeout(1000);
		},
	},
	'conexao-menu': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Conexões').click(); await page.waitForTimeout(1200);
			await page.getByRole('heading', { name: 'Atendimento Principal' }).locator('xpath=following::button[2]').click(); await page.waitForTimeout(500);
		},
		destaque: (page) => page.getByRole('menu'),
	},
	'conexao-editar-webchat': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Conexões').click(); await page.waitForTimeout(1200);
			await page.getByRole('heading', { name: 'Site do provedor' }).locator('xpath=following::button[2]').click(); await page.waitForTimeout(400);
			await page.getByRole('menuitem', { name: 'Visualizar' }).click(); await page.waitForTimeout(1000);
		},
	},
	'conexao-editar-waba': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Conexões').click(); await page.waitForTimeout(1200);
			await page.getByRole('button', { name: 'Configurar' }).first().click(); await page.waitForTimeout(1000);
		},
	},
	'filas-lista': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Filas').click(); await page.waitForTimeout(1500); },
	},
	'fila-nova': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Filas').click(); await page.waitForTimeout(1200);
			await page.getByRole('button', { name: 'Adicionar fila' }).click(); await page.waitForTimeout(900);
		},
	},
	'fila-horario': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Filas').click(); await page.waitForTimeout(1200);
			await page.getByRole('button', { name: 'Adicionar fila' }).click(); await page.waitForTimeout(900);
			await page.locator('[role=dialog] input').first().fill('Suporte noturno');
			await page.getByRole('checkbox', { name: 'Usar horário próprio para esta fila' }).check({ force: true }); await page.waitForTimeout(700);
			await page.locator('[role=dialog]').last().evaluate((el) => { const t = el.querySelector('table'); if (t) t.scrollIntoView(); });
			await page.waitForTimeout(300);
		},
	},
	'usuarios-lista': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Usuários').click(); await page.waitForTimeout(1500); },
	},
	'usuario-novo': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Usuários').click(); await page.waitForTimeout(1200);
			await page.getByRole('button', { name: 'Adicionar usuário' }).click(); await page.waitForTimeout(900);
		},
	},
	'tags-lista': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Tags').click(); await page.waitForTimeout(1500); },
	},
	'tag-nova': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Tags').click(); await page.waitForTimeout(1200);
			await page.getByRole('button', { name: 'Nova tag' }).click(); await page.waitForTimeout(800);
		},
	},
	'assuntos-lista': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Assuntos').click(); await page.waitForTimeout(1500); },
	},
	'assunto-novo': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Assuntos').click(); await page.waitForTimeout(1200);
			await page.getByRole('button', { name: 'Novo assunto' }).click(); await page.waitForTimeout(800);
		},
	},
	'config-geral': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'Configurações').click(); await page.waitForTimeout(1500); },
	},
	'config-integracoes': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Configurações').click(); await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: 'Integrações' }).click(); await page.waitForTimeout(800);
		},
	},
	'config-avaliacoes': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Configurações').click(); await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: 'Avaliações' }).click(); await page.waitForTimeout(800);
		},
	},
	'config-mensagens': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Configurações').click(); await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: 'Mensagens de atendimento' }).click(); await page.waitForTimeout(800);
		},
	},
	'config-tempos': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'Configurações').click(); await page.waitForTimeout(1200);
			await page.getByRole('tab', { name: 'Tempos de espera' }).click(); await page.waitForTimeout(800);
		},
	},
	'api-tools-geral': {
		usuario: 'admin',
		passos: async (page) => { await menu(page, 'API Tools').click(); await page.waitForTimeout(1500); },
	},
	'api-tools-waba': {
		usuario: 'admin',
		passos: async (page) => {
			await menu(page, 'API Tools').click(); await page.waitForTimeout(1200);
			await page.getByText('WABA', { exact: true }).first().click(); await page.waitForTimeout(1200);
		},
	},
};

async function login(context, usuario) {
	const page = await context.newPage();
	const u = USUARIOS[usuario];
	await page.goto(`${BASE}/login`);
	await page.getByLabel('Email').fill(u.email);
	await page.getByLabel('Senha').fill(u.senha);
	await page.locator('button[type=submit]').click();
	await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20000 });
	await page.waitForTimeout(1200);
	// fecha o toast de login e abre o menu lateral
	await page.locator('.Toastify__close-button, [class*=Toastify] button').first().click({ timeout: 2000 }).catch(() => {});
	const drawer = page.getByRole('button', { name: 'open drawer' });
	if (await drawer.isVisible().catch(() => false)) await drawer.click();
	await page.waitForTimeout(400);
	return page;
}

/** Volta a um estado neutro (sem diálogos, no Dashboard, menu aberto) sem perder a sessão. */
async function reiniciar(page) {
	await page.goto(`${BASE}/`);
	await page.waitForTimeout(1200);
	const drawer = page.getByRole('button', { name: 'open drawer' });
	if (await drawer.isVisible().catch(() => false)) await drawer.click();
	await page.waitForTimeout(300);
}

const pedidas = process.argv.slice(2);
const nomes = pedidas.length ? pedidas : Object.keys(CAPTURAS);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
context.setDefaultTimeout(8000);
const paginas = {}; // uma página logada por usuário
let ok = 0, falhas = [];
for (const nome of nomes) {
	const cap = CAPTURAS[nome];
	if (!cap) { console.log(`?? captura desconhecida: ${nome}`); continue; }
	let page;
	try {
		if (!paginas[cap.usuario]) paginas[cap.usuario] = await login(context, cap.usuario);
		page = paginas[cap.usuario];
		await reiniciar(page);
		await cap.passos(page);
		if (cap.destaque) await destacar(cap.destaque(page));
		// fecha avisos (toasts) que poluem a captura
		await page.locator('.Toastify__toast').evaluateAll((els) => els.forEach((e) => e.remove())).catch(() => {});
		await page.waitForTimeout(300);
		await page.screenshot({ path: join(OUT, `${nome}.png`) });
		console.log(`ok  ${nome}`);
		ok++;
	} catch (e) {
		console.log(`ERR ${nome}: ${String(e.message).split('\n')[0]}`);
		falhas.push(nome);
		if (page) await page.screenshot({ path: join(OUT, `_erro-${nome}.png`) }).catch(() => {});
	}
}
await browser.close();
console.log(`\n${ok} capturas ok${falhas.length ? `, falhas: ${falhas.join(', ')}` : ''}`);
process.exit(falhas.length ? 1 : 0);
