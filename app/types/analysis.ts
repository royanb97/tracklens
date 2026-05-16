export interface AnalysisRequest {
	url: string
}

export interface CookieInfo {
	name: string
	domain: string
	expires: number | null
	httpOnly: boolean
	secure: boolean
	sameSite: string
}

export interface TrackerMatch {
	displayName: string
	entityName: string
	categories: string[]
}

export interface RequestInfo {
	url: string
	hostname: string
	resourceType: string
	tracker: TrackerMatch | null
}

export type Grade = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Bad'

export interface AnalysisResponse {
	url: string
	scannedAt: string
	cookies: CookieInfo[]
	thirdPartyRequests: RequestInfo[]
	score: number
	grade: Grade
}
