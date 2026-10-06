import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { PUBLISH_TO_YANK_CHART, YANK_DATA } from './data';
import { mountThresholdChart } from './mount-threshold-chart';

const { id, title, refLines } = PUBLISH_TO_YANK_CHART;
const config = { ...PUBLISH_TO_YANK_CHART, height: 340 };
const index24h = YANK_DATA.findIndex((d) => d.hours === 24);
const ref24h = refLines.findIndex((r) => r.hours === 24);

// The same wrapper shape threshold-curve-chart.astro renders: the chart div
// plus sibling scale-toggle buttons.
function renderFixture() {
	document.body.innerHTML = `
		<figure style="width: 640px">
			<button data-scale-btn="logarithmic" data-chart="${id}" aria-pressed="true">Log</button>
			<button data-scale-btn="linear" data-chart="${id}" aria-pressed="false">Linear</button>
			<div id="${id}" style="height: ${config.height}px"></div>
		</figure>`;
	return document.querySelector<HTMLElement>(`#${id}`)!;
}

// Keystrokes must land in order, so these can't run in parallel.
async function pressRight(times: number) {
	for (let i = 0; i < times; i++) {
		// oxlint-disable-next-line no-await-in-loop
		await userEvent.keyboard('{ArrowRight}');
	}
}

const brightened = (container: HTMLElement) =>
	[...container.querySelectorAll('.ts-chart__rule-x line')].filter(
		(line) =>
			line.getAttribute('stroke-width') === '6' &&
			getComputedStyle(line).visibility === 'visible',
	);

const tooltipText = (container: HTMLElement) =>
	container.querySelector('.ts-chart-tooltip')?.textContent;

describe('mountThresholdChart', () => {
	let container: HTMLElement;

	beforeEach(() => {
		container = renderFixture();
		mountThresholdChart(container, config, 16);
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('names the whole chart, not just an axis', () => {
		expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe(
			title,
		);
	});

	it('lights up the 24h ref line and merges its label into the tooltip when that point is focused', async () => {
		container.querySelector('svg')!.focus();
		await pressRight(index24h);

		await expect.poll(() => brightened(container)).toHaveLength(1);
		expect(tooltipText(container)).toContain(refLines[ref24h]!.label);
	});

	it('merges the 0h ref line into the first point, which it is pinned to on the log axis', async () => {
		const zeroHour = refLines.findIndex((r) => r.hours === 0);
		container.querySelector('svg')!.focus();

		await expect.poll(() => brightened(container)).toHaveLength(1);
		expect(tooltipText(container)).toContain(refLines[zeroHour]!.label);
		expect(tooltipText(container)).toContain('(0h)');
	});

	it('draws the library focus dot and moves it as focus changes', async () => {
		const dot = () =>
			container.querySelector<SVGCircleElement>(
				'.ts-chart__focus-layer--default circle:not([style*="hidden"])',
			);
		container.querySelector('svg')!.focus();
		await pressRight(1);
		await expect.poll(dot).not.toBeNull();
		const first = dot()?.getAttribute('cx');

		await pressRight(1);

		await expect.poll(() => dot()?.getAttribute('cx')).not.toBe(first);
	});

	it('clears the highlight when focus moves to the next point', async () => {
		container.querySelector('svg')!.focus();
		await pressRight(index24h + 1);

		await expect.poll(() => brightened(container)).toHaveLength(0);
	});

	it('switches to the linear axis and drops the focused tooltip', async () => {
		container.querySelector('svg')!.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => tooltipText(container)).toBeTruthy();

		await page.getByRole('button', { name: 'Linear' }).click();

		await expect
			.poll(() => container.querySelector('.ts-chart-tooltip'))
			.toSatisfy(
				(tip: Element | null) =>
					!tip || getComputedStyle(tip).display === 'none',
			);
		expect(
			page
				.getByRole('button', { name: 'Linear' })
				.element()
				.getAttribute('aria-pressed'),
		).toBe('true');
		// 2h is a log-only tick.
		expect(container.querySelector('svg')!.textContent).not.toContain('2h');
	});
});
