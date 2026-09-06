import { expect, test } from '@playwright/test';
import { getCitationBuilderElements } from './citation-builder-elements';

// Scaffold-only for now -- grows alongside the form as it's built.
test('citation builder page loads with its heading', async ({ page }) => {
	await page.goto('/tools/citation-builder');
	const els = getCitationBuilderElements(page);

	await expect(els.heading).toHaveText('Bluebook 22 Citation Generator');
	await expect(els.intro).toHaveText(
		'Bluebook-formatted citations, one at a time.',
	);
});
