// Gera um rascunho da página "Novidades" a partir do histórico de commits do Altchat.
// Uso: node novidades.mjs [--desde=2026-08-01] [--repo=C:/Projetos/claude/Altchat_rc27]
// Saída: novidades-rascunho.md (revisar à mão antes de copiar para site/src/content/docs/novidades.mdx)
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) || `--${n}=${d}`).split('=')[1];
const repo = arg('repo', 'C:/Projetos/claude/Altchat_rc27');
const desde = arg('desde', '2026-08-01');

const linhas = execFileSync('git', ['-C', repo, 'log', `--since=${desde}`, '--date=short', '--no-merges', '--format=%ad|%s'], { encoding: 'utf8' })
	.split('\n').filter(Boolean);

const RUIDO = /^(wip|merge|chore|ci|build|test|refactor|style|docs?)(\(|:|\s)/i;
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const AREA = [
	[/waba|gupshup|meta|template|cloud api/i, 'API oficial'],
	[/baileys|qr|whaileys|wwebjs|sess[aã]o/i, 'WhatsApp QR'],
	[/webchat|widget|fab\.js|handoff|app/i, 'WebChat'],
	[/n8n|typebot|automa|bot/i, 'Chatbot'],
	[/fila|queue/i, 'Filas'],
	[/ticket|atendimento|transfer|tag|assunto|subject/i, 'Atendimento'],
	[/dashboard|monitor|audit|rating|avalia|relat/i, 'Supervisão'],
	[/user|usu[aá]rio|permiss|perfil|login|senha/i, 'Usuários'],
	[/setting|config|timeout|mensagem/i, 'Configurações'],
	[/chat interno|internal/i, 'Chat interno'],
	[/contact|contato|lid/i, 'Contatos'],
];

const porMes = new Map();
for (const l of linhas) {
	const [data, ...resto] = l.split('|');
	const assunto = resto.join('|').trim();
	if (RUIDO.test(assunto)) continue;
	const [ano, mes] = data.split('-');
	const chave = `${ano}-${mes}`;
	const area = (AREA.find(([re]) => re.test(assunto)) || [null, 'Geral'])[1];
	if (!porMes.has(chave)) porMes.set(chave, []);
	porMes.get(chave).push({ data, area, assunto: assunto.replace(/^(feat|fix|perf)(\([^)]*\))?:\s*/i, '') });
}

let md = `<!-- Rascunho gerado em ${new Date().toISOString().slice(0, 10)} a partir de ${linhas.length} commits desde ${desde}. Revise, agrupe e traduza antes de publicar. -->\n\n`;
for (const [chave, itens] of [...porMes.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))) {
	const [ano, mes] = chave.split('-');
	md += `## ${MESES[Number(mes) - 1][0].toUpperCase() + MESES[Number(mes) - 1].slice(1)} de ${ano}\n\n`;
	const porArea = new Map();
	for (const i of itens) { if (!porArea.has(i.area)) porArea.set(i.area, []); porArea.get(i.area).push(i); }
	for (const [area, lista] of porArea) {
		for (const i of lista) md += `- <Badge text="${area}" variant="success" /> ${i.assunto} <!-- ${i.data} -->\n`;
	}
	md += '\n';
}
writeFileSync(new URL('./novidades-rascunho.md', import.meta.url), md);
console.log(`${linhas.length} commits lidos, ${[...porMes.values()].flat().length} itens em ${porMes.size} meses → novidades-rascunho.md`);
