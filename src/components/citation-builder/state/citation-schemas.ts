import { boolean, custom, type GenericSchema, object, string } from 'valibot';
import { isCaseTypeId } from '../domain/case-types';
import type { CaseTypeId } from '../domain/case-types';
import { isMonth } from '../domain/months';
import type { Month } from '../domain/months';
import { isAvailability } from '../domain/availability';
import type { Availability } from '../domain/availability';
import { isCodeType } from '../domain/code-type';
import type { CodeType } from '../domain/code-type';
import { isMaterialLocation } from '../domain/material-location';
import type { MaterialLocation } from '../domain/material-location';
import { isSignal } from '../domain/signal';
import type { Signal } from '../domain/signal';
import type { CitationFields } from './citation-fields';
import {
	isEmphasis,
	isMode,
	isNameVariant,
	isSpanSeparator,
} from './display-state';
import type {
	DisplayState,
	Emphasis,
	Mode,
	NameVariant,
} from './display-state';
import { isSourceType } from './source-type';
import type { SourceType } from './source-type';

// Wraps an existing `is*` type guard as a valibot schema so option lists stay
// defined once, in the domain/state modules that already own them.
function guarded<T extends string>(isT: (value: string) => value is T) {
	return custom<T>((value) => typeof value === 'string' && isT(value));
}

export const citationFieldsSchema = object({
	caseType: guarded<CaseTypeId>(isCaseTypeId),
	party1: string(),
	party2: string(),
	court: string(),
	pincite: string(),
	weightOfAuthority: string(),
	historyPhrase: string(),
	historyCitation: string(),
	volume: string(),
	reporter: string(),
	firstPage: string(),
	year: string(),
	docket: string(),
	databaseId: string(),
	url: string(),
	month: guarded<Month>(isMonth),
	day: string(),
	popularName: string(),
	originalSection: string(),
	title: string(),
	code: string(),
	section: string(),
	publisher: string(),
	supplementDesignation: string(),
	supplementYear: string(),
}) satisfies GenericSchema<unknown, CitationFields>;

export const displayStateSchema = object({
	sourceType: guarded<SourceType>(isSourceType),
	mode: guarded<Mode>(isMode),
	nameVariant: guarded<NameVariant>(isNameVariant),
	useId: boolean(),
	availability: guarded<Availability>(isAvailability),
	codeType: guarded<CodeType>(isCodeType),
	materialLocation: guarded<MaterialLocation>(isMaterialLocation),
	emphasis: guarded<Emphasis>(isEmphasis),
	spanSeparator: guarded<DisplayState['spanSeparator']>(isSpanSeparator),
	signal: guarded<Signal>(isSignal),
}) satisfies GenericSchema<unknown, DisplayState>;
