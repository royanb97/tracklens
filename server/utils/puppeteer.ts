import puppeteer from "puppeteer";
import type {
	AnalysisResponse,
	CookieInfo,
	RequestInfo,
} from "../../types/analysis";

export async function scanPage(targetUrl: string): Promise<AnalysisResponse> {
	const { scanTimeoutMs } = useRuntimeConfig();

	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	try {
		const page = await browser.newPage();
		page.setDefaultNavigationTimeout(scanTimeoutMs);

		const targetHostname = new URL(targetUrl).hostname;
		const thirdPartyRequests: RequestInfo[] = [];

		page.on("request", (request) => {
			try {
				const reqHostname = new URL(request.url()).hostname;
				if (reqHostname && reqHostname !== targetHostname) {
					thirdPartyRequests.push({
						url: request.url(),
						hostname: reqHostname,
						resourceType: request.resourceType(),
					});
				}
			} catch {
				// ignore unparseable URLs (e.g. data:, blob:)
			}
		});

		// 'load' is more reliable than 'networkidle2' for SPAs with continuous polling
		await page.goto(targetUrl, { waitUntil: "load" });

		const rawCookies = await page.cookies();
		const cookies: CookieInfo[] = rawCookies.map((c) => ({
			name: c.name,
			domain: c.domain,
			expires: c.expires === -1 ? null : c.expires,
			httpOnly: c.httpOnly,
			secure: c.secure,
			sameSite: c.sameSite ?? "None",
		}));

		return {
			url: targetUrl,
			scannedAt: new Date().toISOString(),
			cookies,
			thirdPartyRequests,
		};
	} finally {
		await browser.close();
	}
}
