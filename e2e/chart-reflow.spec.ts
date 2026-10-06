import { expect, test } from '@playwright/test';

// Data tables are explicitly exempt from WCAG 1.4.10 Reflow (preserving
// row/column relationships can legitimately require horizontal scrolling), so
// the DataTable's own overflow-x-auto wrapper has to keep scrolling on its own
// at a 320px (400% zoom-equivalent) viewport.
test('the DataTable inside a chart can still scroll internally at 320px', async ({
	page,
}) => {
	await page.setViewportSize({ width: 320, height: 720 });
	await page.goto('/blog/npm-min-release-age-detection-lag');

	// Open the <details> disclosure so the table is actually laid out --
	// collapsed content reports scrollWidth 0, not "not overflowing".
	await page.locator('summary', { hasText: 'Show data table' }).first().click();
	const wrapper = page.locator('.overflow-x-auto').first();
	await expect(wrapper).toHaveCSS('overflow-x', 'auto');
});
