import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// The generic per-route scan in site-snapshot.spec.ts already checks
// every page (including this one) on initial load, across every
// project (desktop/mobile/webkit/firefox) configured in
// playwright.docker.config.ts. These specs cover the states that scan
// can't see: interaction outcomes, and 200% zoom (§11.8).
test.describe('citation builder accessibility', () => {
	test('no axe violations after switching case type (Party 2 hidden)', async ({
		page,
	}) => {
		await page.goto('/tools/citation-builder');
		await page.getByLabel('Case type').selectOption('in-re');

		const results = await new AxeBuilder({ page }).analyze();
		expect(
			results.violations,
			JSON.stringify(results.violations, null, 2),
		).toEqual([]);
	});

	test('no axe violations after clearing the form', async ({ page }) => {
		await page.goto('/tools/citation-builder');
		await page.getByRole('button', { name: 'Clear' }).click();

		const results = await new AxeBuilder({ page }).analyze();
		expect(
			results.violations,
			JSON.stringify(results.violations, null, 2),
		).toEqual([]);
	});

	test('no horizontal scroll and no axe violations at 200% zoom', async ({
		page,
	}, testInfo) => {
		// §11.8 means desktop browser zoom (Ctrl/Cmd +), which reflows the
		// page. Mobile viewport emulation + the CSS `zoom` property used to
		// simulate it here doesn't model real pinch-zoom (which scales the
		// visual viewport without reflowing) -- confirmed by reproducing an
		// even larger "overflow" on /blog, an already-shipped page, with
		// the same technique. Skip rather than chase a phantom mobile fix.
		test.skip(
			testInfo.project.name.includes('mobile'),
			'CSS zoom reflow does not model real mobile pinch-zoom',
		);

		await page.goto('/tools/citation-builder');
		await page.evaluate(() => {
			document.documentElement.style.zoom = '2';
		});

		const hasHorizontalScroll = await page.evaluate(
			() =>
				document.documentElement.scrollWidth >
				document.documentElement.clientWidth,
		);
		expect(hasHorizontalScroll).toBe(false);

		const results = await new AxeBuilder({ page }).analyze();
		expect(
			results.violations,
			JSON.stringify(results.violations, null, 2),
		).toEqual([]);
	});
});
