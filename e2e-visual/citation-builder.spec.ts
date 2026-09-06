import { expect, test } from '@playwright/test';

test('citation builder page loads with its heading', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'Bluebook 22 Citation Generator',
	);
});

test('starts prefilled with a working example', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await expect(page.getByLabel('Party 1')).toHaveValue('Dayton');
	await expect(page.getByRole('status')).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('editing a field updates the output live', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await page.getByLabel('Pincite').fill('220');

	await expect(page.getByRole('status')).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 220 (Ohio Ct. App. 2021).',
	);
});

for (const caseType of ['in-re', 'ex-parte'] as const) {
	test(`case type ${caseType} hides and disables Party 2`, async ({ page }) => {
		await page.goto('/tools/citation-builder');

		await page.getByLabel('Case type').selectOption(caseType);

		const party2 = page.getByLabel('Party 2');
		await expect(party2).toBeHidden();
		await expect(party2).toBeDisabled();
	});
}

test('case type in-re renders the single-party citation', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await page.getByLabel('Case type').selectOption('in-re');

	await expect(page.getByRole('status')).toHaveText(
		'In re Dayton, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('switching back to v. restores Party 2', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	const caseType = page.getByLabel('Case type');
	await caseType.selectOption('in-re');
	await caseType.selectOption('v');

	const party2 = page.getByLabel('Party 2');
	await expect(party2).toBeVisible();
	await expect(party2).toBeEnabled();
	await expect(page.getByRole('status')).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('clear empties every field and shows the placeholder', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('button', { name: 'Clear' }).click();

	await expect(page.getByLabel('Party 1')).toHaveValue('');
	await expect(page.getByLabel('Volume')).toHaveValue('');
	await expect(page.getByRole('status')).toHaveText(
		'Fill in the fields above to generate a citation.',
	);
});

test('clear after switching case type resets Party 2 visibility too', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	const caseType = page.getByLabel('Case type');
	await caseType.selectOption('ex-parte');
	await page.getByRole('button', { name: 'Clear' }).click();

	await expect(caseType).toHaveValue('v');
	const party2 = page.getByLabel('Party 2');
	await expect(party2).toBeVisible();
	await expect(party2).toBeEnabled();
});

test('short form hides Court/First page/Year and shows Name variant + Id.', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Short form' }).check();

	await expect(page.getByLabel('Court')).toBeHidden();
	await expect(page.getByLabel('First page')).toBeHidden();
	await expect(page.getByLabel('Year')).toBeHidden();
	await expect(page.getByLabel('Name variant')).toBeVisible();
	await expect(
		page.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		}),
	).toBeVisible();
	await expect(page.getByRole('status')).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d at 214.',
	);
});

for (const [nameVariant, expected] of [
	['full', 'Dayton v. Stewart, 179 N.E.3d at 214.'],
	['party1', 'Dayton, 179 N.E.3d at 214.'],
	['party2', 'Stewart, 179 N.E.3d at 214.'],
	['none', '179 N.E.3d at 214.'],
] as const) {
	test(`short form name variant ${nameVariant}`, async ({ page }) => {
		await page.goto('/tools/citation-builder');

		await page.getByRole('radio', { name: 'Short form' }).check();
		await page.getByLabel('Name variant').selectOption(nameVariant);

		await expect(page.getByRole('status')).toHaveText(expected);
	});
}

test('Id. hides Name variant and renders Id. form', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Short form' }).check();
	await page
		.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		})
		.check();

	await expect(page.getByLabel('Name variant')).toBeHidden();
	await expect(page.getByRole('status')).toHaveText('Id. at 214.');
});

test('switching back to full citation restores Court/First page/Year', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Short form' }).check();
	await page.getByRole('radio', { name: 'Full citation' }).check();

	await expect(page.getByLabel('Court')).toBeVisible();
	await expect(page.getByLabel('First page')).toBeVisible();
	await expect(page.getByLabel('Year')).toBeVisible();
	await expect(page.getByRole('status')).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('clear resets mode, name variant, and Id. back to defaults', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Short form' }).check();
	await page.getByLabel('Name variant').selectOption('party2');
	const idCheckbox = page.getByRole('checkbox', {
		name: /immediately follows one to the same source/u,
	});
	await idCheckbox.check();
	await page.getByRole('button', { name: 'Clear' }).click();

	await expect(
		page.getByRole('radio', { name: 'Full citation' }),
	).toBeChecked();
	// Mode is back to full, so the row is legitimately hidden now --
	// includeHidden to still check the underlying checked state reset.
	await expect(
		page.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
			includeHidden: true,
		}),
	).not.toBeChecked();
	await expect(page.getByLabel('Court')).toBeVisible();
});
