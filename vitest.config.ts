/// <reference types="vitest/config" />
import { playwright } from '@vitest/browser-playwright';
import { getViteConfig } from 'astro/config';
import { astroComponentStubs, renderAstro } from './test/astro-renderer';

export default getViteConfig({
	plugins: [astroComponentStubs()],
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
						commands: { renderAstro },
						instances: [{ browser: 'chromium' }],
					},
				},
			},
		],
	},
});
