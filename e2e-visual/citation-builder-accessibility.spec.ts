import { test } from '@playwright/test';
import { expectNoAxeViolations } from './axe';
import { getCitationBuilderLocators } from './citation-builder-locators';
import { expectNoHorizontalScroll, zoomTo } from './zoom';

// site-snapshot.spec.ts already axe-scans every page on initial load.

test.beforeEach(async ({ page }) => {
	await page.goto('/tools/citation-builder');
});

test.describe('citation builder accessibility', () => {
	test('no axe violations after switching case type (Party 2 hidden)', async ({
		page,
	}) => {
		const { caseType } = getCitationBuilderLocators(page);

		await caseType.selectOption('in-re');

		await expectNoAxeViolations(page);
	});

	test('no axe violations after clearing the form', async ({ page }) => {
		const { clearButton } = getCitationBuilderLocators(page);

		await clearButton.click();

		await expectNoAxeViolations(page);
	});

	test('no horizontal scroll and no axe violations at 200% zoom', async ({
		page,
	}, testInfo) => {
		test.skip(
			testInfo.project.name.includes('mobile'),
			'CSS zoom reflow does not model real mobile pinch-zoom',
		);

		await zoomTo(page, 2);
		await expectNoHorizontalScroll(page);
		await expectNoAxeViolations(page);
	});
});
