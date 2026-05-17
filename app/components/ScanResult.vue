<script setup lang="ts">
import type { AnalysisResponse, RequestInfo } from '~/types/analysis'

const props = defineProps<{
	result: AnalysisResponse
}>()

const trackerRequests = computed(() =>
	props.result.thirdPartyRequests.filter(r => r.tracker !== null),
)

const otherRequests = computed(() =>
	props.result.thirdPartyRequests.filter(r => r.tracker === null),
)

const trackersByEntity = computed(() => {
	const map = new Map<string, RequestInfo[]>()
	for (const req of trackerRequests.value) {
		const name = req.tracker!.displayName
		if (!map.has(name)) map.set(name, [])
		map.get(name)!.push(req)
	}
	return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
})

const otherByHostname = computed(() => {
	const map = new Map<string, RequestInfo[]>()
	for (const req of otherRequests.value) {
		if (!map.has(req.hostname)) map.set(req.hostname, [])
		map.get(req.hostname)!.push(req)
	}
	return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
})

const scoreGrade = computed(() => {
	const s = props.result.score
	if (s >= 90) return { label: 'Excellent', color: 'text-emerald-400', ring: 'ring-emerald-400/40', bg: 'bg-emerald-400/10' }
	if (s >= 75) return { label: 'Good', color: 'text-green-400', ring: 'ring-green-400/40', bg: 'bg-green-400/10' }
	if (s >= 50) return { label: 'Fair', color: 'text-yellow-400', ring: 'ring-yellow-400/40', bg: 'bg-yellow-400/10' }
	if (s >= 25) return { label: 'Poor', color: 'text-orange-400', ring: 'ring-orange-400/40', bg: 'bg-orange-400/10' }
	return { label: 'Bad', color: 'text-red-400', ring: 'ring-red-400/40', bg: 'bg-red-400/10' }
})

const tabs = computed(() => [
	{
		label: 'Trackers',
		badge: trackerRequests.value.length,
		slot: 'trackers' as const,
	},
	{
		label: 'Cookies',
		badge: props.result.cookies.length,
		slot: 'cookies' as const,
	},
	{
		label: 'Other third-party',
		badge: otherRequests.value.length,
		slot: 'other' as const,
	},
])

function formatExpiry(expires: number | null): string {
	if (expires === null) return 'Session'
	return new Date(expires * 1000).toLocaleDateString()
}

const TIER_1_CATS = new Set(['Advertising', 'Ad Fraud', 'Ad Motivated Tracking', 'Session Replay', 'Fingerprinting'])

const scoreExplanation = computed(() => {
	const entities = trackersByEntity.value
	const entityCount = entities.length
	const trackingCookies = props.result.cookies.filter(c => c.expires !== null && !c.httpOnly).length

	if (entityCount === 0 && trackingCookies === 0) {
		return 'No known trackers or suspicious cookies detected.'
	}

	const parts: string[] = []

	if (entityCount > 0) {
		const hasInvasive = entities.some(([, reqs]) =>
			reqs[0]?.tracker?.categories.some(c => TIER_1_CATS.has(c)),
		)
		const topNames = entities.slice(0, 2).map(([name]) => name).join(', ')
		const rest = entityCount > 2 ? ` and ${entityCount - 2} more` : ''
		parts.push(
			`${topNames}${rest} ${entityCount === 1 ? 'is' : 'are'} tracking activity on this site`
			+ (hasInvasive ? ', including advertising or fingerprinting.' : '.'),
		)
	}

	if (trackingCookies > 0) {
		parts.push(
			`${trackingCookies} persistent cookie${trackingCookies > 1 ? 's are' : ' is'} readable by JavaScript — a common tracking pattern.`,
		)
	}

	return parts.join(' ')
})

const expandedTrackers = ref(new Set<string>())
function toggleTracker(key: string) {
	if (expandedTrackers.value.has(key)) expandedTrackers.value.delete(key)
	else expandedTrackers.value.add(key)
	expandedTrackers.value = new Set(expandedTrackers.value)
}

const expandedOther = ref(new Set<string>())
function toggleOther(key: string) {
	if (expandedOther.value.has(key)) expandedOther.value.delete(key)
	else expandedOther.value.add(key)
	expandedOther.value = new Set(expandedOther.value)
}
</script>

<template>
	<div class="w-full flex flex-col gap-4">

		<!-- Summary -->
		<div class="flex flex-wrap gap-4 text-sm">
			<div class="flex items-center gap-2">
				<span class="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
				<span class="text-slate-300">
					<span class="font-semibold text-white">{{ trackerRequests.length }}</span> tracker{{ trackerRequests.length !== 1 ? 's' : '' }}
				</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
				<span class="text-slate-300">
					<span class="font-semibold text-white">{{ result.cookies.length }}</span> cookie{{ result.cookies.length !== 1 ? 's' : '' }}
				</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="w-2.5 h-2.5 rounded-full bg-slate-500 shrink-0" />
				<span class="text-slate-300">
					<span class="font-semibold text-white">{{ otherRequests.length }}</span> other third-party
				</span>
			</div>
		</div>

		<!-- Privacy Score -->
		<div class="flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-900/50 px-5 py-4">
			<div :class="['flex items-center justify-center size-14 rounded-full ring-2 shrink-0', scoreGrade.ring, scoreGrade.bg]">
				<span :class="['text-xl font-bold tabular-nums', scoreGrade.color]">{{ result.score }}</span>
			</div>
			<div class="flex flex-col gap-1">
				<span class="text-xs text-slate-500 uppercase tracking-widest">Privacy Score</span>
				<span :class="['text-base font-semibold', scoreGrade.color]">{{ scoreGrade.label }}</span>
				<p class="text-xs text-slate-400 leading-relaxed">{{ scoreExplanation }}</p>
			</div>
		</div>

		<!-- Tabs -->
		<UTabs :items="tabs" variant="link" class="w-full">

			<!-- Trackers -->
			<template #trackers>
				<div class="mt-4 flex flex-col gap-3">
					<p v-if="trackersByEntity.length === 0" class="text-sm text-slate-500 py-4 text-center">
						No known trackers detected.
					</p>
					<div
						v-for="[entity, requests] in trackersByEntity"
						:key="entity"
						class="rounded-lg border border-slate-700/60 bg-slate-900/50 overflow-hidden"
					>
						<button
							class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/50 transition-colors"
							:class="{ 'border-b border-slate-700/60': expandedTrackers.has(entity) }"
							@click="toggleTracker(entity)"
						>
							<div class="flex items-center gap-2">
								<svg
									class="size-3.5 text-slate-500 transition-transform shrink-0"
									:class="{ 'rotate-90': expandedTrackers.has(entity) }"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
								</svg>
								<span class="font-medium text-sm text-white">{{ entity }}</span>
							</div>
							<UBadge :label="String(requests.length)" color="error" variant="subtle" size="sm" />
						</button>
						<ul v-show="expandedTrackers.has(entity)" class="divide-y divide-slate-800">
							<li
								v-for="req in requests"
								:key="req.url"
								class="px-4 py-2 flex items-center justify-between gap-4 text-xs"
							>
								<span class="text-slate-400 truncate">{{ req.url }}</span>
								<UBadge :label="req.resourceType" variant="outline" size="xs" class="shrink-0" />
							</li>
						</ul>
					</div>
				</div>
			</template>

			<!-- Cookies -->
			<template #cookies>
				<div class="mt-4 flex flex-col gap-2">
					<p v-if="result.cookies.length === 0" class="text-sm text-slate-500 py-4 text-center">
						No cookies detected.
					</p>
					<div
						v-for="cookie in result.cookies"
						:key="cookie.name + cookie.domain"
						class="rounded-lg border border-slate-700/60 bg-slate-900/50 px-4 py-3 flex items-start justify-between gap-4"
					>
						<div class="flex flex-col gap-1 min-w-0">
							<span class="text-sm font-medium text-white truncate">{{ cookie.name }}</span>
							<span class="text-xs text-slate-500">{{ cookie.domain }} · Expires: {{ formatExpiry(cookie.expires) }}</span>
						</div>
						<div class="flex flex-wrap gap-1.5 shrink-0">
							<UBadge v-if="cookie.httpOnly" label="HttpOnly" variant="subtle" size="xs" />
							<UBadge v-if="cookie.secure" label="Secure" color="success" variant="subtle" size="xs" />
							<UBadge
								v-if="cookie.sameSite"
								:label="cookie.sameSite"
								:color="cookie.sameSite === 'None' ? 'warning' : 'neutral'"
								variant="subtle"
								size="xs"
							/>
						</div>
					</div>
				</div>
			</template>

			<!-- Other third-party -->
			<template #other>
				<div class="mt-4 flex flex-col gap-3">
					<p v-if="otherByHostname.length === 0" class="text-sm text-slate-500 py-4 text-center">
						No other third-party requests detected.
					</p>
					<div
						v-for="[hostname, requests] in otherByHostname"
						:key="hostname"
						class="rounded-lg border border-slate-700/60 bg-slate-900/50 overflow-hidden"
					>
						<button
							class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/50 transition-colors"
							:class="{ 'border-b border-slate-700/60': expandedOther.has(hostname) }"
							@click="toggleOther(hostname)"
						>
							<div class="flex items-center gap-2">
								<svg
									class="size-3.5 text-slate-500 transition-transform shrink-0"
									:class="{ 'rotate-90': expandedOther.has(hostname) }"
									viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
								</svg>
								<span class="font-medium text-sm text-white">{{ hostname }}</span>
							</div>
							<UBadge :label="String(requests.length)" color="neutral" variant="subtle" size="sm" />
						</button>
						<ul v-show="expandedOther.has(hostname)" class="divide-y divide-slate-800">
							<li
								v-for="req in requests"
								:key="req.url"
								class="px-4 py-2 flex items-center justify-between gap-4 text-xs"
							>
								<span class="text-slate-400 truncate">{{ req.url }}</span>
								<UBadge :label="req.resourceType" variant="outline" size="xs" class="shrink-0" />
							</li>
						</ul>
					</div>
				</div>
			</template>

		</UTabs>
	</div>
</template>
