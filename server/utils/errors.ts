export class SiteNotFoundError extends Error {
	constructor() {
		super('Website not found.')
		this.name = 'SiteNotFoundError'
	}
}

const SITE_NOT_FOUND_PATTERNS = [
	'net::ERR_NAME_NOT_RESOLVED',
	'net::ERR_CONNECTION_REFUSED',
	'net::ERR_ADDRESS_UNREACHABLE',
	'net::ERR_INTERNET_DISCONNECTED',
]

export function isSiteNotFoundError(err: unknown): boolean {
	return (
		err instanceof Error
		&& SITE_NOT_FOUND_PATTERNS.some(pattern => err.message.includes(pattern))
	)
}
