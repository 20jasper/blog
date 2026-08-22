// Shared across every @tanstack/charts component on the page -- the DOM
// measurement and focus-handling mechanics are identical regardless of what
// the chart plots, only the mark/scale config differs per component.
import type { ChartTextMeasurer } from '@tanstack/charts';
import { fontSize } from './theme';

// The DOM host auto-computes margins by measuring text at each role's own
// internal default font size (ticks and titles differ, neither exposed as
// an option) -- CSS alone can raise the *painted* size after the fact, but
// then the reserved margin no longer matches, so labels clip/overlap. This
// measurer is the documented override point: it makes every role measure
// (and therefore reserve space) at the same size CSS paints it at.
//
// Resolve any CSS size token to px by letting the browser do it, instead of
// hand-parsing units (rem, em, ...) ourselves.
function basePx() {
	const el = document.createElement('div');
	el.style.cssText = `font-size:${fontSize('base')};position:absolute;visibility:hidden`;
	document.body.appendChild(el);
	const px = parseFloat(getComputedStyle(el).fontSize);
	el.remove();
	return px;
}

function createFixedSizeMeasurer(px: number): ChartTextMeasurer {
	const ctx = document.createElement('canvas').getContext('2d')!;
	return (text, options) => {
		ctx.font = `${options.fontStyle} ${options.fontWeight ?? 400} ${px}px ${options.fontFamily}`;
		ctx.textAlign = options.anchor === 'middle' ? 'center' : options.anchor;
		ctx.textBaseline =
			options.baseline === 'auto' ? 'alphabetic' : options.baseline;
		ctx.direction = options.direction === 'inherit' ? 'ltr' : options.direction;
		const {
			actualBoundingBoxLeft: left,
			actualBoundingBoxRight: right,
			actualBoundingBoxAscent: ascent,
			actualBoundingBoxDescent: descent,
		} = ctx.measureText(text);
		return {
			x: -left,
			y: -ascent,
			width: left + right,
			height: ascent + descent,
		};
	};
}
// One throwaway canvas 2D context for every chart on the page, not one per
// chart instance.
export const measureText = createFixedSizeMeasurer(basePx());

// Shared y-axis tick formatter for count-based charts (records, detections).
export function formatCount(v: number) {
	return v >= 1000
		? `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`
		: String(v);
}

// The accessibility guide's "visible focus" checklist item assumes a visible
// focus indicator exists at all -- the DOM svg-renderer in the base
// @tanstack/charts package (unlike its charts-core-d3 counterpart) doesn't
// ship one. Draw one from `onFocusChange`: point.x/point.y are already in
// on-screen SVG coordinates.
export function focusDot(container: HTMLElement) {
	let dot = container.querySelector<SVGCircleElement>('.chart-focus-dot');
	if (!dot) {
		dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		dot.setAttribute('class', 'chart-focus-dot');
		dot.setAttribute('r', '5');
		dot.setAttribute('fill', 'var(--color-foreground)');
		dot.setAttribute('stroke', 'var(--color-background)');
		dot.setAttribute('stroke-width', '2');
		dot.setAttribute('pointer-events', 'none');
		dot.setAttribute('visibility', 'hidden');
		container.querySelector('svg')?.appendChild(dot);
	}
	return dot;
}

// ruleX has no `states` field to opt into paint-on-focus like area/line/dot
// do, so there's nothing to key a "this ref line's own mark is focused"
// class off of. onFocusChange fires for pointer hover *and* keyboard nav
// alike (it's the same underlying focus concept the tooltip reads), so both
// the ref-line glow and the focus dot key off it. `refLineLookup` must be
// keyed by the same value that will show up as `point.xValue` for the
// coincident real data point (a plotted x, not necessarily a "real" value --
// see each chart's own lookup-construction comment).
export function createRuleXFocusHandler<K>(
	container: HTMLElement,
	refLineLookup: Map<K, { index: number }>,
) {
	return (point: { xValue?: unknown; x?: number; y?: number } | null) => {
		const groups = container.querySelectorAll('.ts-chart__rule-x');
		groups.forEach((g) => g.classList.remove('is-focused'));
		const index = refLineLookup.get(point?.xValue as K)?.index;
		if (index !== undefined) groups[index]?.classList.add('is-focused');

		const dot = focusDot(container);
		if (point && typeof point.x === 'number' && typeof point.y === 'number') {
			dot.setAttribute('cx', String(point.x));
			dot.setAttribute('cy', String(point.y));
			dot.setAttribute('visibility', 'visible');
		} else {
			dot.setAttribute('visibility', 'hidden');
		}
	};
}
