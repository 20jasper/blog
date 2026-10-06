import { expect, test, type Page } from '@playwright/test';

// Regression coverage for BASE_FONT_PX (chart-utils.ts): it has to track the
// user's actual root font-size (browser zoom, OS/browser "larger text"
// accessibility settings), not a hardcoded px number -- otherwise text-only
// zoom would repaint tick labels larger via CSS while the library's own
// layout math kept reserving margin for the old, smaller size, clipping or
// overlapping labels.
//
// Simulated by rewriting the HTML response to inject a root font-size
// override, rather than page.addInitScript -- Astro's chart script runs as
// an early module, before addInitScript's callback ever gets a chance to
// run (document.documentElement is still null at that point in this setup,
// confirmed empirically). Rewriting the response body guarantees the
// override is present in the markup itself before the parser reaches any
// script, which is also a closer match for how a real browser zoom or
// OS-level text-size setting actually applies -- before the page starts
// loading at all, not raced against it.
const DEFAULT_ROOT_PX = 16;
const ZOOMED_ROOT_PX = 32;

async function zoomRootFontSize(page: Page, px: number) {
	await page.route('**/test-fixtures/threshold-chart', async (route) => {
		const response = await route.fetch();
		const body = (await response.text()).replace(
			'<head>',
			`<head><style>html{font-size:${px}px}</style>`,
		);
		await route.fulfill({ response, body });
	});
}

test('tick labels are readable at default root font-size', async ({ page }) => {
	await page.goto('/test-fixtures/threshold-chart');

	const tick = page
		.locator('#chart-yank [data-ts-key^="x-tick-label"]')
		.first();
	await expect(tick).toHaveAttribute('font-size', String(DEFAULT_ROOT_PX));
	await expect(tick).toHaveCSS('font-size', `${DEFAULT_ROOT_PX}px`);
});

test('zooming the root font-size scales both the painted text and the layout math that reserves room for it', async ({
	page,
}) => {
	await zoomRootFontSize(page, ZOOMED_ROOT_PX);
	await page.goto('/test-fixtures/threshold-chart');

	// The library's own `tickLabels.fontSize` option -- this is what its
	// internal margin-reservation math actually sees, so this attribute
	// scaling confirms BASE_FONT_PX re-derived correctly, not just that CSS
	// happened to repaint something larger.
	const xTick = page
		.locator('#chart-yank [data-ts-key^="x-tick-label"]')
		.first();
	const yTick = page
		.locator('#chart-yank [data-ts-key^="y-tick-label"]')
		.first();
	await expect(xTick).toHaveAttribute('font-size', String(ZOOMED_ROOT_PX));
	await expect(yTick).toHaveAttribute('font-size', String(ZOOMED_ROOT_PX));

	// What's actually painted -- CSS still wins the cascade over the SVG
	// attribute above, so this is the real rendered size a reader sees.
	await expect(xTick).toHaveCSS('font-size', `${ZOOMED_ROOT_PX}px`);
	await expect(yTick).toHaveCSS('font-size', `${ZOOMED_ROOT_PX}px`);

	// Axis titles have no fontSize option at all (docs/tanstack-charts-
	// feedback.md item 4) -- CSS is their only sizing path, so this proves
	// --text-base itself (not just BASE_FONT_PX) tracked the root change.
	const xLabel = page.locator('#chart-yank [data-ts-key="x-label"]');
	await expect(xLabel).toHaveCSS('font-size', `${ZOOMED_ROOT_PX}px`);
});
