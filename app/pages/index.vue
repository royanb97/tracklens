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
	<main class="min-h-screen flex flex-col items-center px-4 pb-16">
		<div
			class="w-full flex flex-col items-center gap-8 transition-[max-width,margin-top] duration-700 ease-in-out"
			:style="{
				marginTop: result ? '4rem' : '25vh',
				maxWidth: result ? '72rem' : '42rem',
			}"
		>
			<!-- Hero + Input -->
			<div class="w-full max-w-2xl flex flex-col items-center gap-8">
				<div class="text-center flex flex-col gap-2">
					<h1
						class="font-bold tracking-tight transition-[font-size] duration-700 ease-in-out"
						:class="result ? 'text-3xl' : 'text-5xl'"
					>
						<span class="text-white">Track</span><span class="text-primary">Lens</span>
					</h1>
					<Transition name="fade">
						<p v-if="!result" class="text-lg text-slate-400">
							See who's tracking when you visit a website.
						</p>
					</Transition>
				</div>

				<div class="w-full rounded-xl border border-slate-700/60 bg-slate-900/50 backdrop-blur-sm p-6">
					<UrlInput :loading="loading" @scan="handleScan" />
				</div>

				<UAlert
					v-if="scanError"
					:color="scanError.type === 'warning' ? 'warning' : 'error'"
					variant="subtle"
					:description="scanError.message"
				/>
			</div>

			<!-- Scan result -->
			<Transition name="fade-up">
				<ScanResult v-if="result" :result="result" class="w-full" />
			</Transition>
		</div>
	</main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.fade-up-enter-active {
	transition: opacity 0.5s ease 0.15s, transform 0.5s ease 0.15s;
}
.fade-up-enter-from {
	opacity: 0;
	transform: translateY(24px);
}
</style>
