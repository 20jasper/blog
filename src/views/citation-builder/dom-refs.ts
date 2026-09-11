// oxlint-disable-next-line no-unnecessary-type-parameters
function field<T extends Element>(form: HTMLFormElement, name: string): T {
	// oxlint-disable-next-line no-unsafe-type-assertion
	return form.elements.namedItem(name) as T;
}

export function queryButtonRefs() {
	return {
		loadExampleButton: document.querySelector<HTMLButtonElement>(
			'#load-example-button',
		)!,
		exampleSelect: document.querySelector<HTMLSelectElement>('#example')!,
		clearButton: document.querySelector<HTMLButtonElement>('#clear-button')!,
		copyButton: document.querySelector<HTMLButtonElement>('#copy-button')!,
		saveButton: document.querySelector<HTMLButtonElement>('#save-button')!,
		saveStatus: document.querySelector<HTMLElement>('#save-status')!,
	};
}

export function queryFormRefs(form: HTMLFormElement) {
	return {
		caseTypeSelect: field<HTMLSelectElement>(form, 'caseType'),
		party1Input: field<HTMLInputElement>(form, 'party1'),
		party2Input: field<HTMLInputElement>(form, 'party2'),
		courtInput: field<HTMLInputElement>(form, 'court'),
		pinciteInput: field<HTMLInputElement>(form, 'pincite'),
		weightOfAuthorityInput: field<HTMLInputElement>(form, 'weightOfAuthority'),
		historyPhraseSelect: field<HTMLSelectElement>(form, 'historyPhrase'),
		historyCitationInput: field<HTMLInputElement>(form, 'historyCitation'),
		volumeInput: field<HTMLInputElement>(form, 'volume'),
		reporterInput: field<HTMLInputElement>(form, 'reporter'),
		firstPageInput: field<HTMLInputElement>(form, 'firstPage'),
		yearInput: field<HTMLInputElement>(form, 'year'),
		nameVariantSelect: field<HTMLSelectElement>(form, 'nameVariant'),
		signalSelect: field<HTMLSelectElement>(form, 'signal'),
		idCheckbox: field<HTMLInputElement>(form, 'id'),
		materialLocationMainCheckbox: field<HTMLInputElement>(
			form,
			'materialLocationMain',
		),
		materialLocationSupplementCheckbox: field<HTMLInputElement>(
			form,
			'materialLocationSupplement',
		),
		docketInput: field<HTMLInputElement>(form, 'docket'),
		databaseIdInput: field<HTMLInputElement>(form, 'databaseId'),
		urlInput: field<HTMLInputElement>(form, 'url'),
		monthSelect: field<HTMLSelectElement>(form, 'month'),
		dayInput: field<HTMLInputElement>(form, 'day'),
		popularNameInput: field<HTMLInputElement>(form, 'popularName'),
		originalSectionInput: field<HTMLInputElement>(form, 'originalSection'),
		titleInput: field<HTMLInputElement>(form, 'title'),
		codeInput: field<HTMLInputElement>(form, 'code'),
		sectionInput: field<HTMLInputElement>(form, 'section'),
		publisherInput: field<HTMLInputElement>(form, 'publisher'),
		supplementDesignationInput: field<HTMLInputElement>(
			form,
			'supplementDesignation',
		),
		supplementYearInput: field<HTMLInputElement>(form, 'supplementYear'),
	};
}

export type FormRefs = ReturnType<typeof queryFormRefs>;
