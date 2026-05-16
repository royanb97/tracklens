import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const BASE = 'https://raw.githubusercontent.com/duckduckgo/tracker-radar/main'
const OUTPUT = join(process.cwd(), 'data', 'tracker-db.json')
const CONCURRENCY = 20
const MIN_PREVALENCE = 0.001 // present on >0.1% of measured sites

async function fetchJson(url) {
	const res = await fetch(url)
	if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
	return res.json()
}

async function runPool(tasks, concurrency) {
	const results = new Array(tasks.length)
	let index = 0
	async function worker() {
		while (index < tasks.length) {
			const i = index++
			results[i] = await tasks[i]()
		}
	}
	await Promise.all(Array.from({ length: concurrency }, worker))
	return results
}

console.log('Fetching domain map...')
const domainMap = await fetchJson(`${BASE}/build-data/generated/domain_map.json`)

console.log('Fetching domain summary (for prevalence filtering)...')
const domainSummary = await fetchJson(`${BASE}/build-data/generated/domain_summary.json`)

const domainsToFetch = Object.entries(domainSummary)
	.filter(([domain, data]) => data.prevalence >= MIN_PREVALENCE && domainMap[domain])
	.sort((a, b) => b[1].prevalence - a[1].prevalence)
	.map(([domain]) => domain)

console.log(`Fetching categories for ${domainsToFetch.length} domains (concurrency: ${CONCURRENCY})...`)

let done = 0
const tasks = domainsToFetch.map(domain => async () => {
	try {
		const data = await fetchJson(`${BASE}/domains/US/${domain}.json`)
		done++
		if (done % 100 === 0) console.log(`  ${done}/${domainsToFetch.length}`)
		return { domain, categories: data.categories ?? [] }
	} catch {
		return { domain, categories: [] }
	}
})

const categoryResults = await runPool(tasks, CONCURRENCY)

// Build the merged DB: all domains from domain_map, categories where available
const db = {}
for (const [domain, entry] of Object.entries(domainMap)) {
	db[domain] = {
		entityName: entry.entityName,
		displayName: entry.displayName,
		categories: [],
	}
}
for (const { domain, categories } of categoryResults) {
	if (db[domain]) db[domain].categories = categories
}

mkdirSync(join(process.cwd(), 'data'), { recursive: true })
const json = JSON.stringify(db)
writeFileSync(OUTPUT, json, 'utf-8')

const mb = (json.length / 1024 / 1024).toFixed(1)
const withCategories = Object.values(db).filter(e => e.categories.length > 0).length
console.log(`Done. ${Object.keys(db).length} domains total, ${withCategories} with categories, ${mb} MB → data/tracker-db.json`)
