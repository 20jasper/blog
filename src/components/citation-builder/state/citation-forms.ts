import type { CitationFields } from './citation-fields';
import { isCitationComplete } from './citation-validity';
import type { DisplayState } from './display-state';

export type CitationForm = {
	id: string;
	label: string;
	display: DisplayState;
	valid: boolean;
};

type FormTemplate = {
	id: string;
	label: string;
	applyTo: (display: DisplayState) => DisplayState;
};

const CASE_FORMS: readonly FormTemplate[] = [
	{
		id: 'full',
		label: 'Full citation',
		applyTo: (display) => ({ ...display, mode: 'full', useId: false }),
	},
	{
		id: 'short-name',
		label: 'Short form with case name',
		applyTo: (display) => ({
			...display,
			mode: 'short',
			useId: false,
			nameVariant:
				display.nameVariant === 'none' ? 'full' : display.nameVariant,
		}),
	},
	{
		id: 'short-none',
		label: 'Short form without case name',
		applyTo: (display) => ({
			...display,
			mode: 'short',
			useId: false,
			nameVariant: 'none',
		}),
	},
	{
		id: 'id',
		label: 'Id.',
		applyTo: (display) => ({ ...display, mode: 'short', useId: true }),
	},
];

const STATUTE_FORMS: readonly FormTemplate[] = [
	{
		id: 'full',
		label: 'Full citation',
		applyTo: (display) => ({ ...display, mode: 'full' }),
	},
	{
		id: 'short',
		label: 'Short form',
		applyTo: (display) => ({ ...display, mode: 'short' }),
	},
];

function templatesFor(display: DisplayState): readonly FormTemplate[] {
	return display.sourceType === 'statute' ? STATUTE_FORMS : CASE_FORMS;
}

// A form is `valid` when the saved fields are enough to build it.
export function citationForms(
	fields: CitationFields,
	display: DisplayState,
): CitationForm[] {
	return templatesFor(display).map(({ id, label, applyTo }) => {
		const formDisplay = applyTo(display);
		return {
			id,
			label,
			display: formDisplay,
			valid: isCitationComplete(fields, formDisplay),
		};
	});
}

export function currentFormId(display: DisplayState): string {
	if (display.sourceType === 'statute') {
		return display.mode === 'full' ? 'full' : 'short';
	}
	if (display.mode === 'full') {
		return 'full';
	}
	if (display.useId) {
		return 'id';
	}
	return display.nameVariant === 'none' ? 'short-none' : 'short-name';
}
