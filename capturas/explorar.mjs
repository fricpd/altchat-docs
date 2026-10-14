// Exploração: entra no Altchat local, navega pelo menu lateral e salva a árvore de acessibilidade + screenshot de cada tela.
// Uso: node explorar.mjs ["Atendimento" "Contatos" ...]   (rótulos do menu; "ticket:Ana" abre o atendimento do contato)
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE = process.env.ALTCHAT_URL || 'http://localhost:3099';
const EMAIL = process.env.ALTCHAT_EMAIL || 'carlos@demo.local';
const PASS = process.env.ALTCHAT_PASS || 'Demo@2026';
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'explorar');
mkdirSync(OUT, { recursive: true });

const alvos = process.argv.slice(2).length
	? process.argv.slice(2)
	: ['Dashboard', 'Atendimento', 'ticket:Ana Paula', 'Contatos', 'Respostas Rápidas', 'Chat Interno', 'Tickets internos'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'pt-BR' });
await page.goto(`${BASE}/login`);
await page.getByLabel('Email').fill(EMAIL);
await page.getByLabel('Senha').fill(PASS);
await page.locator('button[type=submit]').click();
await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 15000 });
await page.waitForTimeout(1500);
// abre o menu lateral (fica recolhido por padrão)
const drawerBtn = page.getByRole('button', { name: 'open drawer' });
if (await drawerBtn.isVisible()) await drawerBtn.click();
await page.waitForTimeout(500);

for (const alvo of alvos) {
	if (alvo.startsWith('ticket:')) {
		const nomeContato = alvo.slice(7);
		await page.getByText(nomeContato, { exact: false }).first().click();
	} else {
		await page.getByRole('listitem').filter({ hasText: alvo }).first().click();
	}
	await page.waitForTimeout(2500);
	const nome = alvo.replace(/[^a-zA-Z0-9]+/g, '_').toLowerCase();
	const yaml = await page.locator('body').ariaSnapshot();
	writeFileSync(join(OUT, `${nome}.yaml`), `# ${alvo} -> ${page.url()}\n${yaml}`);
	await page.screenshot({ path: join(OUT, `${nome}.png`) });
	console.log(`${alvo} -> ${page.url()} (${yaml.length} chars)`);
}
await browser.close();
