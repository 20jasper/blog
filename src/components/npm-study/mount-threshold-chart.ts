import { mountChart } from '@tanstack/charts';
import { buildThresholdDefinition } from './threshold-definition';
import type { ThresholdConfig } from './chart-config';
import { isScaleType } from './ref-lines';
import type { ScaleType } from './ref-lines';

// The only DOM-touching layer for the threshold chart: mounts it and wires
// the scale-toggle buttons. Everything it renders comes from
// buildThresholdDefinition.
export function mountThresholdChart(
	container: HTMLElement,
	config: ThresholdConfig,
	fontPx: number,
) {
	const mountOptions = (scaleType: ScaleType) => ({
		height: config.height,
		initialWidth: 640,
		// Names the whole chart, not just its x-axis.
		ariaLabel: config.title,
		ariaDescription: config.alt || undefined,
		definition: buildThresholdDefinition(config, scaleType, fontPx),
	});
	const host = mountChart(container, mountOptions('logarithmic'));

	// Scoped to this chart's own wrapper -- the toggle buttons are a sibling of
	// the chart div, not a descendant.
	const buttons = container.parentElement!.querySelectorAll<HTMLButtonElement>(
		`[data-scale-btn][data-chart="${container.id}"]`,
	);
	buttons.forEach((btn) => {
		btn.addEventListener('click', () => {
			const scaleType = btn.dataset.scaleBtn;
			if (!isScaleType(scaleType)) return;
			buttons.forEach((b) => {
				b.setAttribute('aria-pressed', String(b === btn));
			});
			// update() rebuilds the whole SVG, so whatever point was focused no
			// longer exists -- clear it first, or the tooltip (host state) and the
			// focus dot (tied to the destroyed DOM) fall out of sync.
			host.interaction.setControlledFocus(null);
			host.update(mountOptions(scaleType));
		});
	});
	return host;
}
