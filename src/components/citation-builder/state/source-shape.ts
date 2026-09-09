import type { Availability } from '../domain/availability';
import type { CodeType } from '../domain/code-type';
import type { MaterialLocation } from '../domain/material-location';
import type { DisplayState } from './display-state';
import {
	resolveFormShape,
	type FormShape,
	type ShortFormShape,
} from './form-shape';

export type SourceShape =
	| ({ sourceType: 'reported' } & FormShape)
	| ({ sourceType: 'unreported'; availability: Availability } & FormShape)
	| {
			sourceType: 'statute';
			mode: 'full';
			codeType: CodeType;
			materialLocation: MaterialLocation;
	  }
	| { sourceType: 'statute'; mode: 'short' };

export function resolveSourceShape(display: DisplayState): SourceShape {
	switch (display.sourceType) {
		case 'reported':
			return { sourceType: 'reported', ...resolveFormShape(display) };
		case 'unreported':
			return {
				sourceType: 'unreported',
				availability: display.availability,
				...resolveFormShape(display),
			};
		case 'statute':
			switch (display.mode) {
				case 'full':
					return {
						sourceType: 'statute',
						mode: 'full',
						codeType: display.codeType,
						materialLocation: display.materialLocation,
					};
				case 'short':
					return { sourceType: 'statute', mode: 'short' };
			}
	}
}

// r[impl name-variant.short-form-only]
export function resolveShortFormKind(
	sourceShape: SourceShape,
): ShortFormShape['kind'] | undefined {
	switch (sourceShape.sourceType) {
		case 'reported':
		case 'unreported':
			return sourceShape.mode === 'short' ? sourceShape.kind : undefined;
		case 'statute':
			return undefined;
	}
}
