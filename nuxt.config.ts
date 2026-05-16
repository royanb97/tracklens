import { readFileSync } from 'fs'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineNuxtConfig({
	modules: ['@nuxt/ui'],

	css: ['~/assets/css/main.css'],

	runtimeConfig: {
		scanTimeoutMs: 30_000,
		public: {
			version,
		},
	},

	typescript: {
		strict: true,
	},
})
