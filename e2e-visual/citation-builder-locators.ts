import type { Page } from '@playwright/test';

export function getCitationBuilderLocators(page: Page) {
	return {
		caseType: page.getByLabel('Case type'),
		party1: page.getByLabel('Party 1'),
		party2: page.getByLabel('Party 2'),
		court: page.getByLabel('Court'),
		pincite: page.getByLabel('Pincite'),
		volume: page.getByRole('textbox', { name: 'Volume' }),
		reporter: page.getByLabel('Reporter'),
		firstPage: page.getByLabel('First page'),
		year: page.getByLabel('Decision year'),
		nameVariant: page.getByLabel('Name variant'),
		docket: page.getByLabel('Docket number'),
		databaseId: page.getByLabel('Database identifier'),
		month: page.getByLabel('Month decided'),
		day: page.getByLabel('Day decided'),
		popularName: page.getByLabel('Popular name'),
		title: page.getByLabel('Title'),
		code: page.getByLabel('Code abbreviation'),
		section: page.getByLabel('Section'),
		publisher: page.getByLabel('Publisher'),
		supplementDesignation: page.getByLabel('Supplement designation'),
		supplementYear: page.getByLabel('Supplement year'),
		idCheckbox: page.getByRole('checkbox', {
			name: /immediately follows one to the same source/u,
		}),
		output: page.getByRole('status'),
		clearButton: page.getByRole('button', { name: 'Clear' }),
		copyButton: page.getByRole('button', { name: /^Copy/u }),
		loadExampleButton: page.getByRole('button', { name: 'Load example' }),
	};
}
