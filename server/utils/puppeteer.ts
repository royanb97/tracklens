import puppeteer from 'puppeteer'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import type { Page } from 'puppeteer'
import type { AnalysisResponse, CookieInfo, RequestInfo } from '~/types/analysis'
import { detectTracker } from './tracker-detection'
import { SiteNotFoundError, isSiteNotFoundError } from './errors'
import { computeScore } from './privacy-score'

const autoconsentScript = readFileSync(
	resolve(process.cwd(), 'node_modules/@duckduckgo/autoconsent/dist/autoconsent.playwright.js'),
	'utf-8',
)

const autoconsentRules = JSON.parse(
	readFileSync(
		resolve(process.cwd(), 'node_modules/@duckduckgo/autoconsent/rules/rules.json'),
		'utf-8',
	),
)

const AUTOCONSENT_CONFIG = {
	enabled: true,
	// opt-in to see the full set of trackers a site deploys
	autoAction: 'optIn',
	disabledCmps: [],
	enablePrehide: false,
	enableCosmeticRules: true,
	enableGeneratedRules: true,
	detectRetries: 20,
	isMainWorld: false,
	prehideTimeout: 2000,
	enableFilterList: false,
	enableHeuristicDetection: true,
	enableHeuristicAction: true,
	logs: {
		lifecycle: false,
		rulesteps: false,
		detectionsteps: false,
		evals: false,
		errors: false,
		messages: false,
		waits: false,
	},
}

const POST_LOAD_WAIT_MS = 3000

async function setupAutoconsent(page: Page) {
	const sendMessage = (msg: unknown) =>
		page
			.evaluate((m: unknown) => {
				const w = window as Window & { autoconsentReceiveMessage?: (m: unknown) => void }
				w.autoconsentReceiveMessage?.(m)
			}, msg)
			.catch(() => {})

	await page.exposeFunction('autoconsentSendMessage', async (message: Record<string, unknown>) => {
		if (!message || typeof message !== 'object') return
		switch (message.type) {
			case 'init':
				return sendMessage({ type: 'initResp', config: AUTOCONSENT_CONFIG, rules: autoconsentRules })
			case 'eval': {
				const result = await page.evaluate(message.code as string).catch(() => null)
				return sendMessage({ type: 'evalResp', id: message.id, result })
			}
		}
	})

	await page.evaluateOnNewDocument(autoconsentScript)
}

export async function scanPage(targetUrl: string): Promise<AnalysisResponse> {
	const { scanTimeoutMs } = useRuntimeConfig()

	const browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	})

	try {
		const page = await browser.newPage()
		page.setDefaultNavigationTimeout(scanTimeoutMs)

		const targetHostname = new URL(targetUrl).hostname
		const thirdPartyRequests: RequestInfo[] = []

		page.on('request', (request) => {
			try {
				const reqHostname = new URL(request.url()).hostname
				if (reqHostname && reqHostname !== targetHostname) {
					thirdPartyRequests.push({
						url: request.url(),
						hostname: reqHostname,
						resourceType: request.resourceType(),
						tracker: detectTracker(reqHostname),
					})
				}
			}
			catch {
				// ignore unparseable URLs (e.g. data:, blob:)
			}
		})

		await setupAutoconsent(page)

		try {
			await page.goto(targetUrl, { waitUntil: 'load' })
		}
		catch (err) {
			if (isSiteNotFoundError(err)) throw new SiteNotFoundError()
			throw err
		}

		// Re-inject in case the page loaded before evaluateOnNewDocument fired
		await page.evaluate(autoconsentScript).catch(() => {})

		// Wait for autoconsent to click the banner and lazy-loaded trackers to initialize
		await new Promise(resolve => setTimeout(resolve, POST_LOAD_WAIT_MS))

		const rawCookies = await page.cookies()
		const cookies: CookieInfo[] = rawCookies.map(c => ({
			name: c.name,
			domain: c.domain,
			expires: c.expires === -1 ? null : c.expires,
			httpOnly: c.httpOnly ?? false,
			secure: c.secure,
			sameSite: c.sameSite ?? 'None',
		}))

		const { score, grade } = computeScore(cookies, thirdPartyRequests)

		return {
			url: targetUrl,
			scannedAt: new Date().toISOString(),
			cookies,
			thirdPartyRequests,
			score,
			grade,
		}
	}
	finally {
		await browser.close()
	}
}
