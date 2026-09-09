import { HYPHEN } from '../domain/pincite';
import type { Availability } from '../domain/availability';
import type { SpanSeparator } from '../domain/assemble';
import type { SourceType } from './source-type';

export type Mode = 'full' | 'short';
// r[impl name-variant.options]
export type NameVariant = 'full' | 'party1' | 'party2' | 'none';
export type Emphasis = 'italic' | 'underline';
export type { SpanSeparator, SourceType };

export function isNameVariant(value: string): value is NameVariant {
	return (
		value === 'full' ||
		value === 'party1' ||
		value === 'party2' ||
		value === 'none'
	);
}

export type DisplayState = {
	sourceType: SourceType;
	mode: Mode;
	nameVariant: NameVariant;
	useId: boolean;
	availability: Availability;
	emphasis: Emphasis;
	spanSeparator: SpanSeparator;
};

export function initialDisplayState(): DisplayState {
	return {
		sourceType: 'reported',
		mode: 'full',
		nameVariant: 'full',
		useId: false,
		availability: 'database',
		emphasis: 'italic',
		spanSeparator: HYPHEN,
	};
}
