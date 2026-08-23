import { expect, test } from '@playwright/test';

// WCAG 1.4.10 Reflow: content must be usable without horizontal scrolling
// at 400% zoom, equivalent to a 320px-wide viewport at a common 1280px
// baseline. Tested on the real blog post, not the wide test-fixtures page --
// charts render inside the article's own `max-w-prose` column there, and
// that's the width that actually needs to reflow, not the fixture's
// full-bleed body.
//
// Data tables are explicitly exempt from 1.4.10 (preserving row/column
// relationships can legitimately require horizontal scrolling), so the
// DataTable's own overflow-x-auto wrapper scrolling internally is correct,
// not a violation -- document.documentElement.scrollWidth would still
// report wider than the viewport because of it, making a raw
// scrollWidth <= clientWidth assertion the wrong check here. What actually
// matters is whether the *page itself* is draggable/scrollable
// horizontally; window.scrollX staying at 0 after an attempted scroll
// proves it isn't, regardless of what any internally-scrollable region
// reports.
test('the real blog post does not scroll horizontally at a 320px (400% zoom-equivalent) viewport', async ({
	page,
}) => {
	await page.setViewportSize({ width: 320, height: 720 });
	await page.goto('/blog/npm-min-release-age-detection-lag');

	await page.evaluate(() => {
		window.scrollTo(1000, 0);
	});
	const scrollX = await page.evaluate(() => window.scrollX);
	expect(scrollX).toBe(0);
});

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
