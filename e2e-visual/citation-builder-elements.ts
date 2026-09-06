import type { Page } from '@playwright/test';
import { ids } from '@components/citation-builder/view/ids';

// One place that turns each id into a locator, so every test grabs
// elements the same way instead of re-typing '#some-id' per spec.
export function getCitationBuilderElements(page: Page) {
	return {
		heading: page.locator(`#${ids.heading}`),
		intro: page.locator(`#${ids.intro}`),
	};
}
