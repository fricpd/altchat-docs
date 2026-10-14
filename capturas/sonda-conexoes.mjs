import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
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

await page.getByRole('listitem').filter({ hasText: 'Conexões' }).first().click();
await page.waitForTimeout(1200);
await page.getByRole('button', { name: 'Adicionar' }).click();
await page.waitForTimeout(1500);
const y = await page.locator('body').ariaSnapshot();
writeFileSync(new URL('./explorar/admin-conexao-nova-body.yaml', import.meta.url), y);
console.log('##### NOVA CONEXAO (body)\n' + filtra(y));
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

const btns = await page.locator('main button').evaluateAll((els) => els.map((b, i) => `${i}: "${(b.getAttribute('aria-label') || b.getAttribute('title') || b.textContent || '').trim().slice(0, 40)}"`));
console.log('##### BOTOES CONEXOES\n' + btns.join('\n'));

await page.getByRole('listitem').filter({ hasText: 'Atendimentos' }).first().click();
await page.waitForTimeout(1200);
await page.getByRole('tab', { name: 'Gerenciamento' }).click({ force: true }).catch((e) => console.log('tab err', e.message.split('\n')[0]));
await page.waitForTimeout(1200);
console.log('##### GERENCIAMENTO\n' + filtra(await page.locator('main').ariaSnapshot(), 60));
await browser.close();
