import { expect, test } from '@playwright/test';

// Regression test for a real incident: a corrupted comment in the mdx source
// (prettier's mdx formatter mangling a multi-line {/* */} comment into an
// unterminated regex) broke the whole page build to a 500, silently taking
// every chart's axis labels down with it. The isolated chart-shape fixture
// at /test-fixtures/threshold-chart never imports the real mdx, so it can't
// catch this class of bug -- only loading the actual post can.
const CHART_IDS = ['chart-yank', 'chart-monthly-detections'];

test('blog post renders with axis labels on every chart', async ({ page }) => {
	const response = await page.goto('/blog/npm-min-release-age-detection-lag');
	expect(response?.status()).toBe(200);

	await Promise.all(
		CHART_IDS.map(async (id) => {
			const chart = page.locator(`#${id}`);
			await expect(chart.locator('svg')).toBeVisible();
			const texts = await chart.locator('svg text').allTextContents();
			expect(texts.some((t) => t.trim() !== '')).toBe(true);
		}),
	);
});
