import { expect, test } from '@playwright/test';
import { getCitationBuilderLocators } from './citation-builder-locators';

test.beforeEach(async ({ page }) => {
	await page.goto('/tools/citations/builder');
});

test('reported case golden path: signal, weight of authority, case history, italicized', async ({
	page,
}) => {
	const { signal, weightOfAuthority, historyPhrase, historyCitation, output } =
		getCitationBuilderLocators(page);

	await signal.selectOption('see');
	await weightOfAuthority.fill('Marshall, J., dissenting');
	await historyPhrase.selectOption('aff’d,');
	await historyCitation.fill('793 F.3d 1169 (10th Cir.)');

	await expect(output).toHaveText(
		'See Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021) (Marshall, J., dissenting), aff’d, 793 F.3d 1169 (10th Cir.).',
	);
	await expect(output.locator('i').first()).toHaveText('See');
	await expect(output.locator('i').last()).toHaveText('aff’d,');
});

test('unreported case golden path: database availability renders the star-paged long form', async ({
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

test('statute golden path: official code, main volume renders the 17 U.S.C. § 107 worked example', async ({
	page,
}) => {
	const { code, section, year, output } = getCitationBuilderLocators(page);

	await page.getByRole('radio', { name: 'Statute' }).check();
	await code.fill('U.S.C.');
	await section.fill('107');
	await year.fill('2012');

	await expect(output).toHaveText('U.S.C. § 107 (2012).');
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
