<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# website/

Marketing site and docs for Toppings. Read the root `AGENTS.md` first; its rules apply here too.

## Shape

- Next.js App Router, static export (`output: "export"`), deployed to Cloudflare Pages from `out/` by `.github/workflows/deploy-website.yml`.
- Package manager is Bun. Verify with `bun run check` (typecheck + lint) and `bun run build`.
- Runtime dependencies are `next`, `react`, `react-dom` only. No CSS framework, no animation library. Add a dependency only when a few lines of platform code cannot do the job, and say why.
- Styling is plain CSS: tokens and base styles in `app/globals.css`, page styles next to the page that uses them.

## Content

- `lib/site.ts` is the single source for copy that appears in more than one place: URLs, version, features, default shortcuts. Page-only copy stays in the page.
- `site.version` mirrors `web-ext/lib/version.ts`. The default shortcuts mirror the key registries in `web-ext/features/*/keys.ts`, and the seek amounts mirror each feature's `settings.ts`. Update them on release; nothing imports across packages.
- `/greetings` and `/farewell` are opened by the extension on install and uninstall. Keep those routes.

## Home page

`app/page.tsx` is a single viewport with nothing below it. Don't add sections; a new claim goes in the rail, the deck, or the docs.
