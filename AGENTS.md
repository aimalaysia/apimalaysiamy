# Summary

A fast-moving project — always read this before making changes.

## Project
- `D:\myapi` — API Directory for Southeast Asia (MyAPI / apimalaysiamy)  
- Tech: Vite + React + TypeScript client, Express + better-sqlite3 + Drizzle ORM server  
- Hosted on Render (Free) at `https://apimalaysiamy.onrender.com`  
- Custom domain: `apimalaysia.my` (not yet active)  
- Upstream data source: PasarAPI (pasardana.id)

## Architecture
- Monorepo with `client/` (Vite SPA) and `server/` (Express + SQLite)  
- Build: client → `dist/`, server → `dist/`, server `seed.ts` runs `scripts/ingest.ts` at startup  
- ingest.ts fetches from PasarAPI, transforms to match DB schema, upserts by slug  
- Single-file SQLite DB at `server/data/myapi.db` (auto-created by `connection.ts`)  
- Search via `/api/search` with cursor-based pagination  
- Detail panel (`/:slug` route) opens in the same page via URL replaceState  
- SEO routes: `robots.txt`, `sitemap.xml` (dynamic), `/api/:slug` HTML shell with OG/Twitter/JSON-LD

## Key Decisions
- `pnpm` is the package manager
- Auto-ingest from PasarAPI on every server start  
- Categories are dynamically built from DB data, not hardcoded  
- Search endpoint uses Drizzle `sql`` COUNT(*) ``` for count (not `sqlite.raw`)  
- Filter booleans use `isNotNull()` standalone function, not column method  
- `free` overrides `pricing`, `noAuth` overrides `auth` via `else if`  
- Country filter is dynamic via `/api/countries` with flag emojis  
- GitHub Actions for CI not set up (Render handles deploy via git push)  
- Secrets: Render env stores `SESSION_SECRET` (dummy value in `.env` for local dev)

## Gotchas
- Running server locally on Windows fails: `better-sqlite3` needs VS C++ build tools  
- Deploy happens automatically via Render GitHub integration on push to `main`  
- `git push` may need inline PAT in URL if credential helper fails  
- ingest.ts transforms PasarAPI fields: `kategori` array → `category.text`, `base_url` → `baseUrl`  
- Drizzle ORM on `better-sqlite3` doesn't support `json` mode — use `text` mode with JSON.stringify/parse

## Staged but uncommitted
_Nothing currently staged_

## Custom deployment instructions
- Render picks up pushes to `main` automatically  
- If auto-deploy fails, go to Render Dashboard → `srv-d93lg8flk1mc739gcc5g` → Manual Deploy  
- `render.yaml` defines build command: `pnpm install && pnpm run build`  
- Start command: `pnpm run start`  
- root `package.json` build/start scripts orchestrate client + server + seed  
- After deploy, verify: `/api/search?working=true&testable=true` returns data

## Key Commands
- `pnpm run dev:client` — Vite dev server (port 5173)  
- `pnpm run dev:server` — Node watch (port 3001)  
- `pnpm run build` — Full build (client + server)  
- `pnpm run start` — Production start (compiled server)  
- `pnpm run seed` — Run DB seeding/ingestion only
