import { expect, test } from '@playwright/test';
import { getCitationBuilderLocators } from './citation-builder-locators';

test.beforeEach(async ({ page }) => {
	await page.goto('/tools/citation-builder');
});

test('starts prefilled with a working example', async ({ page }) => {
	const { party1, output } = getCitationBuilderLocators(page);

	await expect(party1).toHaveValue('Dayton');
	await expect(output).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('editing a field updates the output live', async ({ page }) => {
	const { pincite, output } = getCitationBuilderLocators(page);

	await pincite.fill('220');

	await expect(output).toContainText('220');
});

for (const [caseType, expectedName] of [
	['in-re', 'In re Dayton'],
	['ex-parte', 'Ex parte Dayton'],
] as const) {
	test(`case type ${caseType} disables Party 2 and renders the single-party name`, async ({
		page,
	}) => {
		const locators = getCitationBuilderLocators(page);

		await locators.caseType.selectOption(caseType);

		await expect(locators.party2).toBeVisible();
		await expect(locators.party2).toBeDisabled();
		await expect(locators.output).toContainText(expectedName);
	});
}

test('switching back to v. re-enables Party 2', async ({ page }) => {
	const { caseType, party2, output } = getCitationBuilderLocators(page);

	await caseType.selectOption('in-re');
	await caseType.selectOption('v');

	await expect(party2).toBeEnabled();
	await expect(output).toContainText('Dayton v. Stewart');
});

test('clear empties every field and shows the placeholder', async ({
	page,
}) => {
	const { clearButton, party1, volume, output } =
		getCitationBuilderLocators(page);

	await clearButton.click();

	await expect(party1).toHaveValue('');
	await expect(volume).toHaveValue('');
	await expect(output).toHaveText(
		'Fill in the fields above to generate a citation.',
	);
});

test('clear after switching case type re-enables Party 2 too', async ({
	page,
}) => {
	const { caseType, clearButton, party2 } = getCitationBuilderLocators(page);

	await caseType.selectOption('ex-parte');
	await clearButton.click();

	await expect(caseType).toHaveValue('v');
	await expect(party2).toBeEnabled();
});

test('short form disables Court/First page/Decision year, enables Name variant + Id.', async ({
	page,
}) => {
	const { court, firstPage, year, nameVariant, idCheckbox, output } =
		getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Short form' }).check();

	await expect(court).toBeDisabled();
	await expect(firstPage).toBeDisabled();
	await expect(year).toBeDisabled();
	await expect(nameVariant).toBeEnabled();
	await expect(idCheckbox).toBeEnabled();
	await expect(output).toContainText('at 214.');
});

for (const [nameVariant, expectedFragment] of [
	['full', 'Dayton v. Stewart'],
	['party1', 'Dayton,'],
	['party2', 'Stewart,'],
] as const) {
	test(`short form name variant ${nameVariant}`, async ({ page }) => {
		const locators = getCitationBuilderLocators(page);

		await page.getByRole('radio', { name: 'Short form' }).check();
		await locators.nameVariant.selectOption(nameVariant);

		await expect(locators.output).toContainText(expectedFragment);
	});
}

test('short form name variant none omits the name entirely', async ({
	page,
}) => {
	const { nameVariant, output } = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Short form' }).check();
	await nameVariant.selectOption('none');

	await expect(output).not.toContainText('Dayton');
	await expect(output).not.toContainText('Stewart');
	await expect(output).toContainText('179 N.E.3d at 214.');
});

test('Id. disables Name variant and renders Id. form', async ({ page }) => {
	const { nameVariant, idCheckbox, output } = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Short form' }).check();
	await idCheckbox.check();

	await expect(nameVariant).toBeDisabled();
	await expect(output).toContainText('Id.');
	await expect(output).toContainText('214');
});

test('Id. renders with only pincite filled, no volume/reporter/name needed', async ({
	page,
}) => {
	const { volume, reporter, party1, party2, idCheckbox, output } =
		getCitationBuilderLocators(page);

	await volume.fill('');
	await reporter.fill('');
	await party1.fill('');
	await party2.fill('');
	await page.getByRole('radio', { name: 'Short form' }).check();
	await idCheckbox.check();

	await expect(output).toContainText('Id.');
	await expect(output).toContainText('214');
});

test('short form name variant none renders with party1/party2 empty', async ({
	page,
}) => {
	const { party1, party2, nameVariant, output } =
		getCitationBuilderLocators(page);

	await party1.fill('');
	await party2.fill('');
	await page.getByRole('radio', { name: 'Short form' }).check();
	await nameVariant.selectOption('none');

	await expect(output).not.toContainText('Fill in the fields above');
	await expect(output).toContainText('214');
});

test('switching back to full citation re-enables Court/First page/Decision year', async ({
	page,
}) => {
	const { court, firstPage, year, output } = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Short form' }).check();
	await page.getByRole('radio', { name: 'Full citation' }).check();

	await expect(court).toBeEnabled();
	await expect(firstPage).toBeEnabled();
	await expect(year).toBeEnabled();
	await expect(output).toContainText('208, 214');
});

test('clear resets mode, name variant, and Id. back to defaults', async ({
	page,
}) => {
	const { nameVariant, idCheckbox, clearButton, court } =
		getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Short form' }).check();
	await nameVariant.selectOption('party2');
	await idCheckbox.check();
	await clearButton.click();

	await expect(
		page.getByRole('radio', { name: 'Full citation' }),
	).toBeChecked();
	await expect(idCheckbox).not.toBeChecked();
	await expect(court).toBeEnabled();
});

test('Copy stays enabled after clearing; native validation blocks the incomplete submit', async ({
	page,
}) => {
	const { clearButton, copyButton } = getCitationBuilderLocators(page);

	await expect(copyButton).toBeEnabled();

	await clearButton.click();

	await expect(copyButton).toBeEnabled();
	await copyButton.click();
	await expect(copyButton).toHaveText('Copy');
});

test('a non-numeric year fails native validity and blocks Copy', async ({
	page,
}) => {
	const { year, copyButton } = getCitationBuilderLocators(page);

	await year.fill('abc');

	const isValid = await year.evaluate((el: HTMLInputElement) =>
		el.checkValidity(),
	);
	expect(isValid).toBe(false);

	await copyButton.click();
	await expect(copyButton).toHaveText('Copy');
});

test('required fields show a "*" marker that updates with mode', async ({
	page,
}) => {
	await expect(page).toHaveScreenshot('required-markers-full.png', {
		fullPage: true,
		animations: 'disabled',
	});

	await page.getByRole('radio', { name: 'Short form' }).check();

	await expect(page).toHaveScreenshot('required-markers-short.png', {
		fullPage: true,
		animations: 'disabled',
	});
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
	const { copyButton } = getCitationBuilderLocators(page);

	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await copyButton.click();
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
	await expect(page.locator('output i')).toHaveText('Dayton v. Stewart');
	await expect(page.locator('output u')).toHaveCount(0);

	await page.getByRole('radio', { name: 'Underline' }).check();

	await expect(page.locator('output u')).toHaveText('Dayton v. Stewart');
	await expect(page.locator('output i')).toHaveCount(0);
});

test('En dash switches the pincite span separator', async ({ page }) => {
	const { pincite, output } = getCitationBuilderLocators(page);

	await pincite.fill('208-14');
	await expect(output).toContainText('208-14');

	await page.getByRole('radio', { name: 'En dash' }).check();

	await expect(output).toContainText('208–14');
});

test('Load example resets to the golden case', async ({ page }) => {
	const { pincite, loadExampleButton, output } =
		getCitationBuilderLocators(page);

	await pincite.fill('999');
	await loadExampleButton.click();

	await expect(pincite).toHaveValue('214');
	await expect(output).toHaveText(
		'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
	);
});

test('unreported case disables reported fields, enables docket/availability', async ({
	page,
}) => {
	const { volume, reporter, firstPage, docket, databaseId } =
		getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Unreported case' }).check();

	await expect(volume).toBeDisabled();
	await expect(reporter).toBeDisabled();
	await expect(firstPage).toBeDisabled();
	await expect(docket).toBeEnabled();
	await expect(databaseId).toBeEnabled();
});

test('unreported case, database availability, renders the star-paged long form', async ({
	page,
}) => {
	const {
		party1,
		party2,
		court,
		pincite,
		docket,
		databaseId,
		month,
		day,
		year,
		output,
	} = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await party1.fill('Beaven');
	await party2.fill('Justice');
	await court.fill('');
	await pincite.fill('');
	await docket.fill('03-84-JBC');
	await databaseId.fill('2007 WL 1032301');
	await month.selectOption('Mar.');
	await day.fill('30');
	await year.fill('2007');

	await expect(output).toHaveText(
		'Beaven v. Justice, No. 03-84-JBC, 2007 WL 1032301 (Mar. 30, 2007).',
	);
});

test('unreported case, slip availability, disables Database identifier', async ({
	page,
}) => {
	const { databaseId } = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByRole('radio', { name: 'Slip opinion only' }).check();

	await expect(databaseId).toBeDisabled();
});

test('unreported case, short form with Id., reuses Mode/Name variant/Id. controls', async ({
	page,
}) => {
	const { pincite, output } = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByRole('radio', { name: 'Short form' }).check();
	await page
		.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		})
		.check();
	await pincite.fill('2');

	await expect(output).toHaveText('Id. at *2.');
});

test('unreported case, short form, slip availability renders docket + slip op.', async ({
	page,
}) => {
	const { docket, pincite, nameVariant, output } =
		getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByRole('radio', { name: 'Slip opinion only' }).check();
	await page.getByRole('radio', { name: 'Short form' }).check();
	await nameVariant.selectOption('none');
	await docket.fill('1-07-2937');
	await pincite.fill('2');

	await expect(output).toHaveText('No. 1-07-2937, slip op. at 2.');
});

test('unreported case, online-only availability renders docket + slip op. + URL', async ({
	page,
}) => {
	const {
		party1,
		party2,
		court,
		docket,
		pincite,
		month,
		day,
		year,
		url,
		output,
	} = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByRole('radio', { name: 'Website only (no database)' }).check();
	await party1.fill("Macy's Inc.");
	await party2.fill('Martha Stewart Living Omnimedia, Inc.');
	await court.fill('');
	await docket.fill('1728');
	await pincite.fill('1');
	await month.selectOption('Feb.');
	await day.fill('26');
	await year.fill('2015');
	await url.fill(
		'http://www.nycourts.gov/reporter/3dseries/2015/2015_01728.htm',
	);

	await expect(output).toHaveText(
		"Macy's Inc. v. Martha Stewart Living Omnimedia, Inc., No. 1728, slip op. at 1 (Feb. 26, 2015), http://www.nycourts.gov/reporter/3dseries/2015/2015_01728.htm.",
	);
});

test('unreported case online-only availability requires the URL field', async ({
	page,
}) => {
	const { url } = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Unreported case' }).check();

	await expect(url).toBeDisabled();

	await page.getByRole('radio', { name: 'Website only (no database)' }).check();

	await expect(url).toBeEnabled();
});

test('switching back to reported re-enables Volume/Reporter/First page', async ({
	page,
}) => {
	const { volume, reporter, firstPage } = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Unreported case' }).check();
	await page.getByRole('radio', { name: 'Reported case', exact: true }).check();

	await expect(volume).toBeEnabled();
	await expect(reporter).toBeEnabled();
	await expect(firstPage).toBeEnabled();
});

test('statute disables case-identity and reported/unreported fields', async ({
	page,
}) => {
	const { party1, volume, docket, code, section } =
		getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Statute' }).check();

	await expect(party1).toBeDisabled();
	await expect(volume).toBeDisabled();
	await expect(docket).toBeDisabled();
	await expect(code).toBeEnabled();
	await expect(section).toBeEnabled();
});

test('statute, official code, main volume renders the 17 U.S.C. § 107 worked example', async ({
	page,
}) => {
	const { code, section, year, output } = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Statute' }).check();
	await code.fill('U.S.C.');
	await section.fill('107');
	await year.fill('2012');

	await expect(output).toHaveText('U.S.C. § 107 (2012).');
});

test('statute, original section number renders after the popular name', async ({
	page,
}) => {
	const { popularName, originalSection, code, section, year, output } =
		getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Statute' }).check();
	await popularName.fill(
		'Drug Price Competition and Patent Term Restoration Act',
	);
	await originalSection.fill('202');
	await code.fill('U.S.C.');
	await section.fill('271(e)');
	await year.fill('2012');

	await expect(output).toHaveText(
		'Drug Price Competition and Patent Term Restoration Act § 202, U.S.C. § 271(e) (2012).',
	);
});

test('statute, annotated code, requires and renders Publisher', async ({
	page,
}) => {
	const { code, section, year, publisher, output } =
		getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Statute' }).check();
	await page
		.getByRole('radio', { name: 'Annotated / unofficial code' })
		.check();
	await code.fill('U.S.C.A.');
	await section.fill('107');
	await year.fill('2015');
	await publisher.fill('West');

	await expect(publisher).toBeEnabled();
	await expect(output).toHaveText('U.S.C.A. § 107 (West 2015).');
});

test('statute, supplement-only material location, omits base year', async ({
	page,
}) => {
	const { code, section, year, supplementDesignation, supplementYear, output } =
		getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Statute' }).check();
	await page.getByRole('radio', { name: 'Supplement only' }).check();
	await code.fill('U.S.C.');
	await section.fill('107');
	await supplementDesignation.fill('Supp. I');
	await supplementYear.fill('2014');

	await expect(year).toBeDisabled();
	await expect(output).toHaveText('U.S.C. § 107 (Supp. I 2014).');
});

test('statute, short form, drops the parenthetical entirely', async ({
	page,
}) => {
	const { code, section, title, output } = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Statute' }).check();
	await page.getByRole('radio', { name: 'Short form' }).check();
	await title.fill('17');
	await code.fill('U.S.C.');
	await section.fill('107');

	await expect(output).toHaveText('17 U.S.C. § 107.');
});
