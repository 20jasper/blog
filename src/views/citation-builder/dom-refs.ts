import { ids } from './ids';

// Ids exist only where HTML requires one (see ids.ts) -- everything else
// (radios, the Id. checkbox, buttons) is found by name/role/text at each
// call site instead. Centralized here so the view script's top isn't
// ~50 lines of querySelector calls before any actual logic starts.
export function queryFormRefs(form: HTMLFormElement) {
	return {
		caseTypeSelect: document.querySelector<HTMLSelectElement>(
			`#${ids.caseType}`,
		)!,
		party1Input: document.querySelector<HTMLInputElement>(`#${ids.party1}`)!,
		party2Input: document.querySelector<HTMLInputElement>(`#${ids.party2}`)!,
		courtInput: document.querySelector<HTMLInputElement>(`#${ids.court}`)!,
		pinciteInput: document.querySelector<HTMLInputElement>(`#${ids.pincite}`)!,
		volumeInput: document.querySelector<HTMLInputElement>(`#${ids.volume}`)!,
		reporterInput: document.querySelector<HTMLInputElement>(
			`#${ids.reporter}`,
		)!,
		firstPageInput: document.querySelector<HTMLInputElement>(
			`#${ids.firstPage}`,
		)!,
		yearInput: document.querySelector<HTMLInputElement>(`#${ids.year}`)!,
		docketNumberInput: document.querySelector<HTMLInputElement>(
			`#${ids.docketNumber}`,
		)!,
		databaseIdentifierInput: document.querySelector<HTMLInputElement>(
			`#${ids.databaseIdentifier}`,
		)!,
		monthSelect: document.querySelector<HTMLSelectElement>(`#${ids.month}`)!,
		dayInput: document.querySelector<HTMLInputElement>(`#${ids.day}`)!,
		dateYearInput: document.querySelector<HTMLInputElement>(
			`#${ids.dateYear}`,
		)!,
		nameVariantSelect: document.querySelector<HTMLSelectElement>(
			`#${ids.nameVariant}`,
		)!,
		idCheckbox: form.querySelector<HTMLInputElement>('input[name="id"]')!,
		codeAbbreviationInput: document.querySelector<HTMLInputElement>(
			`#${ids.codeAbbreviation}`,
		)!,
		sectionInput: document.querySelector<HTMLInputElement>(`#${ids.section}`)!,
		publisherInput: document.querySelector<HTMLInputElement>(
			`#${ids.publisher}`,
		)!,
		materialLocationSelect: document.querySelector<HTMLSelectElement>(
			`#${ids.materialLocation}`,
		)!,
		codeYearInput: document.querySelector<HTMLInputElement>(
			`#${ids.codeYear}`,
		)!,
		supplementDesignationInput: document.querySelector<HTMLInputElement>(
			`#${ids.supplementDesignation}`,
		)!,
		supplementYearInput: document.querySelector<HTMLInputElement>(
			`#${ids.supplementYear}`,
		)!,
	};
}

export type FormRefs = ReturnType<typeof queryFormRefs>;
