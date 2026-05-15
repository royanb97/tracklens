<script setup lang="ts">
import type { AnalysisResponse } from '~/types/analysis'

useSeoMeta({
  title: 'TrackLens – Privacy Analyzer',
  description: 'Scan any website for cookies, trackers and third-party requests.',
})

const loading = ref(false)
const result = ref<AnalysisResponse | null>(null)
const scanError = ref('')

async function handleScan(url: string) {
  loading.value = true
  result.value = null
  scanError.value = ''

  try {
    result.value = await $fetch<AnalysisResponse>('/api/analyze', {
      method: 'POST',
      body: { url },
    })
  }
  catch (err: unknown) {
    scanError.value = err instanceof Error ? err.message : 'Scan failed. Please try again.'
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
        <p class="text-lg text-gray-500 dark:text-gray-400">
          See who's watching when you visit a website.
        </p>
      </div>

      <!-- Input -->
      <UCard class="w-full">
        <UrlInput :loading="loading" @scan="handleScan" />
      </UCard>

      <!-- Scan error -->
      <UAlert
        v-if="scanError"
        color="error"
        variant="subtle"
        :description="scanError"
      />

      <!-- Raw result (Sprint 1 placeholder) -->
      <pre
        v-if="result"
        class="w-full text-xs bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-auto max-h-96"
      >{{ JSON.stringify(result, null, 2) }}</pre>

    </div>
  </main>
</template>
