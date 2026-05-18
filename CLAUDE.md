# TrackLens – Claude Code Briefing

> This document is the **persistent context** for Claude Code.
> It is loaded automatically on startup. Keep it up to date.

---

## What is TrackLens?

A **privacy analysis tool for websites**: the user enters a URL, the backend scans the page with Puppeteer, and the frontend displays detected cookies, trackers, and third-party requests — including a privacy score.

**Primary purpose:** Portfolio/differentiation project for job applications. Live demo + public GitHub repo to showcase in interviews. Not a commercial product.

---

## Tech Stack

| Area | Decision |
|---|---|
| Framework | **Nuxt 4** (fullstack via Nitro server routes) |
| Language | TypeScript |
| Frontend | Vue 3 (Composition API) |
| Styling | Tailwind CSS v4 (included via Nuxt UI) |
| UI Components | **Nuxt UI v3** (free, MIT) |
| Scanning | **Puppeteer** (bundled Chromium, not puppeteer-core) |
| Tracker database | **DuckDuckGo Tracker Radar** |
| Package manager | **npm** |
| Node version | **Node 22 LTS** |
| Deployment (planned) | **Netcup VPS 500 G12** (Nuremberg, Ubuntu 24.04 LTS, Docker + Caddy reverse proxy). Fixed price ~5.35 €/month including IPv4. Hard cost cap — no pay-as-you-go surprises. |
| Database | **None in Sprint 1 & 2.** Potentially Postgres in Sprint 3 (self-hosted on the same VPS via Docker) |
| Docker | **Production only**, not used for local dev |

### Deliberately NOT used — and why

- **No separate NestJS backend** → Nitro server routes are sufficient, saves 6–8h setup, one repo / one deploy / one mental model
- **No Vercel** → Puppeteer on serverless is painful, requires `@sparticuz/chromium` workarounds, and Hobby tier has a 10s function timeout that breaks scans
- **No Fly.io** → pay-as-you-go pricing has no built-in hard cap; for a portfolio project, predictable fixed costs on an owned VPS are preferable, and the "self-hosted on a VPS with Docker + reverse proxy" story is a stronger CV signal
- **No database in Sprint 1/2** → pure request-response cycle, no persistent data needed
- **No Nuxt UI Pro / Tailwind Plus** → free versions are fully sufficient

---

## Sprint Plan

### Sprint 1 – "End-to-End functional" (Weekend 1, ~8–10h)

**Goal:** Runs locally. Ugly but functional.

- [x] Nuxt 4 project setup
- [x] Nuxt UI v3 integrated
- [x] Base structure created (`server/api`, `server/utils`, `types`, `components`)
- [x] Ping endpoint (`/api/ping`) working
- [x] Landing page (`app/pages/index.vue`) with Nuxt UI renders
- [x] Git repo initialized + pushed to GitHub (public)
- [x] Puppeteer integration (`server/api/analyze.post.ts` + `server/utils/puppeteer.ts`)
- [x] URL input component in frontend (`app/components/UrlInput.vue`)
- [x] Raw JSON display of scan results
- [x] Shared TypeScript types (`types/analysis.ts`)

### Sprint 2 – "Polish + Tracker Detection" (Weekend 2, ~12h)

- [x] Integrate DuckDuckGo Tracker Radar list
- [x] Privacy score algorithm (simple, transparent)
- [ ] UI redesign with Tailwind + dark mode + animations
- [ ] Mobile-first responsive layout
- [ ] Donut chart for tracker categories
- [ ] Live deploy to Netcup VPS (Docker + Caddy reverse proxy on `tracklens.<domain>`)
- [ ] README with screenshots/GIF + live demo link

### Sprint 3 – "AI + Tests" (optional, after HR interview)

- [ ] Claude API for tracker explanations
- [ ] Unit tests for score algorithm
- [ ] Postgres + scan history
- [ ] Share privacy report via direct link (requires Postgres)
- [ ] Export privacy report (JSON / PDF)

---

## Project Structure

```
tracklens/
├── CLAUDE.md
├── README.md
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── app/
│   ├── app.vue                   ← UApp wrapper + NuxtPage
│   ├── app.config.ts             ← Nuxt UI theme (primary color, neutral)
│   ├── assets/
│   │   └── css/
│   │       └── main.css          ← Tailwind v4 + Nuxt UI imports + body gradient
│   ├── components/
│   │   ├── AboutModal.vue        ← about modal (version, author)
│   │   ├── ScanResult.vue        ← tabbed result view (trackers, cookies, other)
│   │   └── UrlInput.vue          ← URL input with client-side validation
│   ├── pages/
│   │   └── index.vue             ← landing page with scan logic
│   └── types/
│       └── analysis.ts           ← shared types (use ~/types/analysis everywhere)
├── server/
│   ├── api/
│   │   ├── ping.get.ts           ← smoke test endpoint
│   │   └── analyze.post.ts       ← scan endpoint (thin, delegates to utils)
│   └── utils/
│       ├── errors.ts             ← SiteNotFoundError + detection helper
│       ├── puppeteer.ts          ← browser launch, cookie + request collection
│       ├── tracker-detection.ts  ← DuckDuckGo Tracker Radar lookup
│       └── privacy-score.ts      ← TODO: Sprint 2
```

---

## Current Status (as of May 18, 2026)

**Done:**
- Project initialized with Nuxt 4 + Nuxt UI v3
- Dependencies: `@nuxt/ui`, `puppeteer`, `@nuxt/eslint`, `@types/node`
- `nuxt.config.ts` configured (Nuxt UI module, CSS path, strict TypeScript)
- `app/assets/css/main.css` with Tailwind v4 + Nuxt UI imports + dark gradient background
- `app/app.config.ts` with primary color `blue` and neutral `slate`
- `app/app.vue` with `<UApp>` wrapper
- `app/pages/index.vue` with landing page + scan logic + raw JSON output
- `app/components/UrlInput.vue` with URL validation and loading state
- `server/api/ping.get.ts` as API smoke test
- `server/api/analyze.post.ts` — URL validation + SSRF protection + Puppeteer call
- `server/utils/puppeteer.ts` — headless scan, cookies + third-party requests
- `types/analysis.ts` — shared TypeScript types
- Git initialized, pushed to GitHub (public repo)
- Deployment target chosen: Netcup VPS 500 G12 (Nuremberg, 2 vCores, 4 GB DDR5 ECC, 128 GB NVMe), fixed ~5.35 €/month with IPv4

**Verified:**
- `npm run dev` starts cleanly on `localhost:3000`
- Landing page renders with dark gradient background
- `/api/ping` returns JSON with status + timestamp
- Puppeteer endpoint implemented and ready to test

---

## Next Steps

Sprint 1 is complete. Up next is **Sprint 2**:

1. Integrate DuckDuckGo Tracker Radar (`server/utils/tracker-detection.ts`)
2. Privacy score algorithm (`server/utils/privacy-score.ts`)
3. Proper result UI (replace raw JSON `<pre>` block with cards/charts)
4. Dockerfile for production build (multi-stage, system Chromium for Puppeteer)
5. Netcup VPS provisioning + Docker + Caddy reverse proxy setup + first deploy

---

## Deployment Details (Netcup VPS)

For the deployment phase at the end of Sprint 2:

- **Provider:** Netcup (German, EU-hosted — thematically fitting for a privacy tool)
- **Plan:** VPS 500 G12 — 2 vCores, 4 GB DDR5 ECC RAM, 128 GB NVMe, AMD EPYC 9645
- **Location:** Nuremberg (DE)
- **OS:** Ubuntu 24.04 LTS
- **Contract:** 12 months (4.85 €/month base + 0.50 €/month IPv4 = **5.35 €/month, hard-capped**)
- **Stack on the server:** Docker + Docker Compose + Caddy (automatic HTTPS via Let's Encrypt)
- **Deployment flow:** GitHub Actions builds image on push to `main`, SSH deploy to VPS, `docker compose up -d`
- **Subdomain:** `tracklens.<domain>` (separate from existing Netcup Webhosting projects)
- **Note:** Existing Netcup Webhosting Expert M (Vue.js static + PHP sites) stays untouched on shared hosting — VPS is a new, isolated environment

---

## Conventions & Style

- **Language in code:** English (variables, comments, commits)
- **Language in conversation:** German (user preference)
- **Language in docs:** English
- **Commit style:** Conventional Commits (`feat:`, `chore:`, `fix:`, `docs:`)
- **Type safety:** Strict. No `any`s if avoidable. Shared types in `types/`.
- **Server routes:** Keep thin, logic goes in `server/utils/`
- **Components:** Composition API with `<script setup lang="ts">`
- **Indentation:** Tabs (do not switch to spaces)
- **Imports:** Prefer auto-imports for h3 helpers and Nuxt composables. Explicit imports for types.
- **Changelog:** Significant changes (new features, breaking changes, notable fixes) must be added to `CHANGELOG.md`. Entries are sorted by version number, newest first.

---

## Developer Context

- Full-stack developer focused on Vue 3 / TypeScript
- ~4 years of professional experience (digital agency in Essen)
- Currently in job application phase — deliverability > perfection
- TrackLens must be presentable before the HR interview (approx. end of May / early June 2026)
- Prefers clear explanations, wants to understand rather than just copy-paste

---

## Key Reminders

- **No over-engineering.** If something simpler achieves the goal, go simpler.
- **Pragmatism beats idealism.** Nuxt fullstack over microservices, no DB over premature Postgres.
- **Live-demo readiness is king.** One fewer feature but stable beats three half-baked features.
- **README is part of the product.** Recruiters read it alongside the code.