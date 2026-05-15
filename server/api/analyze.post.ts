import { scanPage } from '../utils/puppeteer'
import { SiteNotFoundError } from '../utils/errors'
import type { AnalysisRequest } from '~/types/analysis'

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1'])

export default defineEventHandler(async (event) => {
	const body = await readBody<AnalysisRequest>(event)

	if (!body?.url) {
		throw createError({ statusCode: 400, message: 'URL is required.' })
	}

	let parsed: URL
	try {
		parsed = new URL(body.url)
	}
	catch {
		throw createError({ statusCode: 400, message: 'Invalid URL.' })
	}

	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		throw createError({ statusCode: 400, message: 'Only http and https URLs are supported.' })
	}

	if (BLOCKED_HOSTS.has(parsed.hostname) || parsed.hostname.endsWith('.local')) {
		throw createError({ statusCode: 400, message: 'Scanning local addresses is not allowed.' })
	}

	try {
		return await scanPage(body.url)
	}
	catch (err) {
		if (err instanceof SiteNotFoundError) {
			throw createError({ statusCode: 422, message: err.message })
		}
		throw createError({
			statusCode: 500,
			message: err instanceof Error ? err.message : 'Scan failed.',
		})
	}
})
