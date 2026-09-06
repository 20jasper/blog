import { expect, test } from '@playwright/test';
import { getCitationBuilderElements } from './citation-builder-elements';

// Scaffold-only for now -- grows alongside the form as it's built.
test('citation builder page loads with its heading', async ({ page }) => {
	await page.goto('/tools/citation-builder');
	const els = getCitationBuilderElements(page);

	await expect(els.heading).toHaveText('Bluebook Citation Generator');
	await expect(els.intro).toHaveText(
		'Citations formatted to Bluebook 22nd edition.',
	);
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

test('case type other than v. hides Party 2', async ({ page }) => {
	await page.goto('/tools/citation-builder');
	const els = getCitationBuilderElements(page);

	await els.caseType.selectOption('in-re');

	await expect(els.party2Row).toBeHidden();
	await expect(els.output).toHaveText(
		'In re Dayton, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
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
