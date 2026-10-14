// Sonda: abre o ticket da Ana e imprime a estrutura das partes que precisam de seletor nas capturas.
import { chromium } from 'playwright';

const BASE = 'http://localhost:3099';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
await page.goto(`${BASE}/login`);
await page.getByLabel('Email').fill('carlos@demo.local');
await page.getByLabel('Senha').fill('Demo@2026');
await page.locator('button[type=submit]').click();
await page.waitForURL((u) => !u.pathname.includes('/login'));
await page.waitForTimeout(1500);
await page.getByRole('button', { name: 'open drawer' }).click();
await page.getByRole('listitem').filter({ hasText: 'Atendimento' }).first().click();
await page.waitForTimeout(1500);
await page.getByText('Ana Paula Ribeiro').first().click();
await page.waitForTimeout(2000);

const snap = async (titulo, loc) => {
	console.log(`\n##### ${titulo}`);
	console.log(await loc.ariaSnapshot());
};

// 1. cabeçalho do ticket: html resumido
const header = page.getByText('Atribuido a:').first();
const html = await header.evaluate((el) => {
	let n = el;
	for (let i = 0; i < 6 && n.parentElement; i++) n = n.parentElement;
	const clone = n.cloneNode(true);
	clone.querySelectorAll('svg path').forEach((p) => p.remove());
	return clone.outerHTML.replace(/\s+/g, ' ').slice(0, 3500);
});
console.log('##### HEADER HTML\n' + html);

// botões do cabeçalho (ordem) com classes e aria
const btns = await page.locator('main button').evaluateAll((els) =>
	els.map((b, i) => `${i}: aria="${b.getAttribute('aria-label') || ''}" title="${b.getAttribute('title') || ''}" cls="${(b.className || '').toString().slice(0, 80)}" text="${(b.textContent || '').trim().slice(0, 30)}"`)
);
console.log('##### BOTÕES main\n' + btns.join('\n'));

// 2. menu ⋮
const headerBtns = page.locator('main button').filter({ hasNot: page.locator('text=/./') });
const n = await page.locator('main button').count();
console.log('total buttons', n);
// tenta achar o botão de menu pelo ícone MoreVert: procura svg com <path d="M12 8c1.1...
const more = page.locator('main button:has(svg)').filter({ has: page.locator('path[d^="M12 8c1.1"]') }).first();
if (await more.count()) {
	await more.click();
	await page.waitForTimeout(500);
	await snap('MENU ⋮', page.locator('[role=menu], .MuiPopover-root').first());
	await page.keyboard.press('Escape');
	await page.waitForTimeout(400);
}

// 3. Busca / Filtros / Novo
await page.getByRole('button', { name: 'Busca' }).click();
await page.waitForTimeout(500);
await snap('BUSCA', page.locator('main'));
await page.getByRole('button', { name: 'Filtros' }).click();
await page.waitForTimeout(800);
await snap('FILTROS', page.locator('[role=dialog], [role=presentation]').last());
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
await page.getByRole('button', { name: 'Novo' }).click();
await page.waitForTimeout(800);
await snap('NOVO', page.locator('[role=dialog]').last());
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

// 4. "/" respostas rápidas
const caixa = page.getByRole('textbox', { name: /Digite uma mensagem/ });
await caixa.click();
await caixa.type('/');
await page.waitForTimeout(800);
await snap('SLASH', page.locator('body'));
await caixa.fill('');

// 5. Mostrar detalhes
await page.getByRole('button', { name: 'Mostrar detalhes' }).click();
await page.waitForTimeout(1000);
await snap('DETALHES', page.locator('main'));

await browser.close();
