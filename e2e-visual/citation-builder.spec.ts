import { expect, test, type Page } from '@playwright/test';

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
	test(`case type ${caseType} disables Party 2 (never hides it, §3.5)`, async ({
		page,
	}) => {
		await page.goto('/tools/citation-builder');

		await page.getByLabel('Case type').selectOption(caseType);

		const party2 = page.getByLabel('Party 2');
		await expect(party2).toBeVisible();
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

test('switching back to v. re-enables Party 2', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	const caseType = page.getByLabel('Case type');
	await caseType.selectOption('in-re');
	await caseType.selectOption('v');

	await expect(page.getByLabel('Party 2')).toBeEnabled();
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

test('clear after switching case type re-enables Party 2 too', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	const caseType = page.getByLabel('Case type');
	await caseType.selectOption('ex-parte');
	await page.getByRole('button', { name: 'Clear' }).click();

	await expect(caseType).toHaveValue('v');
	await expect(page.getByLabel('Party 2')).toBeEnabled();
});

test('short form disables Court/First page/Decision year, enables Name variant + Id.', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Short form' }).check();

	await expect(page.getByLabel('Court')).toBeDisabled();
	await expect(page.getByLabel('First page')).toBeDisabled();
	await expect(page.getByLabel('Decision year')).toBeDisabled();
	await expect(page.getByLabel('Name variant')).toBeEnabled();
	await expect(
		page.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		}),
	).toBeEnabled();
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

test('Id. disables Name variant and renders Id. form', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Short form' }).check();
	await page
		.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		})
		.check();

	await expect(page.getByLabel('Name variant')).toBeDisabled();
	await expect(page.getByRole('status')).toHaveText('Id. at 214.');
});

test('switching back to full citation re-enables Court/First page/Decision year', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Short form' }).check();
	await page.getByRole('radio', { name: 'Full citation' }).check();

	await expect(page.getByLabel('Court')).toBeEnabled();
	await expect(page.getByLabel('First page')).toBeEnabled();
	await expect(page.getByLabel('Decision year')).toBeEnabled();
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
	await expect(idCheckbox).not.toBeChecked();
	await expect(page.getByLabel('Court')).toBeEnabled();
});

async function fillUnreportedLucko(page: Page) {
	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByLabel('Party 1').fill('State');
	await page.getByLabel('Party 2').fill('Lucko');
	await page.getByLabel('Court (abbreviated)').fill('Ohio Ct. App.');
	await page.getByLabel('Docket number').fill('2021CA0007');
	await page.getByLabel('Database identifier').fill('2021 WL 4269952');
	await page.getByLabel('Month').selectOption('Sept.');
	await page.getByLabel('Day').fill('17');
	await page.getByLabel('Opinion year').fill('2021');
}

test('unreported case type enables its fields and disables reported/citation-form ones', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Unreported case' }).check();

	await expect(page.getByLabel('Volume')).toBeDisabled();
	await expect(page.getByLabel('Docket number')).toBeEnabled();
	await expect(
		page.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		}),
	).toBeDisabled();
});

// Regression: Mode radios weren't disabled for unreported, so picking
// "Short form" while unreported silently did nothing (unreported output
// never checks mode) -- gap in sourceType x mode coverage.
test('unreported case type disables Mode and forces it back to Full citation', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Short form' }).check();
	await page.getByRole('radio', { name: 'Unreported case' }).check();

	await expect(
		page.getByRole('radio', { name: 'Full citation' }),
	).toBeChecked();
	await expect(
		page.getByRole('radio', { name: 'Full citation' }),
	).toBeDisabled();
	await expect(page.getByRole('radio', { name: 'Short form' })).toBeDisabled();
});

test('switching back to reported re-enables Mode', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByRole('radio', { name: 'Reported case', exact: true }).check();

	await expect(
		page.getByRole('radio', { name: 'Full citation' }),
	).toBeEnabled();
	await expect(page.getByRole('radio', { name: 'Short form' })).toBeEnabled();
});

test('unreported database availability matches the Lucko golden case', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await fillUnreportedLucko(page);

	await expect(page.getByRole('status')).toHaveText(
		'State v. Lucko, No. 2021CA0007, 2021 WL 4269952, at *214 (Ohio Ct. App. Sept. 17, 2021).',
	);
});

test('unreported slip opinion disables Database identifier and drops the star', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await fillUnreportedLucko(page);
	await page.getByRole('radio', { name: 'Slip opinion only' }).check();

	await expect(page.getByLabel('Database identifier')).toBeDisabled();
	await expect(page.getByRole('status')).toHaveText(
		'State v. Lucko, No. 2021CA0007, slip op. at 214 (Ohio Ct. App. Sept. 17, 2021).',
	);
});

// Gap: caseType x sourceType=unreported was never exercised through the
// UI (only through 'v' via the Lucko fixture) -- single-party unreported
// citations were only unit-tested at the domain level, not wired end to
// end.
test('unreported case type in-re renders the single-party citation', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await fillUnreportedLucko(page);
	await page.getByLabel('Case type').selectOption('in-re');

	await expect(page.getByRole('status')).toHaveText(
		'In re State, No. 2021CA0007, 2021 WL 4269952, at *214 (Ohio Ct. App. Sept. 17, 2021).',
	);
});

// Gap: caseType x short-form Name variant -- the domain already collapses
// party1/party2 to the same assembled name for single-party case types,
// but that path was never driven through the actual <select>.
for (const nameVariant of ['party1', 'party2'] as const) {
	test(`short form name variant ${nameVariant} collapses for in-re`, async ({
		page,
	}) => {
		await page.goto('/tools/citation-builder');

		await page.getByLabel('Case type').selectOption('in-re');
		await page.getByRole('radio', { name: 'Short form' }).check();
		await page.getByLabel('Name variant').selectOption(nameVariant);

		await expect(page.getByRole('status')).toHaveText(
			'In re Dayton, 179 N.E.3d at 214.',
		);
	});
}

test('switching back to reported re-enables its fields and disables unreported ones', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByRole('radio', { name: 'Reported case', exact: true }).check();

	await expect(page.getByLabel('Volume')).toBeEnabled();
	await expect(page.getByLabel('Docket number')).toBeDisabled();
	await expect(page.getByRole('status')).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('clear resets source type back to reported', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByRole('button', { name: 'Clear' }).click();

	await expect(
		page.getByRole('radio', { name: 'Reported case', exact: true }),
	).toBeChecked();
	await expect(page.getByLabel('Volume')).toBeEnabled();
});

// Gap: the general "clear empties every field" test only checked
// Party1/Volume (reported fields). Never confirmed unreported-only
// fields or the Availability radio actually reset too.
test('clear empties unreported fields and resets Availability to database', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await fillUnreportedLucko(page);
	await page.getByRole('radio', { name: 'Slip opinion only' }).check();
	await page.getByRole('button', { name: 'Clear' }).click();

	await expect(
		page.getByRole('radio', { name: 'In electronic database' }),
	).toBeChecked();
	await expect(page.getByLabel('Docket number')).toHaveValue('');
	await expect(page.getByLabel('Database identifier')).toHaveValue('');
	await expect(page.getByLabel('Day')).toHaveValue('');
	await expect(page.getByLabel('Opinion year')).toHaveValue('');
});
