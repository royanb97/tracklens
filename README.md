# TrackLens

**TrackLens** analyzes websites for cookies, trackers, and third-party requests — including a privacy score.

Enter a URL, scan, done. No account required, no data is stored.

---

## Features

- **Cookie analysis** – all cookies with domain, expiry, and flags (HttpOnly, Secure, SameSite)
- **Third-party requests** – all network requests to external domains, captured and categorized
- **Privacy score** – transparent rating based on detected trackers *(Sprint 2)*
- **Tracker detection** – matched against the DuckDuckGo Tracker Radar database *(Sprint 2)*

---

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Nuxt 4 (fullstack via Nitro) |
| Frontend | Vue 3 + Composition API |
| UI | Nuxt UI v3 + Tailwind CSS v4 |
| Scanning | Puppeteer (headless Chromium) |
| Tracker DB | DuckDuckGo Tracker Radar |
| Deployment | Fly.io via Docker |

---

## Local Development

**Requirements:** Node.js 22 LTS, npm

```bash
# Clone the repository
git clone https://github.com/your-username/tracklens.git
cd tracklens

# Install dependencies
npm install

# Download the DuckDuckGo Tracker Radar database (~10 MB, not committed to git)
npm run fetch-tracker-db

# Start the dev server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NUXT_SCAN_TIMEOUT_MS` | `30000` | Maximum scan duration in milliseconds |

---

## Live Demo

*coming soon*

---

## License

MIT
