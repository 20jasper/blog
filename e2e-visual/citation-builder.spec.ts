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
	test(`case type ${caseType} disables Party 2, never hides it`, async ({
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

test('Id. renders with only pincite filled, no volume/reporter/name needed', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByLabel('Volume').fill('');
	await page.getByLabel('Reporter').fill('');
	await page.getByLabel('Party 1', { exact: false }).fill('');
	await page.getByRole('radio', { name: 'Short form' }).check();
	await page
		.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		})
		.check();

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

test('Copy stays enabled after clearing; native validation blocks the incomplete submit', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	const copyButton = page.getByRole('button', { name: /^Copy/u });
	await expect(copyButton).toBeEnabled();

	await page.getByRole('button', { name: 'Clear' }).click();

	await expect(copyButton).toBeEnabled();
	await copyButton.click();
	await expect(copyButton).toHaveText('Copy');
});

test('a non-numeric year fails native validity and blocks Copy', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByLabel('Decision year').fill('abc');

	const isValid = await page
		.getByLabel('Decision year')
		.evaluate((el: HTMLInputElement) => el.checkValidity());
	expect(isValid).toBe(false);

	const copyButton = page.getByRole('button', { name: /^Copy/u });
	await copyButton.click();
	await expect(copyButton).toHaveText('Copy');
});

test('required fields show a "*" marker that updates with mode', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	const partyLabel = page.locator('label', { hasText: 'Party 1' });
	const courtLabel = page.locator('label', { hasText: 'Court' });
	await expect(partyLabel.locator('.required-marker')).toBeVisible();
	await expect(courtLabel.locator('.required-marker')).toBeHidden();

	const pinciteLabel = page.locator('label', { hasText: 'Pincite' });
	await expect(pinciteLabel.locator('.required-marker')).toBeHidden();

	await page.getByRole('radio', { name: 'Short form' }).check();

	await expect(pinciteLabel.locator('.required-marker')).toBeVisible();
});

test('Copy writes both text/html and text/plain to the clipboard', async ({
	page,
	context,
	browserName,
}) => {
	test.skip(
		browserName !== 'chromium',
		'clipboard permissions are chromium-only here',
	);
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('/tools/citation-builder');

	await page.getByRole('button', { name: /^Copy/u }).click();
	await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();

	const clipboard = await page.evaluate(async () => {
		const [item] = await navigator.clipboard.read();
		if (item === undefined) {
			throw new Error('clipboard is empty');
		}
		return {
			plain: await (await item.getType('text/plain')).text(),
			html: await (await item.getType('text/html')).text(),
		};
	});

	expect(clipboard.plain).toBe(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
	expect(clipboard.html).toBe(
		'<i>Dayton v. Stewart</i>, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('Underline switches the case name from <i> to <u>', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await expect(page.locator('output i')).toHaveText('Dayton v. Stewart');
	await expect(page.locator('output u')).toHaveCount(0);

	await page.getByRole('radio', { name: 'Underline' }).check();

	await expect(page.locator('output u')).toHaveText('Dayton v. Stewart');
	await expect(page.locator('output i')).toHaveCount(0);
});

test('En dash switches the pincite span separator', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await page.getByLabel('Pincite').fill('208-14');
	await expect(page.getByRole('status')).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 208-14 (Ohio Ct. App. 2021).',
	);

	await page.getByRole('radio', { name: 'En dash' }).check();

	await expect(page.getByRole('status')).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 208–14 (Ohio Ct. App. 2021).',
	);
});

test('Load example resets to the golden case', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await page.getByLabel('Pincite').fill('999');
	await page.getByRole('button', { name: 'Load example' }).click();

	await expect(page.getByLabel('Pincite')).toHaveValue('214');
	await expect(page.getByRole('status')).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});
