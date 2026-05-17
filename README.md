# TrackLens

**TrackLens** analyzes websites for cookies, trackers, and third-party requests — including a privacy score, using [DuckDuckGo Tracker Radar](https://github.com/duckduckgo/tracker-radar) as source.

Enter a URL, scan, done. No account required, no data is stored.

---

## Features

- **Cookie analysis** – all cookies with domain, expiry, and flags (HttpOnly, Secure, SameSite)
- **Third-party requests** – all network requests to external domains, captured and categorized
- **Privacy score** – transparent rating based on detected trackers *(work in progress)*
- **Tracker detection** – matched against the DuckDuckGo Tracker Radar database *(work in progress)*

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

# Download the DuckDuckGo Tracker Radar database (~4 MB)
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

## Privacy Score

Every scan produces a score from **10 to 100** based on detected trackers and cookie quality.

### Tracker deductions (per unique company, worst category wins)

| Categories | Deduction |
|---|---|
| Advertising, Ad Fraud, Ad Motivated Tracking, Session Replay, Fingerprinting, Unknown High Risk Behavior, Malware | −20 |
| Analytics, Audience Measurement, Third-Party Analytics Marketing, Action Pixels, Tag Manager | −10 |
| Social Network, Social - Share, Social - Comment, Embedded Content, Badge | −5 |
| Known tracker without a matching category | −8 |

Tracker deductions are capped at **−70**. Each company counts once regardless of how many domains or requests it generates.

### Cookie deductions (per cookie)

| Condition | Deduction |
|---|---|
| Persistent cookie readable by JavaScript (`expires` set + no `HttpOnly`) | −3 |
| Cookie without `Secure` flag (sent over plain HTTP) | −2 |

Cookie deductions are capped at **−20**.

### Score thresholds

| Score | Grade |
|---|---|
| 90 – 100 | Excellent |
| 75 – 89 | Good |
| 50 – 74 | Fair |
| 25 – 49 | Poor |
| 10 – 24 | Bad |

Categories are sourced from the [DuckDuckGo Tracker Radar](https://github.com/duckduckgo/tracker-radar) database. Tracker data covers ~38,000 known tracking domains across 400+ companies.

---

## Live Demo

*coming soon*

---

## License

MIT
