<script setup lang="ts">
const aboutOpen = ref(false)
</script>

<template>
	<UApp>
		<NuxtPage />

		<div class="fixed bottom-4 inset-x-0 flex justify-center pointer-events-none">
			<button
				class="pointer-events-auto text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
				@click="aboutOpen = true"
			>
				About
			</button>
		</div>

		<AboutModal v-model:open="aboutOpen" />
	</UApp>
</template>
