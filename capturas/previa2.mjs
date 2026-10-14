import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('http://localhost:4321/atendentes/aceitar-responder-encerrar/');
await page.waitForTimeout(800);
// rola até o fim para disparar o carregamento preguiçoso
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
await page.waitForTimeout(1500);
const imgs = await page.$$eval('main img', els => els.map(i => ({ src: i.getAttribute('src')?.slice(0, 60), ok: i.complete && i.naturalWidth > 0, lazy: i.loading, w: i.naturalWidth })));
console.log(JSON.stringify(imgs, null, 1));
await page.screenshot({ path: 'previa/guia-claro.png', fullPage: true });
await browser.close();
