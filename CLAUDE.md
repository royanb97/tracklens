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
| Deployment (planned) | **Fly.io** via Docker (single container) |
| Database | **None in Sprint 1 & 2.** Potentially Postgres (managed on Fly.io) later |
| Docker | **Production only**, not used for local dev |

### Deliberately NOT used — and why

- **No separate NestJS backend** → Nitro server routes are sufficient, saves 6–8h setup, one repo / one deploy / one mental model
- **No Vercel** → Puppeteer on serverless is painful, Fly.io with Docker is cleaner
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
- [ ] Privacy score algorithm (simple, transparent)
- [ ] UI redesign with Tailwind + dark mode + animations
- [ ] Mobile-first responsive layout
- [ ] Donut chart for tracker categories
- [ ] Live deploy to Fly.io via Docker
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

## Current Status (as of May 15, 2026)

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
4. Dockerfile for Fly.io deployment

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
