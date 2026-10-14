import { chromium } from 'playwright';
const B = 'http://localhost:4321';
const browser = await chromium.launch();
const shots = [
  ['home-claro', '/', 'light', 1440, 900],
  ['home-escuro', '/', 'dark', 1440, 900],
  ['guia-claro', '/atendentes/aceitar-responder-encerrar/', 'light', 1440, 900],
  ['guia-escuro', '/atendentes/transferir/', 'dark', 1440, 900],
  ['home-celular', '/', 'light', 390, 844],
  ['guia-celular', '/atendentes/respostas-rapidas/', 'light', 390, 844],
];
for (const [nome, rota, tema, w, h] of shots) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: tema, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  await page.goto(B + rota);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `previa/${nome}.png`, fullPage: nome.startsWith('guia') && w > 400 });
  console.log('ok', nome);
  await ctx.close();
}
await browser.close();
