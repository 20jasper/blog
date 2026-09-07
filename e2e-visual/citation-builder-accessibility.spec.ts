import { expect, test, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

// site-snapshot.spec.ts already axe-scans every page on initial load.
async function expectNoAxeViolations(page: Page): Promise<void> {
	const { violations } = await new AxeBuilder({ page }).analyze();
	expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

test.describe('citation builder accessibility', () => {
	test('no axe violations after switching case type (Party 2 hidden)', async ({
		page,
	}) => {
		await page.goto('/tools/citation-builder');
		await page.getByLabel('Case type').selectOption('in-re');

		await expectNoAxeViolations(page);
	});

	test('no axe violations after clearing the form', async ({ page }) => {
		await page.goto('/tools/citation-builder');
		await page.getByRole('button', { name: 'Clear' }).click();

		await expectNoAxeViolations(page);
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

		await expectNoAxeViolations(page);
	});
});
