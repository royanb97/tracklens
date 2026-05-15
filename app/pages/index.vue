<script setup lang="ts">
import type { AnalysisResponse } from '~/types/analysis'

useSeoMeta({
	title: 'TrackLens – Privacy Analyzer',
	description: 'Scan any website for cookies, trackers and third-party requests.',
})

const loading = ref(false)
const result = ref<AnalysisResponse | null>(null)
const scanError = ref<{ message: string; type: 'error' | 'warning' } | null>(null)

async function handleScan(url: string) {
	loading.value = true
	result.value = null
	scanError.value = null

	try {
		result.value = await $fetch<AnalysisResponse>('/api/analyze', {
			method: 'POST',
			body: { url },
		})
	}
	catch (err: unknown) {
		const status = (err as { statusCode?: number })?.statusCode
		if (status === 422) {
			scanError.value = { message: 'Website not found. Please check the URL and try again.', type: 'warning' }
		}
		else {
			scanError.value = { message: 'Scan failed. Please try again.', type: 'error' }
		}
	}
	finally {
		loading.value = false
	}
}
</script>

<template>
	<main class="min-h-screen flex flex-col items-center justify-center px-4 py-16">
		<div class="w-full max-w-2xl flex flex-col items-center gap-8">

			<!-- Hero -->
			<div class="text-center flex flex-col gap-3">
				<h1 class="text-5xl font-bold tracking-tight">
					Track<span class="text-primary">Lens</span>
				</h1>
				<p class="text-lg text-white dark:text-gray-400">
					See who's tracking when you visit a website.
				</p>
			</div>

			<!-- Input -->
			<div class="w-full rounded-xl border border-slate-700/60 bg-slate-900/50 backdrop-blur-sm p-6">
				<UrlInput :loading="loading" @scan="handleScan" />
			</div>

			<!-- Scan error -->
			<UAlert
				v-if="scanError"
				:color="scanError.type === 'warning' ? 'warning' : 'error'"
				variant="subtle"
				:description="scanError.message"
			/>

			<!-- Scan result -->
			<ScanResult v-if="result" :result="result" />

		</div>
	</main>
</template>
