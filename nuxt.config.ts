export default defineNuxtConfig({
	modules: ['@nuxt/ui'],

	css: ['~/assets/css/main.css'],

	runtimeConfig: {
		scanTimeoutMs: 30_000,
		public: {
			version: '0.0.2',
		},
	},

	typescript: {
		strict: true,
	},
})
