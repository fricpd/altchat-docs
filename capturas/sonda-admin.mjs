// Sonda das telas de administração: abre modais e abas e salva a árvore de acessibilidade de cada um.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = 'http://localhost:3099';
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'explorar');
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
page.setDefaultTimeout(6000);
await page.goto(`${BASE}/login`);
await page.getByLabel('Email').fill('admin@demo.local');
await page.getByLabel('Senha').fill('Demo@2026');
await page.locator('button[type=submit]').click();
await page.waitForURL((u) => !u.pathname.includes('/login'));
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'open drawer' }).click().catch(() => {});

const menu = (rotulo) => page.getByRole('listitem').filter({ hasText: rotulo }).first();
const salvar = async (nome, loc) => {
	const yaml = await loc.ariaSnapshot();
	writeFileSync(join(OUT, `admin-${nome}.yaml`), yaml);
	console.log(`ok ${nome} (${yaml.length})`);
};
const dialogo = () => page.locator('[role=dialog]').last();
const fechar = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(400); };
const tenta = async (nome, fn) => { try { await fn(); } catch (e) { console.log(`ERR ${nome}: ${String(e.message).split('\n')[0]}`); await fechar(); } };

// Conexões: modal de nova conexão por tipo
await menu('Conexões').click(); await page.waitForTimeout(1000);
await tenta('conexao-nova', async () => {
	await page.getByRole('button', { name: 'Adicionar' }).click(); await page.waitForTimeout(800);
	await salvar('conexao-nova', dialogo());
	const combo = dialogo().getByRole('combobox').first();
	for (const tipo of ['WABA', 'WebChat', 'Instagram', 'Messenger']) {
		await combo.click(); await page.waitForTimeout(300);
		await page.getByRole('option', { name: new RegExp(tipo, 'i') }).first().click(); await page.waitForTimeout(500);
		await salvar(`conexao-nova-${tipo.toLowerCase()}`, dialogo());
	}
	await fechar();
});
await tenta('conexao-menu', async () => {
	// menu ⋮ do primeiro cartão
	const card = page.getByRole('heading', { name: 'Atendimento Principal' });
	const btn = card.locator('xpath=following::button[2]');
	await btn.click(); await page.waitForTimeout(500);
	await salvar('conexao-menu', page.locator('[role=menu]').last());
	await fechar();
});
await tenta('conexao-editar', async () => {
	await page.getByRole('heading', { name: 'WhatsApp Oficial (WABA)' }).locator('xpath=following::button[1]').click(); await page.waitForTimeout(800);
	await salvar('conexao-editar-waba', dialogo());
	await fechar();
});
await tenta('conexoes-filtros', async () => {
	await page.getByRole('button', { name: 'Filtros' }).click(); await page.waitForTimeout(500);
	await salvar('conexoes-filtros', page.locator('[role=dialog], [role=presentation], [role=menu]').last());
	await fechar();
});

// Filas
await menu('Filas').click(); await page.waitForTimeout(1000);
await tenta('fila-nova', async () => {
	await page.getByRole('button', { name: 'Adicionar fila' }).click(); await page.waitForTimeout(800);
	await salvar('fila-nova', dialogo());
	await fechar();
});

// Usuários
await menu('Usuários').click(); await page.waitForTimeout(1000);
await tenta('usuario-novo', async () => {
	await page.getByRole('button', { name: 'Adicionar usuário' }).click(); await page.waitForTimeout(800);
	await salvar('usuario-novo', dialogo());
	await fechar();
});

// Empresa: abas
await menu('Empresa').click(); await page.waitForTimeout(1000);
for (const aba of ['Contatos bloqueados', 'Horário de atendimento']) {
	await tenta(`empresa-${aba}`, async () => {
		await page.getByRole('tab', { name: aba }).click(); await page.waitForTimeout(700);
		await salvar(`empresa-${aba.toLowerCase().replace(/[^a-z]+/g, '-')}`, page.locator('main'));
	});
}

// Configurações: abas
await menu('Configurações').click(); await page.waitForTimeout(1000);
for (const aba of ['Integrações', 'Avaliações', 'Mensagens de atendimento', 'Tempos de espera']) {
	await tenta(`config-${aba}`, async () => {
		await page.getByRole('tab', { name: aba }).click(); await page.waitForTimeout(700);
		await salvar(`config-${aba.toLowerCase().replace(/[^a-z]+/g, '-')}`, page.locator('main'));
	});
}

// Atendimentos: abas e filtros
await menu('Atendimentos').click(); await page.waitForTimeout(1000);
await tenta('atendimentos-filtros', async () => {
	await page.getByRole('button', { name: 'Exibir filtros' }).click(); await page.waitForTimeout(600);
	await salvar('atendimentos-filtros', page.locator('main'));
});
for (const aba of ['Gerenciamento', 'Resumo por fila e atendente']) {
	await tenta(`atendimentos-${aba}`, async () => {
		await page.getByRole('tab', { name: aba }).click(); await page.waitForTimeout(900);
		await salvar(`atendimentos-${aba.toLowerCase().replace(/[^a-z]+/g, '-')}`, page.locator('main'));
	});
}

// Monitoramento por fila
await menu('Monitoramento').click(); await page.waitForTimeout(1000);
await tenta('monitoramento-fila', async () => {
	await page.getByRole('tab', { name: 'Por fila' }).click(); await page.waitForTimeout(700);
	await salvar('monitoramento-por-fila', page.locator('main'));
});

// Tags / Assuntos / API Tools
await menu('Tags').click(); await page.waitForTimeout(800);
await tenta('tag-nova', async () => { await page.getByRole('button', { name: 'Nova tag' }).click(); await page.waitForTimeout(600); await salvar('tag-nova', dialogo()); await fechar(); });
await menu('Assuntos').click(); await page.waitForTimeout(800);
await tenta('assunto-novo', async () => { await page.getByRole('button', { name: 'Novo assunto' }).click(); await page.waitForTimeout(600); await salvar('assunto-novo', dialogo()); await fechar(); });
await menu('API Tools').click(); await page.waitForTimeout(800);
await tenta('api-tools', async () => {
	await salvar('api-tools-geral', page.locator('main'));
	const tabs = page.getByRole('tab');
	const n = await tabs.count();
	for (let i = 0; i < n; i++) { await tabs.nth(i).click(); await page.waitForTimeout(600); await salvar(`api-tools-aba${i}`, page.locator('main')); }
});

// Dashboard do admin (filtros extras?)
await menu('Dashboard').click(); await page.waitForTimeout(1200);
await salvar('dashboard-admin', page.locator('main'));

await browser.close();
