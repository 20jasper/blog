import { ids } from './ids';

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
		nameVariantSelect: document.querySelector<HTMLSelectElement>(
			`#${ids.nameVariant}`,
		)!,
		idCheckbox: form.querySelector<HTMLInputElement>('input[name="id"]')!,
	};
}

export type FormRefs = ReturnType<typeof queryFormRefs>;
