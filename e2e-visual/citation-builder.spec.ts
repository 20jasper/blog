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

// Deliberate departure from the "every field always visible" default
// (§3.5): Reported/Unreported/Statute are mutually exclusive per source
// type, so only the active one's fieldset (plus Case identity, shared by
// reported/unreported) is shown -- not just disabled. A value already
// typed into a hidden field is not lost (switching back reveals it
// still there), just not visible while it doesn't apply.
test('only the active source type’s fieldset is shown', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	const legend = (text: string) =>
		page.locator('legend', { hasText: new RegExp(`^${text}$`, 'u') });

	await expect(legend('Case identity')).toBeVisible();
	await expect(legend('Reported case')).toBeVisible();
	await expect(legend('Unreported case')).toBeHidden();
	await expect(legend('Statute')).toBeHidden();

	await page.getByLabel('Volume').fill('999');
	await page.getByRole('radio', { name: 'Unreported case' }).check();

	await expect(legend('Case identity')).toBeVisible();
	await expect(legend('Reported case')).toBeHidden();
	await expect(legend('Unreported case')).toBeVisible();
	await expect(legend('Statute')).toBeHidden();

	await page.getByRole('radio', { name: 'Statute' }).check();

	await expect(legend('Case identity')).toBeHidden();
	await expect(legend('Reported case')).toBeHidden();
	await expect(legend('Unreported case')).toBeHidden();
	await expect(legend('Statute')).toBeVisible();

	// Switching back to reported: the value typed earlier is still there,
	// it was hidden, not lost.
	await page.getByRole('radio', { name: 'Reported case', exact: true }).check();
	await expect(page.getByLabel('Volume')).toHaveValue('999');
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

// ReportedShortFormInput's 'id' variant needs only pincite -- no volume,
// reporter, or name -- so Id. should render even with those fields empty.
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

// Mode applies to both source types now -- unreported short form is
// wired (assembleUnreportedShortForm), so Mode stays enabled and
// Court/Month/Day/Opinion year (unreported-full-only) disable instead.
test('unreported + short form disables Court/Month/Day/Opinion year, enables Docket per availability', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByRole('radio', { name: 'Short form' }).check();

	await expect(page.getByRole('radio', { name: 'Short form' })).toBeEnabled();
	await expect(page.getByLabel('Court')).toBeDisabled();
	await expect(page.getByLabel('Month')).toBeDisabled();
	await expect(page.getByLabel('Day')).toBeDisabled();
	await expect(page.getByLabel('Opinion year')).toBeDisabled();
	// Database is the default availability -- short form under database
	// carries the database id instead of the docket (§5.8).
	await expect(page.getByLabel('Docket number')).toBeDisabled();
	await expect(page.getByLabel('Database identifier')).toBeEnabled();
});

test('unreported + short form + slip opinion enables Docket, disables Database identifier', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByRole('radio', { name: 'Short form' }).check();
	await page.getByRole('radio', { name: 'Slip opinion only' }).check();

	await expect(page.getByLabel('Docket number')).toBeEnabled();
	await expect(page.getByLabel('Database identifier')).toBeDisabled();
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

async function fillUnreportedChatlas(page: Page) {
	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByLabel('Party 1').fill('Chatlas');
	await page.getByLabel('Party 2').fill('Allstate Ins. Co.');
	await page.getByLabel('Docket number').fill('1-07-2937');
	await page.getByLabel('Database identifier').fill('2008 WL 2610471');
	await page.getByLabel('Pincite').fill('2');
	await page.getByRole('radio', { name: 'Short form' }).check();
}

test('unreported short form, database availability matches the Chatlas golden pair', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await fillUnreportedChatlas(page);

	await expect(page.getByRole('status')).toHaveText(
		'Chatlas v. Allstate Ins. Co., 2008 WL 2610471, at *2.',
	);
});

test('unreported short form, slip opinion drops the star and uses the docket', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await fillUnreportedChatlas(page);
	await page.getByRole('radio', { name: 'Slip opinion only' }).check();

	await expect(page.getByRole('status')).toHaveText(
		'Chatlas v. Allstate Ins. Co., No. 1-07-2937, slip op. at 2.',
	);
});

for (const [nameVariant, expected] of [
	['full', 'Chatlas v. Allstate Ins. Co., No. 1-07-2937, slip op. at 2.'],
	['party1', 'Chatlas, No. 1-07-2937, slip op. at 2.'],
	['party2', 'Allstate Ins. Co., No. 1-07-2937, slip op. at 2.'],
	['none', 'No. 1-07-2937, slip op. at 2.'],
] as const) {
	test(`unreported short form name variant ${nameVariant}`, async ({
		page,
	}) => {
		await page.goto('/tools/citation-builder');

		await fillUnreportedChatlas(page);
		await page.getByRole('radio', { name: 'Slip opinion only' }).check();
		await page.getByLabel('Name variant').selectOption(nameVariant);

		await expect(page.getByRole('status')).toHaveText(expected);
	});
}

test('unreported short form Id. renders Id. with no star (slip opinion)', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await fillUnreportedChatlas(page);
	await page.getByRole('radio', { name: 'Slip opinion only' }).check();
	await page
		.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		})
		.check();

	await expect(page.getByRole('status')).toHaveText('Id. at 2.');
});

test('unreported short form Id. renders Id. with the star (database)', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await fillUnreportedChatlas(page);
	await page
		.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		})
		.check();

	await expect(page.getByRole('status')).toHaveText('Id. at *2.');
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
	// Clear resets sourceType to reported, which hides the Unreported
	// fieldset entirely -- switch back to it to inspect the reset values.
	await page.getByRole('radio', { name: 'Unreported case' }).check();

	await expect(
		page.getByRole('radio', { name: 'In electronic database' }),
	).toBeChecked();
	await expect(page.getByLabel('Docket number')).toHaveValue('');
	await expect(page.getByLabel('Database identifier')).toHaveValue('');
	await expect(page.getByLabel('Day')).toHaveValue('');
	await expect(page.getByLabel('Opinion year')).toHaveValue('');
});

// Copy is a submit button now (r[ui.error-association] simplified to
// native HTML required-field validation rather than a hand-rolled
// banner) -- it stays enabled so clicking it while required fields are
// empty triggers the browser's own "please fill out this field" UI
// instead of doing nothing.
test('Copy stays enabled after clearing; native validation blocks the incomplete submit', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	const copyButton = page.getByRole('button', { name: /^Copy/u });
	await expect(copyButton).toBeEnabled();

	await page.getByRole('button', { name: 'Clear' }).click();

	await expect(copyButton).toBeEnabled();
	await copyButton.click();
	// Native constraint validation cancels the submit before our
	// handler runs, so the label never advances past "Copy".
	await expect(copyButton).toHaveText('Copy');
});

// Fuzz-discovered (state/citation-input-builders.test.ts): a non-numeric
// year used to silently coerce to NaN. The fix added pattern="[0-9]+" to
// the numeric fields -- this confirms the browser itself now rejects it
// via checkValidity(), not just the pure builder function.
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

test('required fields show a "*" marker that updates with source type and mode', async ({
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

// text/html + text/plain (§5.11) -- clipboard permission grants only work
// reliably on Chromium in Playwright, so this is chromium-only rather
// than a cross-browser guess.
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
	// Wait for the async clipboard write to actually finish before
	// reading it back, rather than racing it.
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
	await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
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

test('example buttons load their golden case', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await page
		.getByRole('button', { name: 'State v. Lucko (unreported)' })
		.click();

	await expect(
		page.getByRole('radio', { name: 'Unreported case' }),
	).toBeChecked();
	await expect(page.getByRole('status')).toHaveText(
		'State v. Lucko, No. 2021CA0007, 2021 WL 4269952, at *1-2 (Ohio Ct. App. Sept. 17, 2021).',
	);

	await page
		.getByRole('button', { name: 'Dayton v. Stewart (reported)' })
		.click();

	await expect(
		page.getByRole('radio', { name: 'Reported case', exact: true }),
	).toBeChecked();
	await expect(page.getByRole('status')).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);

	await page
		.getByRole('button', { name: 'Ohio Rev. Code Ann. (statute)' })
		.click();

	await expect(page.getByRole('radio', { name: 'Statute' })).toBeChecked();
	await expect(page.getByRole('status')).toHaveText(
		'Ohio Rev. Code Ann. § 3767.32(A) (West 2025).',
	);
});

test('statute short form drops the entire parenthetical', async ({ page }) => {
	await page.goto('/tools/citation-builder');

	await page
		.getByRole('button', { name: 'Ohio Rev. Code Ann. (statute)' })
		.click();
	await page.getByRole('radio', { name: 'Short form' }).check();

	await expect(page.getByLabel('Name variant')).toBeDisabled();
	await expect(
		page.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		}),
	).toBeDisabled();
	await expect(page.getByRole('status')).toHaveText(
		'Ohio Rev. Code Ann. § 3767.32(A).',
	);
});

test('statute code type toggles Publisher required/disabled', async ({
	page,
}) => {
	await page.goto('/tools/citation-builder');

	await page
		.getByRole('button', { name: 'Ohio Rev. Code Ann. (statute)' })
		.click();

	const publisher = page.getByLabel('Publisher');
	await expect(publisher).toBeEnabled();
	await expect(page.getByRole('status')).toHaveText(
		'Ohio Rev. Code Ann. § 3767.32(A) (West 2025).',
	);

	await page.getByRole('radio', { name: 'Official code', exact: true }).check();

	await expect(publisher).toBeDisabled();
	await expect(page.getByRole('status')).toHaveText(
		'Ohio Rev. Code Ann. § 3767.32(A) (2025).',
	);
});

for (const [materialLocation, expected] of [
	['main-volume', 'Ohio Rev. Code Ann. § 3767.32(A) (West 2025).'],
	['both', 'Ohio Rev. Code Ann. § 3767.32(A) (West 2025 & Supp. V 1999).'],
	['supplement-only', 'Ohio Rev. Code Ann. § 3767.32(A) (West Supp. V 1999).'],
] as const) {
	test(`material location ${materialLocation} produces the right parenthetical`, async ({
		page,
	}) => {
		await page.goto('/tools/citation-builder');

		await page
			.getByRole('button', { name: 'Ohio Rev. Code Ann. (statute)' })
			.click();
		await page.getByLabel('Material location').selectOption(materialLocation);

		const codeYear = page.getByLabel('Code edition year');
		const supplementDesignation = page.getByLabel('Supplement designation');
		const supplementYear = page.getByLabel('Supplement year');

		if (materialLocation === 'supplement-only') {
			await expect(codeYear).toBeDisabled();
		} else {
			await expect(codeYear).toBeEnabled();
		}

		if (materialLocation === 'main-volume') {
			await expect(supplementDesignation).toBeDisabled();
			await expect(supplementYear).toBeDisabled();
		} else {
			await supplementDesignation.fill('Supp. V');
			await supplementYear.fill('1999');
		}

		await expect(page.getByRole('status')).toHaveText(expected);
	});
}
