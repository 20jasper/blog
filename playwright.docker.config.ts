import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './e2e-visual',
	webServer: {
		command: 'pnpm exec astro preview --port 4323 --host 0.0.0.0',
		url: 'http://localhost:4323/blog',
		reuseExistingServer: false,
		timeout: 60_000,
	},
	use: {
		baseURL: 'http://localhost:4323',
	},
	expect: {
		timeout: 15_000,
	},
});
