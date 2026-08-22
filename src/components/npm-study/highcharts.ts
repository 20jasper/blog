import Highcharts from 'highcharts';
// Must be the esm/ subpath -- the bare highcharts/modules/accessibility is a
// UMD build expecting a global window._Highcharts that we never set.
// oxlint-disable-next-line no-unassigned-import
import 'highcharts/esm/modules/accessibility.js';

// Dev-only: lets e2e tests find a chart's exact point coordinates via
// Highcharts.charts instead of guessing pixel positions from axis math.
if (import.meta.env.DEV) {
	// oxlint-disable-next-line no-unsafe-type-assertion
	(globalThis as unknown as { Highcharts?: typeof Highcharts }).Highcharts =
		Highcharts;
}

export default Highcharts;
