import { expect, test } from '@playwright/test';
// oxlint-disable-next-line no-named-as-default
import AxeBuilder from '@axe-core/playwright';

test('chart test fixture has no color-contrast violations', async ({
	page,
}) => {
	await page.goto('/test-fixtures/threshold-chart');

	const results = await new AxeBuilder({ page })
		.withRules(['color-contrast'])
		.analyze();

	expect(
		results.violations,
		JSON.stringify(results.violations, null, 2),
	).toEqual([]);
});
