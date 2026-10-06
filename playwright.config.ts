import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e',
	webServer: {
		// --ignore-lock skips Astro's stale-lock check; CLAUDECODE must be
		// unset or Astro forces background mode and rejects --ignore-lock.
		command: 'pnpm astro dev --port 4322 --ignore-lock',
		// Root "/" 404s by design (no index.astro) -- probe a real route.
		url: 'http://localhost:4322/test-fixtures/threshold-chart',
		reuseExistingServer: process.env.CI === undefined,
		timeout: 120_000,
		env: { CLAUDECODE: '' },
	},
	use: {
		baseURL: 'http://localhost:4322',
	},
});
