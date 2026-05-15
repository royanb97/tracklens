import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { TrackerMatch } from '~/types/analysis'

interface DomainEntry {
	displayName: string
	entityName: string
}

let cache: Record<string, DomainEntry> | null = null

function load(): Record<string, DomainEntry> {
	if (cache) return cache
	const filePath = resolve(process.cwd(), 'data/tracker-db.json')
	cache = JSON.parse(readFileSync(filePath, 'utf-8'))
	return cache!
}

export function detectTracker(hostname: string): TrackerMatch | null {
	const map = load()
	const parts = hostname.split('.')
	for (let i = 0; i < parts.length - 1; i++) {
		const candidate = parts.slice(i).join('.')
		if (map[candidate]) return map[candidate]
	}
	return null
}
