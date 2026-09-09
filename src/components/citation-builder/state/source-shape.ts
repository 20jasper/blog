import type { DisplayState, Mode } from './display-state';
import {
	resolveFormShape,
	type FormShape,
	type ShortFormShape,
} from './form-shape';

export type SourceShape =
	| ({ sourceType: 'reported' } & FormShape)
	| ({ sourceType: 'unreported' } & FormShape)
	| { sourceType: 'statute'; mode: Mode };

export function resolveSourceShape(display: DisplayState): SourceShape {
	switch (display.sourceType) {
		case 'reported':
			return { sourceType: 'reported', ...resolveFormShape(display) };
		case 'unreported':
			return { sourceType: 'unreported', ...resolveFormShape(display) };
		case 'statute':
			return { sourceType: 'statute', mode: display.mode };
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
