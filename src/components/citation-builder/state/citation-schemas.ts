import { boolean, type GenericSchema, object, picklist, string } from 'valibot';
import { CASE_TYPE_IDS } from '../domain/case-types';
import { MONTHS } from '../domain/months';
import { AVAILABILITY_VALUES } from '../domain/availability';
import { CODE_TYPE_VALUES } from '../domain/code-type';
import { MATERIAL_LOCATION_VALUES } from '../domain/material-location';
import { SIGNAL_VALUES } from '../domain/signal';
import type { CitationFields } from './citation-fields';
import { EN_DASH, HYPHEN, MODE_VALUES } from './display-state';
import type { DisplayState, Emphasis, NameVariant } from './display-state';
import { SOURCE_TYPE_VALUES } from './source-type';

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

export const citationFieldsSchema = object({
	caseType: picklist(CASE_TYPE_IDS),
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
	month: picklist(MONTHS),
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
	sourceType: picklist(SOURCE_TYPE_VALUES),
	mode: picklist(MODE_VALUES),
	nameVariant: picklist(NAME_VARIANTS),
	useId: boolean(),
	availability: picklist(AVAILABILITY_VALUES),
	codeType: picklist(CODE_TYPE_VALUES),
	materialLocation: picklist(MATERIAL_LOCATION_VALUES),
	emphasis: picklist(EMPHASES),
	spanSeparator: picklist(SPAN_SEPARATORS),
	signal: picklist(SIGNAL_VALUES),
}) satisfies GenericSchema<unknown, DisplayState>;
