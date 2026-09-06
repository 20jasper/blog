import type { Page } from '@playwright/test';
import { ids } from '@src/views/citation-builder/ids';

// One place that turns each id into a locator, so every test grabs
// elements the same way instead of re-typing '#some-id' per spec.
export function getCitationBuilderElements(page: Page) {
	return {
		heading: page.locator(`#${ids.heading}`),
		intro: page.locator(`#${ids.intro}`),

		caseType: page.locator(`#${ids.caseType}`),
		party1: page.locator(`#${ids.party1}`),
		party2: page.locator(`#${ids.party2}`),
		party2Row: page.locator(`#${ids.party2Row}`),
		court: page.locator(`#${ids.court}`),
		volume: page.locator(`#${ids.volume}`),
		reporter: page.locator(`#${ids.reporter}`),
		firstPage: page.locator(`#${ids.firstPage}`),
		pincite: page.locator(`#${ids.pincite}`),
		year: page.locator(`#${ids.year}`),
		clearButton: page.locator(`#${ids.clearButton}`),
		output: page.locator(`#${ids.output}`),
	};
}
