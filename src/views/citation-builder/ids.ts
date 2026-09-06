// Single source of truth for element ids: the markup and the Playwright
// specs both import this, so a renamed id fails at compile time in
// whichever side forgot to update, instead of silently passing a
// selector that never matches. Grows alongside the form.
export const ids = {
	heading: 'citation-builder-heading',
	intro: 'citation-builder-intro',
} as const;

export type ElementIds = typeof ids;
