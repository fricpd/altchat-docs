import { chromium } from 'playwright';
const BASE = 'http://localhost:3099';
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
const filtra = (y, n = 120) => y.split('\n').filter((l) => !/^\s+- (cell|columnheader)/.test(l)).slice(0, n).join('\n');
const menu = (r) => page.getByRole('listitem').filter({ hasText: r }).first();
const dlg = () => page.locator('[role=dialog]').last();
const tenta = async (nome, fn) => { try { await fn(); } catch (e) { console.log(`ERR ${nome}: ${String(e.message).split('\n')[0]}`); } await page.keyboard.press('Escape'); await page.waitForTimeout(400); };

await menu('Conexões').click(); await page.waitForTimeout(1200);
await tenta('catalogo', async () => {
	await page.getByRole('button', { name: 'Adicionar' }).click(); await page.waitForTimeout(1000);
	const novas = page.getByRole('button', { name: 'Nova conexão' });
	console.log('botoes Nova conexão:', await novas.count());
	for (const [i, nome] of [[1, 'WABA'], [2, 'WEBCHAT'], [3, 'INSTAGRAM'], [4, 'MESSENGER']]) {
		await novas.nth(i).click(); await page.waitForTimeout(900);
		console.log(`##### MODAL ${nome}\n` + filtra(await dlg().ariaSnapshot(), 90));
		await page.keyboard.press('Escape'); await page.waitForTimeout(400);
	}
});
await menu('Conexões').click(); await page.waitForTimeout(1200);
await tenta('visualizar', async () => {
	await page.getByRole('heading', { name: 'Site do provedor' }).locator('xpath=following::button[2]').click(); await page.waitForTimeout(400);
	await page.getByRole('menuitem', { name: 'Visualizar' }).click(); await page.waitForTimeout(900);
	console.log('##### VISUALIZAR WEBCHAT\n' + filtra(await dlg().ariaSnapshot(), 80));
});
await tenta('configurar-waba', async () => {
	await page.getByRole('button', { name: 'Configurar' }).first().click(); await page.waitForTimeout(900);
	console.log('##### CONFIGURAR WABA\n' + filtra(await dlg().ariaSnapshot(), 80));
});
await menu('Empresa').click(); await page.waitForTimeout(1000);
await tenta('bloqueados', async () => {
	await page.getByRole('tab', { name: 'Contatos bloqueados' }).click(); await page.waitForTimeout(700);
	console.log('##### BLOQUEADOS\n' + filtra(await page.locator('main').ariaSnapshot(), 40));
});
await tenta('feriados', async () => {
	await page.getByRole('tab', { name: 'Horário de atendimento' }).click(); await page.waitForTimeout(500);
	await page.getByRole('button', { name: 'Cadastrar feriados' }).click(); await page.waitForTimeout(900);
	console.log('##### FERIADOS\n' + filtra(await page.locator('[role=dialog], main').last().ariaSnapshot(), 40));
});
await browser.close();
