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
