# TrackLens – Claude Code Briefing

> Dieses Dokument ist der **persistente Kontext** für Claude Code.
> Es wird beim Start automatisch eingelesen. Bitte hier aktuell halten.

---

## Was ist TrackLens?

Ein **Privacy-Analyse-Tool für Websites**: User gibt eine URL ein, Backend scannt die Seite mit Puppeteer, Frontend zeigt erkannte Cookies, Tracker und Third-Party-Requests an – inklusive Privacy-Score.

**Primärer Zweck:** Portfolio-/Differenzierungs-Projekt für Bewerbungen. Live-Demo + öffentliches GitHub-Repo, das in Interviews vorzeigbar ist. Kein kommerzielles Produkt.

---

## Tech Stack (final entschieden)

| Bereich | Entscheidung |
|---|---|
| Framework | **Nuxt 3** (Fullstack via Nitro Server Routes) |
| Sprache | TypeScript |
| Frontend | Vue 3 (Composition API) |
| Styling | Tailwind CSS (Open Source, MIT) |
| UI-Komponenten | **Nuxt UI** (kostenlose Version, MIT) |
| Scanning | **Puppeteer** (mit mitgeliefertem Chromium, nicht puppeteer-core) |
| Tracker-Datenbank | **DuckDuckGo Tracker Radar** |
| Package Manager | **npm** |
| Node-Version | **Node 22 LTS** |
| Deployment (geplant) | **Offen** – Entscheidung am Ende von Sprint 2. Optionen: Fly.io (Docker, Favorit) vs. Vercel + separates Backend (Hybrid) |
| Datenbank | **Keine in Sprint 1 & 2.** Perspektivisch: Postgres (managed auf Fly.io) |
| Docker | **Nur für Production**, nicht für lokale Dev-Umgebung |

### Bewusst NICHT genutzt – und warum

- **Kein separates NestJS-Backend** → Nitro-Server-Routes reichen, spart 6–8h Setup, ein Repo / ein Deploy / ein Mindset
- **Keine DB in Sprint 1/2** → reiner Request-Response-Zyklus, keine persistenten Daten nötig
- **Kein Nuxt UI Pro / Tailwind Plus** → kostenlose Versionen reichen voll aus

---

## Sprint-Planung

### Sprint 1 – "End-to-End funktional" (Wochenende 1, ~8–10h)

**Ziel:** Lokal lauffähig. Hässlich, aber funktional.

- [x] Nuxt 3 Projekt-Setup
- [x] Nuxt UI integriert
- [] Grundstruktur angelegt (`server/api`, `server/utils`, `types`, `components`)
- [] Ping-Endpoint (`/api/ping`) funktioniert
- [] Startseite (`pages/index.vue`) mit Nuxt UI rendert
- [] Git-Repo initialisiert + auf GitHub gepusht
- [ ] **NÄCHSTER SCHRITT:** Puppeteer-Integration (`server/api/analyze.post.ts`)
- [ ] URL-Input-Komponente im Frontend
- [ ] Rohe JSON-Anzeige der Scan-Ergebnisse
- [ ] Shared TypeScript Types (`types/analysis.ts`)

### Sprint 2 – "Polish + Tracker-Erkennung" (Wochenende 2, ~12h)

- [ ] DuckDuckGo Tracker-Radar-Liste integrieren
- [ ] Privacy-Score-Algorithmus (einfach, transparent)
- [ ] UI-Redesign mit Tailwind + Dark Mode + Animations
- [ ] Mobile-first responsive Layout
- [ ] Donut-Chart für Tracker-Kategorien
- [ ] Live-Deploy auf Fly.io via Docker
- [ ] README mit Screenshots/GIF + Live-Demo-Link

### Sprint 3 – "KI + Tests" (optional, nach HR-Gespräch)

- [ ] Claude API für Tracker-Erklärungen
- [ ] Unit Tests für Score-Algorithmus
- [ ] Eventuell: Postgres + Scan-Historie

---

## Projektstruktur

```
tracklens/
├── CLAUDE.md                     ← dieses Briefing
├── README.md
├── nuxt.config.ts
├── package.json
├── tsconfig.json
├── app.vue                       ← Wrapper mit <UApp> und <NuxtPage />
├── assets/
│   └── css/
│       └── main.css              ← @import "tailwindcss" + "@nuxt/ui"
├── components/                   ← Vue-Komponenten (UrlInput, ScanResult, TrackerCard, ...)
├── pages/
│   └── index.vue                 ← Startseite
├── server/
│   ├── api/
│   │   ├── ping.get.ts           ← bereits da
│   │   └── analyze.post.ts       ← TODO: Puppeteer-Logik
│   └── utils/
│       ├── puppeteer.ts          ← TODO: Browser-Handling
│       ├── tracker-detection.ts  ← TODO: Sprint 2
│       └── privacy-score.ts      ← TODO: Sprint 2
└── types/
    └── analysis.ts               ← TODO: Shared Types
```

---

## Aktueller Stand (Stand: 15. Mai 2026)

**Erledigt:**
- Projekt initialisiert mit `npx nuxi@latest init tracklens`
- Dependencies: `@nuxt/ui`, `puppeteer`, `@types/node`
- `nuxt.config.ts` konfiguriert (Nuxt UI als Modul, CSS-Pfad, compatibilityVersion 4)
- `assets/css/main.css` mit Tailwind + Nuxt UI Imports
- `app.vue` mit `<UApp>` Wrapper
- `pages/index.vue` mit minimaler Landing
- `server/api/ping.get.ts` als API-Smoke-Test
- Git initialisiert, auf GitHub gepusht (Public Repo)

**Verifiziert:**
- `npm run dev` startet sauber auf `localhost:3000`
- Startseite rendert mit Dark-Mode-Klassen
- `/api/ping` liefert JSON mit Status + Timestamp

---

## Nächste Schritte für Claude Code

### Schritt 9: Puppeteer-Endpoint bauen

Erstelle `server/api/analyze.post.ts`:
- Nimmt `{ url: string }` im Request-Body entgegen
- Validiert die URL (sollte http/https sein, kein localhost o. ä.)
- Startet Puppeteer headless, navigiert zur URL
- Sammelt:
  - **Cookies** (alle, mit Name, Domain, Expiry)
  - **Third-Party-Requests** (alle Network-Requests, deren Hostname ≠ Hostname der Ziel-URL)
- Gibt strukturiertes JSON zurück
- Schließt den Browser sauber (auch im Fehlerfall – `try/finally`)
- Timeout-Handling: max. 30 Sekunden pro Scan

Lege gleichzeitig `types/analysis.ts` an mit den Shared Types (`AnalysisRequest`, `AnalysisResponse`, `CookieInfo`, `RequestInfo`).

Lagere die Puppeteer-Logik in `server/utils/puppeteer.ts` aus, damit der Endpoint selbst dünn bleibt.

### Schritt 10: Frontend-Anbindung

In `pages/index.vue`:
- URL-Input mit Nuxt UI (`<UInput>` + `<UButton>`)
- Loading-State während des Scans
- Rohe JSON-Anzeige des Ergebnisses (Polish kommt in Sprint 2)
- Fehler-Handling sichtbar machen

### Schritt 11: Deployment (am Ende von Sprint 2)

Deployment-Entscheidung ist **offen** und wird am Ende von Sprint 2 getroffen. Zwei Hauptoptionen:

**Option A: Fly.io mit Docker (Favorit)**
- Multi-Stage-Dockerfile (Node 22 LTS Build → Runtime mit Chromium)
- Voller Puppeteer nutzbar, kein Stripped-Chromium nötig
- Dev-Prod-Parität durch Docker
- Kosten: 0–5 €/Monat

**Option B: Hybrid (Vercel Frontend + Fly.io Backend)**
- Frontend auf Vercel (kostenlos, CDN)
- Backend mit Puppeteer separat auf Fly.io
- Mehr Setup-Aufwand, aber beide Skills im CV

Vor Deployment-Schritt: aktuelle Optionen kurz neu evaluieren.

---

## Konventionen & Stil

- **Sprache im Code:** Englisch (Variablen, Kommentare, Commits)
- **Sprache in der Konversation:** Deutsch (User-Präferenz)
- **Commit-Stil:** Conventional Commits (`feat:`, `chore:`, `fix:`, `docs:`)
- **Type-Safety:** Strikt. Keine `any`s, wenn vermeidbar. Shared Types in `types/`.
- **Server-Routes:** Dünn halten, Logik in `server/utils/`
- **Komponenten:** Composition API mit `<script setup lang="ts">`

---

## Kontext zum Entwickler

- Full-Stack-Entwickler mit Schwerpunkt Vue 3 / TypeScript
- ~4 Jahre Berufserfahrung (Essener Digitalagentur)
- Aktuell in Bewerbungsphase, daher: Lieferfähigkeit > Perfektion
- TrackLens muss vor dem HR-Gespräch (ca. Ende Mai/Anfang Juni 2026) vorzeigbar sein
- Bevorzugt klare Erklärungen, will verstehen statt nur abtippen

---

## Wichtige Erinnerungen

- **Kein Over-Engineering.** Wenn etwas einfacher geht und das Ziel erreicht, einfacher.
- **Pragmatismus schlägt Idealismus.** Nuxt-Fullstack statt Microservices, SQLite/keine DB statt sofort Postgres.
- **Live-Demo-Tauglichkeit ist King.** Lieber ein Feature weniger und stabiler als drei Features halbgar.
- **README ist Teil des Produkts.** Wird beim Recruiter gleichzeitig mit dem Code gelesen.