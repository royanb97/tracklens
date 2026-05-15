export default defineNuxtConfig({
	modules: ['@nuxt/ui'],

	css: ['~/assets/css/main.css'],

	runtimeConfig: {
		scanTimeoutMs: 30_000,
	},

	typescript: {
		strict: true,
	},
})
