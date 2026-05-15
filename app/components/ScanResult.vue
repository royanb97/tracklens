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
						<div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/60">
							<span class="font-medium text-sm text-white">{{ entity }}</span>
							<UBadge :label="String(requests.length)" color="error" variant="subtle" size="sm" />
						</div>
						<ul class="divide-y divide-slate-800">
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
						<div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-700/60">
							<span class="font-medium text-sm text-white">{{ hostname }}</span>
							<UBadge :label="String(requests.length)" color="neutral" variant="subtle" size="sm" />
						</div>
						<ul class="divide-y divide-slate-800">
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
