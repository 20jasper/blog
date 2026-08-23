import { expect, test } from '@playwright/test';

// Baseline screenshots of the real blog post -- charts render inside the
// article's own max-w-prose column here, which is the width readers
// actually see (narrower than the wide test-fixtures page used by the
// other chart specs). animations: 'disabled' freezes CSS
// transitions/motion so a re-run doesn't diff on timing alone.
const POST_URL = '/blog/npm-min-release-age-detection-lag';

test('blog post full page matches its baseline', async ({ page }) => {
	await page.goto(POST_URL);
	await expect(page).toHaveScreenshot('blog-post-full-page.png', {
		fullPage: true,
		animations: 'disabled',
	});
});

test('threshold chart matches its baseline at article width', async ({
	page,
}) => {
	await page.goto(POST_URL);
	await expect(
		page.locator('figure', { has: page.locator('#chart-yank') }),
	).toHaveScreenshot('chart-yank-in-article.png', { animations: 'disabled' });
});

test('monthly detections chart matches its baseline at article width', async ({
	page,
}) => {
	await page.goto(POST_URL);
	await expect(
		page.locator('figure', {
			has: page.locator('#chart-monthly-detections'),
		}),
	).toHaveScreenshot('chart-monthly-detections-in-article.png', {
		animations: 'disabled',
	});
});
