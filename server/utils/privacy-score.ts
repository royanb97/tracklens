import type { CookieInfo, RequestInfo } from '~/types/analysis'

export type Grade = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Bad'

export interface PrivacyScore {
	score: number
	grade: Grade
}

// DDG Tracker Radar categories grouped by severity
const TIER_1 = new Set([
	'Advertising',
	'Ad Fraud',
	'Ad Motivated Tracking',
	'Session Replay',
	'Fingerprinting',
	'Unknown High Risk Behavior',
	'Malware',
])

const TIER_2 = new Set([
	'Analytics',
	'Audience Measurement',
	'Third-Party Analytics Marketing',
	'Action Pixels',
	'Tag Manager',
])

const TIER_3 = new Set([
	'Social Network',
	'Social - Share',
	'Social - Comment',
	'Embedded Content',
	'Badge',
])

function entityPenalty(categories: string[]): number {
	if (categories.some(c => TIER_1.has(c))) return 20
	if (categories.some(c => TIER_2.has(c))) return 10
	if (categories.some(c => TIER_3.has(c))) return 5
	// Known tracker in DB but no matching category
	return 8
}

export function computeScore(cookies: CookieInfo[], requests: RequestInfo[]): PrivacyScore {
	// Deduplicate by entity name — one company tracking you counts once
	const seenEntities = new Map<string, string[]>()
	for (const req of requests) {
		if (!req.tracker) continue
		const key = req.tracker.entityName
		if (!seenEntities.has(key)) {
			seenEntities.set(key, req.tracker.categories)
		}
	}

	let trackerDeduction = 0
	for (const categories of seenEntities.values()) {
		trackerDeduction += entityPenalty(categories)
	}
	trackerDeduction = Math.min(trackerDeduction, 70)

	let cookieDeduction = 0
	for (const cookie of cookies) {
		// Persistent cookie readable by JS — classic tracking pattern
		if (cookie.expires !== null && !cookie.httpOnly) cookieDeduction += 3
		// Cookie sent over plain HTTP
		if (!cookie.secure) cookieDeduction += 2
	}
	cookieDeduction = Math.min(cookieDeduction, 20)

	const score = Math.max(10, 100 - trackerDeduction - cookieDeduction)

	let grade: Grade
	if (score >= 90) grade = 'Excellent'
	else if (score >= 75) grade = 'Good'
	else if (score >= 50) grade = 'Fair'
	else if (score >= 25) grade = 'Poor'
	else grade = 'Bad'

	return { score, grade }
}
