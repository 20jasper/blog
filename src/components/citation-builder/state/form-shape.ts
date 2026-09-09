import type { PartyChoice } from '../domain/assemble';
import type { DisplayState } from './display-state';

export type ShortFormShape =
	| { kind: 'id' }
	| { kind: 'none' }
	| { kind: 'name'; nameVariant: PartyChoice };

export type FormShape = { mode: 'full' } | ({ mode: 'short' } & ShortFormShape);

export function resolveFormShape(display: DisplayState): FormShape {
	switch (display.mode) {
		case 'full':
			return { mode: 'full' };
		case 'short':
			if (display.useId) {
				return { mode: 'short', kind: 'id' };
			}
			switch (display.nameVariant) {
				case 'none':
					return { mode: 'short', kind: 'none' };
				case 'full':
				case 'party1':
				case 'party2':
					return {
						mode: 'short',
						kind: 'name',
						nameVariant: display.nameVariant,
					};
			}
	}
}
