import * as z from 'zod/mini';
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

// Wraps an existing `is*` type guard as a zod schema so option lists stay
// defined once, in the domain/state modules that already own them.
function guarded<T extends string>(isT: (value: string) => value is T) {
	return z.custom<T>((value) => typeof value === 'string' && isT(value));
}

export const citationFieldsSchema = z.object({
	caseType: guarded<CaseTypeId>(isCaseTypeId),
	party1: z.string(),
	party2: z.string(),
	court: z.string(),
	pincite: z.string(),
	weightOfAuthority: z.string(),
	historyPhrase: z.string(),
	historyCitation: z.string(),
	volume: z.string(),
	reporter: z.string(),
	firstPage: z.string(),
	year: z.string(),
	docket: z.string(),
	databaseId: z.string(),
	url: z.string(),
	month: guarded<Month>(isMonth),
	day: z.string(),
	popularName: z.string(),
	originalSection: z.string(),
	title: z.string(),
	code: z.string(),
	section: z.string(),
	publisher: z.string(),
	supplementDesignation: z.string(),
	supplementYear: z.string(),
}) satisfies z.ZodMiniType<CitationFields>;

export const displayStateSchema = z.object({
	sourceType: guarded<SourceType>(isSourceType),
	mode: guarded<Mode>(isMode),
	nameVariant: guarded<NameVariant>(isNameVariant),
	useId: z.boolean(),
	availability: guarded<Availability>(isAvailability),
	codeType: guarded<CodeType>(isCodeType),
	materialLocation: guarded<MaterialLocation>(isMaterialLocation),
	emphasis: guarded<Emphasis>(isEmphasis),
	spanSeparator: guarded<DisplayState['spanSeparator']>(isSpanSeparator),
	signal: guarded<Signal>(isSignal),
}) satisfies z.ZodMiniType<DisplayState>;
