import { describe, expect, it } from 'vitest';
import { PUBLISH_TO_YANK_CHART } from './data';
import {
	LINEAR_HOURS,
	LOG_HOURS,
	buildThresholdDefinition,
} from './threshold-definition';

const config = { ...PUBLISH_TO_YANK_CHART, height: 340 };

// area + line, then a base rule and a whenFocused rule per ref line.
const expectedMarks = 2 + PUBLISH_TO_YANK_CHART.refLines.length * 2;

describe('buildThresholdDefinition', () => {
	it('builds one mark per layer', () => {
		const definition = buildThresholdDefinition(config, 'logarithmic', 16);

		expect(definition.marks).toHaveLength(expectedMarks);
	});

	it('shows hour ticks that fit each scale', () => {
		const log = buildThresholdDefinition(config, 'logarithmic', 16);
		const linear = buildThresholdDefinition(config, 'linear', 16);

		expect(log.scales.x.axis.ticks.values).toEqual(LOG_HOURS);
		expect(linear.scales.x.axis.ticks.values).toEqual(LINEAR_HOURS);
	});

	it('passes the resolved font size to every label so painting and layout agree', () => {
		const { x, y } = buildThresholdDefinition(config, 'logarithmic', 21).scales;

		expect(x.axis.label).toMatchObject({ fontSize: 21 });
		expect(x.axis.tickLabels).toMatchObject({ fontSize: 21 });
		expect(y.axis.label).toMatchObject({ fontSize: 21 });
		expect(y.axis.tickLabels).toMatchObject({ fontSize: 21 });
	});

	it('reuses the same x scale instance across rebuilds', () => {
		const first = buildThresholdDefinition(config, 'logarithmic', 16);
		const second = buildThresholdDefinition(config, 'logarithmic', 18);

		expect(first.scales.x.scale).toBe(second.scales.x.scale);
	});
});
