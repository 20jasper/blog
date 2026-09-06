import { expect, test } from '@playwright/test';
import { getCitationBuilderElements } from './citation-builder-elements';

test('citation builder page loads with its heading', async ({ page }) => {
	await page.goto('/tools/citation-builder');
	const els = getCitationBuilderElements(page);

	await expect(els.heading).toHaveText('Bluebook 22 Citation Generator');
});

test('starts prefilled with a working example', async ({ page }) => {
	await page.goto('/tools/citation-builder');
	const els = getCitationBuilderElements(page);

	await expect(els.party1).toHaveValue('Dayton');
	await expect(els.output).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('editing a field updates the output live', async ({ page }) => {
	await page.goto('/tools/citation-builder');
	const els = getCitationBuilderElements(page);

	await els.pincite.fill('220');

	await expect(els.output).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 220 (Ohio Ct. App. 2021).',
	);
});

for (const caseType of ['in-re', 'ex-parte'] as const) {
	test(`case type ${caseType} hides and disables Party 2`, async ({ page }) => {
		await page.goto('/tools/citation-builder');
		const els = getCitationBuilderElements(page);

		await els.caseType.selectOption(caseType);

		await expect(els.party2Row).toBeHidden();
		await expect(els.party2).toBeDisabled();
	});
}

test('case type in-re renders the single-party citation', async ({ page }) => {
	await page.goto('/tools/citation-builder');
	const els = getCitationBuilderElements(page);

	await els.caseType.selectOption('in-re');

	await expect(els.output).toHaveText(
		'In re Dayton, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('switching back to v. restores Party 2', async ({ page }) => {
	await page.goto('/tools/citation-builder');
	const els = getCitationBuilderElements(page);

	await els.caseType.selectOption('in-re');
	await els.caseType.selectOption('v');

	await expect(els.party2Row).toBeVisible();
	await expect(els.party2).toBeEnabled();
	await expect(els.output).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('clear empties every field and shows the placeholder', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');
	const els = getCitationBuilderElements(page);

	await els.clearButton.click();

	await expect(els.party1).toHaveValue('');
	await expect(els.volume).toHaveValue('');
	await expect(els.output).toHaveText(
		'Fill in the fields above to generate a citation.',
	);
});

test('clear after switching case type resets Party 2 visibility too', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');
	const els = getCitationBuilderElements(page);

	await els.caseType.selectOption('ex-parte');
	await els.clearButton.click();

	await expect(els.caseType).toHaveValue('v');
	await expect(els.party2Row).toBeVisible();
	await expect(els.party2).toBeEnabled();
});
