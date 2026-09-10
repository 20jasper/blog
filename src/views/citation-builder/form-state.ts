import {
	deriveSelections,
	EN_DASH,
	hasStatuteFullFields,
	HYPHEN,
	initialCitationFields,
	initialDisplayState,
	isAvailability,
	isCaseTypeId,
	isCodeType,
	isMaterialLocation,
	isMonth,
	isNameVariant,
	isSourceType,
	resolveShortFormKind,
	selectFieldState,
	type Availability,
	type CaseTypeId,
	type CitationFields,
	type CodeType,
	type DisplayState,
	type FieldId,
	type FieldRequirement,
	type MaterialLocation,
	type Mode,
	type Month,
	type NameVariant,
	type SourceType,
	type SpanSeparator,
} from '@components/citation-builder/state';
import { queryFormRefs } from './dom-refs';

function setFieldRequirement(
	input: HTMLInputElement | HTMLSelectElement,
	requirement: FieldRequirement,
): void {
	input.disabled = requirement === 'not-used';
	input.required = requirement === 'required';
}

export function createFormState(form: HTMLFormElement) {
	const refs = queryFormRefs(form);
	const { caseTypeSelect, monthSelect, nameVariantSelect, idCheckbox } = refs;

	// Every CitationFields key needs an entry -- a missing one is a type
	// error, not a field that silently never gets required/disabled.
	const fieldRefs: Record<FieldId, HTMLInputElement | HTMLSelectElement> = {
		caseType: caseTypeSelect,
		party1: refs.party1Input,
		party2: refs.party2Input,
		court: refs.courtInput,
		pincite: refs.pinciteInput,
		volume: refs.volumeInput,
		reporter: refs.reporterInput,
		firstPage: refs.firstPageInput,
		year: refs.yearInput,
		docket: refs.docketInput,
		databaseId: refs.databaseIdInput,
		url: refs.urlInput,
		month: monthSelect,
		day: refs.dayInput,
		popularName: refs.popularNameInput,
		originalSection: refs.originalSectionInput,
		title: refs.titleInput,
		code: refs.codeInput,
		section: refs.sectionInput,
		publisher: refs.publisherInput,
		supplementDesignation: refs.supplementDesignationInput,
		supplementYear: refs.supplementYearInput,
	};

	function currentCaseType(): CaseTypeId {
		const { value } = caseTypeSelect;
		return isCaseTypeId(value) ? value : 'v';
	}

	function checkedRadioValue<T extends string>(
		name: string,
		isValid: (value: string) => value is T,
		fallback: T,
	): T {
		const checked = form.querySelector<HTMLInputElement>(
			`input[name="${name}"]:checked`,
		);
		return checked !== null && isValid(checked.value)
			? checked.value
			: fallback;
	}

	function currentSourceType(): SourceType {
		return checkedRadioValue('sourceType', isSourceType, 'reported');
	}

	function currentMode(): Mode {
		const checked = form.querySelector<HTMLInputElement>(
			'input[name="mode"]:checked',
		);
		return checked?.value === 'short' ? 'short' : 'full';
	}

	function currentAvailability(): Availability {
		return checkedRadioValue('availability', isAvailability, 'database');
	}

	function currentCodeType(): CodeType {
		return checkedRadioValue('codeType', isCodeType, 'official');
	}

	function currentMaterialLocation(): MaterialLocation {
		return checkedRadioValue('materialLocation', isMaterialLocation, 'main');
	}

	function currentNameVariant(): NameVariant {
		const { value } = nameVariantSelect;
		return isNameVariant(value) ? value : 'full';
	}

	function currentMonth(): Month {
		const { value } = monthSelect;
		return isMonth(value) ? value : 'Jan.';
	}

	function currentEmphasis(): DisplayState['emphasis'] {
		const checked = form.querySelector<HTMLInputElement>(
			'input[name="emphasis"]:checked',
		);
		return checked?.value === 'underline' ? 'underline' : 'italic';
	}

	function currentSpanSeparator(): SpanSeparator {
		const checked = form.querySelector<HTMLInputElement>(
			'input[name="spanSeparator"]:checked',
		);
		return checked?.value === 'en-dash' ? EN_DASH : HYPHEN;
	}

	function readFields(): CitationFields {
		return {
			caseType: currentCaseType(),
			party1: refs.party1Input.value,
			party2: refs.party2Input.value,
			court: refs.courtInput.value,
			pincite: refs.pinciteInput.value,
			volume: refs.volumeInput.value,
			reporter: refs.reporterInput.value,
			firstPage: refs.firstPageInput.value,
			year: refs.yearInput.value,
			docket: refs.docketInput.value,
			databaseId: refs.databaseIdInput.value,
			url: refs.urlInput.value,
			month: currentMonth(),
			day: refs.dayInput.value,
			popularName: refs.popularNameInput.value,
			originalSection: refs.originalSectionInput.value,
			title: refs.titleInput.value,
			code: refs.codeInput.value,
			section: refs.sectionInput.value,
			publisher: refs.publisherInput.value,
			supplementDesignation: refs.supplementDesignationInput.value,
			supplementYear: refs.supplementYearInput.value,
		};
	}

	function readDisplay(): DisplayState {
		return {
			sourceType: currentSourceType(),
			availability: currentAvailability(),
			codeType: currentCodeType(),
			materialLocation: currentMaterialLocation(),
			mode: currentMode(),
			nameVariant: currentNameVariant(),
			useId: idCheckbox.checked,
			emphasis: currentEmphasis(),
			spanSeparator: currentSpanSeparator(),
		};
	}

	function setRadioGroupDisabled(name: string, disabled: boolean): void {
		for (const input of form.querySelectorAll<HTMLInputElement>(
			`input[name="${name}"]`,
		)) {
			input.disabled = disabled;
		}
	}

	function updateFieldState(
		fields: CitationFields,
		display: DisplayState,
	): void {
		const selections = deriveSelections(fields, display);
		const shortFormKind = resolveShortFormKind(selections.sourceShape);
		const fieldState = selectFieldState(selections);

		// oxlint-disable-next-line no-unsafe-type-assertion
		for (const id of Object.keys(fieldRefs) as FieldId[]) {
			setFieldRequirement(fieldRefs[id], fieldState[id]);
		}

		nameVariantSelect.disabled = shortFormKind !== 'name';
		idCheckbox.disabled = shortFormKind === undefined;
		setRadioGroupDisabled(
			'availability',
			selections.sourceShape.sourceType !== 'unreported',
		);
		const isStatuteFull = hasStatuteFullFields(selections.sourceShape);
		setRadioGroupDisabled('codeType', !isStatuteFull);
		setRadioGroupDisabled('materialLocation', !isStatuteFull);
	}

	function resetToDefaults(): void {
		form.reset();
		for (const input of form.querySelectorAll<HTMLInputElement>(
			'input:not([type="radio"]):not([type="checkbox"])',
		)) {
			input.value = '';
		}
		const defaultFields = initialCitationFields();
		const defaultDisplay = initialDisplayState();
		caseTypeSelect.value = defaultFields.caseType;
		monthSelect.value = defaultFields.month;
		nameVariantSelect.value = defaultDisplay.nameVariant;
	}

	function setFields(values: Partial<Record<FieldId, string>>): void {
		// oxlint-disable-next-line no-unsafe-type-assertion
		for (const [id, value] of Object.entries(values) as [FieldId, string][]) {
			fieldRefs[id].value = value;
		}
	}

	return {
		readFields,
		readDisplay,
		updateFieldState,
		resetToDefaults,
		setFields,
	};
}

export type FormState = ReturnType<typeof createFormState>;
