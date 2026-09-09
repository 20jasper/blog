import { describe, expect, it } from 'vitest';
import { initialDisplayState } from './display-state';
import { resolveShortFormKind, resolveSourceShape } from './source-shape';
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
