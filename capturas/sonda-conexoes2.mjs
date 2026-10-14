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
await page.getByRole('listitem').filter({ hasText: 'Conexões' }).first().click();
await page.waitForTimeout(1200);
// menu ⋮ do cartão
const card = page.getByRole('heading', { name: 'Atendimento Principal' });
await card.locator('xpath=following::button[2]').click();
await page.waitForTimeout(500);
console.log('##### MENU CARTAO\n' + await page.locator('[role=menu], [role=presentation]').last().ariaSnapshot());
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
// Nova conexão WhatsApp
await page.getByRole('button', { name: 'Adicionar' }).click();
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Nova conexão' }).click();
await page.waitForTimeout(1000);
console.log('##### MODAL WHATSAPP QR\n' + filtra(await page.locator('[role=dialog]').last().ariaSnapshot(), 150));
await browser.close();
