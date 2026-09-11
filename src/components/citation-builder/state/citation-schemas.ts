import * as z from 'zod/mini';
import { CASE_TYPES } from '../domain/case-types';
import type { CaseTypeId } from '../domain/case-types';
import { MONTHS } from '../domain/months';
import { AVAILABILITIES } from '../domain/availability';
import type { Availability } from '../domain/availability';
import { CODE_TYPES } from '../domain/code-type';
import type { CodeType } from '../domain/code-type';
import { MATERIAL_LOCATIONS } from '../domain/material-location';
import type { MaterialLocation } from '../domain/material-location';
import { SIGNALS } from '../domain/signal';
import type { Signal } from '../domain/signal';
import type { CitationFields } from './citation-fields';
import { EN_DASH, HYPHEN, MODES } from './display-state';
import type {
	DisplayState,
	Emphasis,
	Mode,
	NameVariant,
} from './display-state';
import { SOURCE_TYPES } from './source-type';
import type { SourceType } from './source-type';

// oxlint-disable-next-line no-unsafe-type-assertion
const CASE_TYPE_IDS = CASE_TYPES.map((caseType) => caseType.id) as [
	CaseTypeId,
	...CaseTypeId[],
];
// oxlint-disable-next-line no-unsafe-type-assertion
const AVAILABILITY_VALUES = AVAILABILITIES.map((a) => a.value) as [
	Availability,
	...Availability[],
];
// oxlint-disable-next-line no-unsafe-type-assertion
const CODE_TYPE_VALUES = CODE_TYPES.map((c) => c.value) as [
	CodeType,
	...CodeType[],
];
// oxlint-disable-next-line no-unsafe-type-assertion
const MATERIAL_LOCATION_VALUES = MATERIAL_LOCATIONS.map((m) => m.value) as [
	MaterialLocation,
	...MaterialLocation[],
];
// oxlint-disable-next-line no-unsafe-type-assertion
const SIGNAL_VALUES = SIGNALS.map((s) => s.value) as [Signal, ...Signal[]];
// oxlint-disable-next-line no-unsafe-type-assertion
const MODE_VALUES = MODES.map((m) => m.value) as [Mode, ...Mode[]];
// oxlint-disable-next-line no-unsafe-type-assertion
const SOURCE_TYPE_VALUES = SOURCE_TYPES.map((s) => s.value) as [
	SourceType,
	...SourceType[],
];

const NAME_VARIANTS: [NameVariant, ...NameVariant[]] = [
	'full',
	'party1',
	'party2',
	'none',
];
const EMPHASES: [Emphasis, ...Emphasis[]] = ['italic', 'underline'];
const SPAN_SEPARATORS: [
	DisplayState['spanSeparator'],
	...DisplayState['spanSeparator'][],
] = [HYPHEN, EN_DASH];

export const citationFieldsSchema = z.object({
	caseType: z.enum(CASE_TYPE_IDS),
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
	month: z.enum(MONTHS),
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
	sourceType: z.enum(SOURCE_TYPE_VALUES),
	mode: z.enum(MODE_VALUES),
	nameVariant: z.enum(NAME_VARIANTS),
	useId: z.boolean(),
	availability: z.enum(AVAILABILITY_VALUES),
	codeType: z.enum(CODE_TYPE_VALUES),
	materialLocation: z.enum(MATERIAL_LOCATION_VALUES),
	emphasis: z.enum(EMPHASES),
	spanSeparator: z.enum(SPAN_SEPARATORS),
	signal: z.enum(SIGNAL_VALUES),
}) satisfies z.ZodMiniType<DisplayState>;
