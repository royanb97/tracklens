# Changelog

All notable changes to this project will be documented in this file.

---

## [0.0.3] – 2026-05-16

### Added

- Cookie consent banner auto-acceptance via `@duckduckgo/autoconsent` (opt-in mode), exposing trackers that only load after user consent
- 3-second post-load wait after navigation to capture lazy-loaded tracker scripts

### Changed

- Tracker detection now includes categories (e.g. Advertising, Analytics, Session Replay) sourced from individual DDG Tracker Radar domain files
- `fetch-tracker-db` script extended: fetches categories for ~770 high-prevalence domains (prevalence ≥ 0.001) alongside the existing entity map
- `TrackerMatch` type extended with `categories: string[]`

---

## [0.0.2] – 2026-05-15

### Added

- DuckDuckGo Tracker Radar integration (`server/utils/tracker-detection.ts`)
  - 38,000+ known tracker domains, downloaded via `npm run fetch-tracker-db`
  - Parent-domain fallback (e.g. subdomains of `google.com` are matched correctly)
- Structured scan result UI (`ScanResult.vue`) replacing raw JSON output
  - Summary bar with tracker, cookie, and third-party request counts
  - **Trackers** tab: grouped by company name, sorted by request count
  - **Cookies** tab: with expiry, HttpOnly / Secure / SameSite badges
  - **Other third-party** tab: non-tracker external requests grouped by hostname
- About modal (`AboutModal.vue`) with project name, version, and author
- Fixed "About" link in footer, always visible on all pages
- "Website not found" warning (yellow) instead of generic error (red) for DNS/connection failures
- Button label changes to "Scanning..." during active scan

### Changed

- `waitUntil` changed from `networkidle2` to `load` for more reliable SPA scanning
- Scan timeout is now configurable via `NUXT_SCAN_TIMEOUT_MS` environment variable
- `RequestInfo` type extended with `tracker: TrackerMatch | null` field

---

## [0.0.1] – 2026-05-15

### Added

- Initial project setup with Nuxt 4, Nuxt UI v3, and Tailwind CSS v4
- Landing page with hero section and URL input (`UrlInput.vue`)
  - Client-side URL validation with automatic `https://` prefix
  - Loading state and inline error display
- Puppeteer scan endpoint (`POST /api/analyze`)
  - Collects all cookies (name, domain, expiry, HttpOnly, Secure, SameSite)
  - Captures all third-party network requests
  - SSRF protection: blocks localhost and `.local` addresses
  - URL validation (http/https only)
- Shared TypeScript types (`types/analysis.ts`)
- Smoke-test endpoint (`GET /api/ping`)
- Dark gradient background theme with Slate/Blue color scheme
- Configurable scan timeout via `NUXT_SCAN_TIMEOUT_MS` environment variable (default: 30s)
- About modal with project name, version, and author
- `README.md` with setup instructions and environment variable reference
- `.gitignore` for Nuxt, Node.js, and macOS artifacts
