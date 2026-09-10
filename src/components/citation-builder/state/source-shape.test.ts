import { describe, expect, it } from 'vitest';
import { initialDisplayState } from './display-state';
import {
	hasStatuteFullFields,
	resolveShortFormKind,
	resolveSourceShape,
} from './source-shape';
import type { DisplayState } from './display-state';

describe('resolveSourceShape', () => {
	it('unreported carries availability alongside the resolved FormShape', () => {
		const display: DisplayState = {
			...initialDisplayState(),
			sourceType: 'unreported',
			mode: 'full',
			availability: 'slip',
		};

		expect(resolveSourceShape(display)).toEqual({
			sourceType: 'unreported',
			mode: 'full',
			availability: 'slip',
		});
	});

	it('statute full mode carries codeType and materialLocation', () => {
		const display: DisplayState = {
			...initialDisplayState(),
			sourceType: 'statute',
			mode: 'full',
			codeType: 'annotated',
			materialLocation: 'both',
		};

		expect(resolveSourceShape(display)).toEqual({
			sourceType: 'statute',
			mode: 'full',
			codeType: 'annotated',
			materialLocation: 'both',
		});
	});

	it('statute short mode carries neither codeType nor materialLocation', () => {
		const display: DisplayState = {
			...initialDisplayState(),
			sourceType: 'statute',
			mode: 'short',
		};

		expect(resolveSourceShape(display)).toEqual({
			sourceType: 'statute',
			mode: 'short',
		});
	});
});

describe('resolveShortFormKind', () => {
	it('is undefined for statute regardless of mode', () => {
		expect(
			resolveShortFormKind({
				sourceType: 'statute',
				mode: 'full',
				codeType: 'official',
				materialLocation: 'main',
			}),
		).toBeUndefined();
		expect(
			resolveShortFormKind({ sourceType: 'statute', mode: 'short' }),
		).toBeUndefined();
	});
});

describe('hasStatuteFullFields', () => {
	it('is true only for statute full mode', () => {
		expect(
			hasStatuteFullFields({
				sourceType: 'statute',
				mode: 'full',
				codeType: 'official',
				materialLocation: 'main',
			}),
		).toBe(true);
	});

	it('is false for statute short mode', () => {
		expect(hasStatuteFullFields({ sourceType: 'statute', mode: 'short' })).toBe(
			false,
		);
	});

	it('is false for reported and unreported', () => {
		expect(hasStatuteFullFields({ sourceType: 'reported', mode: 'full' })).toBe(
			false,
		);
		expect(
			hasStatuteFullFields({
				sourceType: 'unreported',
				mode: 'full',
				availability: 'database',
			}),
		).toBe(false);
	});
});
