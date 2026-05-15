import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const SOURCE = 'https://raw.githubusercontent.com/duckduckgo/tracker-radar/main/build-data/generated/domain_map.json'
const OUTPUT = join(process.cwd(), 'data', 'tracker-db.json')

console.log('Fetching DuckDuckGo Tracker Radar...')

const res = await fetch(SOURCE)
if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)

const text = await res.text()
mkdirSync(join(process.cwd(), 'data'), { recursive: true })
writeFileSync(OUTPUT, text, 'utf-8')

const mb = (text.length / 1024 / 1024).toFixed(1)
const count = Object.keys(JSON.parse(text)).length
console.log(`Done. ${count} domains, ${mb} MB → data/tracker-db.json`)
