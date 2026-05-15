# Changelog

All notable changes to this project will be documented in this file.

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
