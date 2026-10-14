# Central de Ajuda do Altchat

Documentação pública do Altchat em https://docs.altchat.com.br, gerada com [Astro Starlight](https://starlight.astro.build).

- `site/` — o site (conteúdo em `site/src/content/docs`, em Markdown/MDX).
- `capturas/` — roteiro Playwright que regenera as capturas de tela a partir do Altchat de teste local, e o seed de dados fictícios.
- `PROJETO.md` — a proposta original e as decisões.

## Editar

```bash
cd site
npm install
npm run dev      # pré-visualização em http://localhost:4321
npm run build    # gera site/dist
```

## Publicar

Todo push na branch `main` que altere `site/` dispara o workflow em `.github/workflows/deploy.yml`, que faz o build e publica no GitHub Pages.
