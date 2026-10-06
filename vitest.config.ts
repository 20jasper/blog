/// <reference types="vitest/config" />
import { playwright } from '@vitest/browser-playwright';
import { getViteConfig } from 'astro/config';
import { astroRenderer } from 'vitest-browser-astro/plugin';

export default getViteConfig({
	plugins: [astroRenderer()],
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
				extends: true,
				test: {
					name: 'browser',
					include: ['**/*.browser.test.ts'],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }],
					},
				},
			},
		],
	},
});
