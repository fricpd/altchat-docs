// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightImageZoom from 'starlight-image-zoom';
import starlightLlmsTxt from 'starlight-llms-txt';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.altchat.com.br',
	integrations: [
		mermaid({
			theme: 'base',
			autoTheme: false,
			mermaidConfig: {
				themeVariables: {
					primaryColor: '#d9f0ec',
					primaryBorderColor: '#176b63',
					primaryTextColor: '#171d1c',
					secondaryColor: '#f7faf9',
					tertiaryColor: '#fff7e8',
					lineColor: '#5a6967',
					fontFamily: 'Inter, system-ui, sans-serif',
					fontSize: '15px',
				},
				flowchart: { padding: 12, nodeSpacing: 40, rankSpacing: 50 },
			},
		}),
		starlight({
			title: 'Altchat',
			description:
				'Central de Ajuda do Altchat: tudo sobre a plataforma de atendimento, do primeiro atendimento à API.',
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
				replacesTitle: true,
			},
			favicon: '/favicon.svg',
			defaultLocale: 'root',
			locales: {
				root: { label: 'Português (Brasil)', lang: 'pt-BR' },
				en: { label: 'English', lang: 'en' },
				es: { label: 'Español', lang: 'es' },
			},
			customCss: ['./src/styles/custom.css'],
			plugins: [starlightImageZoom(), starlightLlmsTxt()],
			lastUpdated: true,
			pagination: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			social: [
				{ icon: 'external', label: 'Acessar o Altchat', href: 'https://app.altchat.com.br' },
			],
			sidebar: [
				{
					label: 'Comece aqui',
					translations: { en: 'Start here', es: 'Empieza aquí' },
					items: [{ autogenerate: { directory: 'comece-aqui' } }],
				},
				{
					label: 'Para atendentes',
					translations: { en: 'For agents', es: 'Para agentes' },
					items: [{ autogenerate: { directory: 'atendentes' } }],
				},
				{
					label: 'Para administradores',
					translations: { en: 'For administrators', es: 'Para administradores' },
					items: [
						'administradores',
						'administradores/dashboard',
						'administradores/monitoramento',
						'administradores/atendimentos',
						'administradores/auditoria',
						'administradores/avaliacoes',
						'administradores/filas',
						'administradores/usuarios',
						'administradores/empresa',
						{
							label: 'Conexões',
							translations: { en: 'Connections', es: 'Conexiones' },
							items: [{ autogenerate: { directory: 'administradores/conexoes' } }],
						},
						{
							label: 'Configurações',
							translations: { en: 'Settings', es: 'Configuración' },
							items: [{ autogenerate: { directory: 'administradores/configuracoes' } }],
						},
						'administradores/api-tools',
						'administradores/tags-e-assuntos',
						'administradores/ramais-e-chamadas',
					],
					collapsed: true,
				},
				{
					label: 'Integrações e API',
					translations: { en: 'Integrations and API', es: 'Integraciones y API' },
					items: [{ autogenerate: { directory: 'integracoes' } }],
					collapsed: true,
				},
				{
					label: 'Solução de problemas',
					translations: { en: 'Troubleshooting', es: 'Solución de problemas' },
					items: [{ autogenerate: { directory: 'problemas' } }],
					collapsed: true,
				},
				{
					label: 'Novidades',
					translations: { en: "What's new", es: 'Novedades' },
					link: '/novidades/',
				},
			],
		}),
	],
});
