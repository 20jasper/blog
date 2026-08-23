# TanStack Charts (`@tanstack/charts` v0.14.0) — issues hit building one chart

Context: rebuilt one existing chart (log/linear-toggle area+line with 3 reference
lines) from Highcharts to `@tanstack/charts` as a comparison spike. Below is
everything that required a manual workaround, split by whether it looks like
the library's job vs. reasonably app-level. Re-verified 2026-08-23 against the
installed source, not just the original notes — two entries from the first
pass were wrong or since resolved and have been dropped (see Corrections).

## Likely library gaps

1. **`ruleX`/`ruleY` have no `states` field.** Every other mark type
   (area/line/dot/bar) accepts a `states` array for hover/focus paint changes;
   reference-line marks can't repaint themselves on focus at all.

2. **A `ruleX` point never actually wins nearest-point resolution**, even
   hovering directly over its own rendered stroke — the real line data at the
   same x always wins. It does push a `focusAnchor` (so it looks like it
   should participate), but empirically never does. Makes "reference lines
   resolve through ordinary marks" (their own docs' phrasing) misleading —
   can't attach a tooltip to the ref line's own point; had to detect
   x-coincidence with a real data point instead.

3. **`areaY` + `lineY` stacked — their own documented composition pattern —
   silently doubles keyboard-nav steps per point**, since both mark types
   register a focus anchor at every x. Not mentioned in the compositing guide;
   found by testing, not reading. `decorative()` fixes it, but you have to
   already know to reach for it.

4. **Axis _titles_ have no `fontSize` option** (`ChartAxisLabelOptions` is
   `{text, offset, motion}` only), while tick labels do
   (`tickLabels.fontSize`). Patched locally — `patches/@tanstack__charts.patch`
   adds `fontSize` to `ChartAxisLabelOptions`, matching `tickLabels.fontSize`.

5. **CSS-driven font-size and the internal auto-margin measurement can
   silently disagree.** Overriding painted `font-size` via CSS doesn't inform
   the layout engine's own text measurement, so labels clip/overlap unless you
   also supply a custom `measureText` at the same size. With the item-4 patch,
   this is avoidable: pass `fontSize` through `tickLabels`/`axis.label`
   directly and drop the CSS override — the library's own default DOM
   measurer already reads `options.fontSize` per label. Still a real gap
   without the patch.

## Probably fine as app-level (noting, not necessarily a bug)

6. Default tooltip background reads from `Canvas`/`CanvasText` system colors
   — renders near-white regardless of the app's theme unless
   `--ts-chart-tooltip-*` is explicitly set. Reasonable default for a library
   that doesn't know your theme; the fix is one CSS custom property, already
   done in `chart-frame.astro`.
7. Wrapping a scale in a zero-arg factory (`() => scaleLinear().domain(...)`)
   silently discards `.domain()` (re-inferred from mark data instead). This is
   documented behavior, just an easy footgun with no type-level warning.
8. `ruleX`'s default `strokeOpacity: 0.5` is quite faint against a dark theme
   — a minor default-tuning nit.
9. No built-in legend for arbitrary annotations — the package does export
   `colorLegend`/`colorGradientLegend`/`interactiveColorLegend`, but those are
   driven by a data channel's color scale, not caller-declared items. No way
   to hand it an ad-hoc `{color, dash, label}[]` for reference lines.

## Corrections (2026-08-23 re-verification)

- **No visible focus indicator, dropped.** Wrong on the first pass: the base
  package auto-draws a focus dot for any mark without a custom `mark.focus`
  config (confirmed live in `dist/scene.js` and the rendered DOM) — this
  repo's charts qualify. The hand-drawn `.chart-focus-dot` workaround was a
  pure duplicate, rendering on top of and hiding the library's own dot; it's
  been deleted. Only fix needed was setting `--ts-chart-focus-fill` so the
  library's dot uses our token instead of the same `Canvas` fallback noted in
  item 6.
- **`aria-describedby` on the mount div, dropped.** Real footgun in general
  (the `role="img"` object is the SVG _inside_ the div, not the div itself),
  but moot here — this repo already passes descriptions via `mountChart()`'s
  own `ariaDescription` option, which is the correct sidestep.
