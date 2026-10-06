/// <reference types="vitest/config" />
import { playwright } from '@vitest/browser-playwright';
import { getViteConfig } from 'astro/config';
import { renderAstro } from './test/render-astro';

export default getViteConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		dir: 'src',
		silent: true,
		coverage: {
			provider: 'v8',
		},
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'node',
					exclude: ['**/*.browser.test.ts', '**/node_modules/**'],
					typecheck: {
						enabled: true,
					},
				},
			},
			{
				// Real-browser tests for code that needs a DOM and layout (mounting
				// a chart, focus, tooltips) without booting the whole site.
				extends: true,
				test: {
					name: 'browser',
					include: ['**/*.browser.test.ts'],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						commands: { renderAstro },
						instances: [{ browser: 'chromium' }],
					},
				},
			},
		],
	},
});
