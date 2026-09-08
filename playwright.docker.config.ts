import { defineConfig, devices } from '@playwright/test';

// Host rendering (fonts, subpixel metrics) differs from the Docker image
// CI actually uses, which has silently produced wrong baselines before.
if (process.env.RUNNING_IN_VISUAL_DOCKER !== 'true') {
	throw new Error(
		'Visual tests must run in Docker: pnpm run test:visual:docker (or :update).',
	);
}

export default defineConfig({
	testDir: './e2e-visual',
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
