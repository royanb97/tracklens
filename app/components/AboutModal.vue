<script setup lang="ts">
const open = defineModel<boolean>('open', { required: true })
const { public: { version } } = useRuntimeConfig()
</script>

<template>
	<UModal v-model:open="open">
		<template #content>
			<div class="flex flex-col items-center gap-2 p-8 text-center">
				<h2 class="text-2xl font-bold tracking-tight">
					Track<span class="text-primary">Lens</span>
				</h2>
				<p class="text-sm text-slate-400">
					Version {{ version }}
				</p>
				<p class="text-sm text-slate-400">
					Royan Baluch
				</p>
			</div>
		</template>
	</UModal>
</template>
