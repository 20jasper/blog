// oxlint-disable-next-line no-unnecessary-type-parameters
function field<T extends Element>(form: HTMLFormElement, name: string): T {
	// oxlint-disable-next-line no-unsafe-type-assertion
	return form.elements.namedItem(name) as T;
}

export function queryFormRefs(form: HTMLFormElement) {
	return {
		caseTypeSelect: field<HTMLSelectElement>(form, 'caseType'),
		party1Input: field<HTMLInputElement>(form, 'party1'),
		party2Input: field<HTMLInputElement>(form, 'party2'),
		courtInput: field<HTMLInputElement>(form, 'court'),
		pinciteInput: field<HTMLInputElement>(form, 'pincite'),
		volumeInput: field<HTMLInputElement>(form, 'volume'),
		reporterInput: field<HTMLInputElement>(form, 'reporter'),
		firstPageInput: field<HTMLInputElement>(form, 'firstPage'),
		yearInput: field<HTMLInputElement>(form, 'year'),
		nameVariantSelect: field<HTMLSelectElement>(form, 'nameVariant'),
		idCheckbox: field<HTMLInputElement>(form, 'id'),
	};
}

export type FormRefs = ReturnType<typeof queryFormRefs>;
