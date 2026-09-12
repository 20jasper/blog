import { defineConfig, devices } from '@playwright/test';

if (process.env.RUNNING_IN_VISUAL_DOCKER !== 'true') {
	throw new Error(
		'Fonts and OS rendering differ outside Docker, producing wrong baselines. Run: pnpm run test:visual:docker',
	);
}

export default defineConfig({
	testDir: './e2e-visual',
	workers: '100%',
	retries: process.env.GITHUB_ACTIONS === 'true' ? 2 : 0,
	webServer: {
		command: 'pnpm exec astro preview --port 4323 --host 0.0.0.0',
		url: 'http://localhost:4323/blog',
		reuseExistingServer: false,
		timeout: 60_000,
		// prevents daemonization when ran by AI agents
		env: { ASTRO_PREVIEW_BACKGROUND: 'false' },
	},
	use: {
		baseURL: 'http://localhost:4323',
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
	},
	expect: {
		timeout: 15_000,
	},
	projects: [
		{ name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
		{ name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
		{ name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
		{ name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } },
	],
});
