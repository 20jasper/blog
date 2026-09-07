import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// The generic per-route scan in site-snapshot.spec.ts already checks
// every page (including this one) on initial load, across every
// project (desktop/mobile/webkit/firefox) configured in
// playwright.docker.config.ts. These specs cover the states that scan
// can't see: interaction outcomes, and 200% zoom.
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
