# TanStack Charts (`@tanstack/charts` v0.14.0) — issues hit building one chart

Context: rebuilt one existing chart (log/linear-toggle area+line with 3 reference
lines) from Highcharts to `@tanstack/charts` as a comparison spike. Below is
everything that required a manual workaround, split by whether it looks like
the library's job vs. reasonably app-level.

## Likely library gaps

1. **No visible focus indicator in the base `@tanstack/charts` SVG renderer.**
   `@tanstack/charts-core-d3`'s renderer template includes a
   `<circle data-ts-chart-focus>` marker; the base package's does not.
   Keyboard/pointer focus updates the tooltip and internal state, but nothing
   on the chart itself shows which point is focused — fails the accessibility
   guide's own "confirm visible focus" checklist item. Worked around by
   hand-drawing a focus dot from `onFocusChange`.

2. **`ruleX`/`ruleY` have no `states` field.** Every other mark type
   (area/line/dot/bar) accepts a `states` array for hover/focus paint changes;
   reference-line marks can't repaint themselves on focus at all.

3. **A `ruleX` point never actually wins nearest-point resolution**, even
   hovering directly over its own rendered stroke — the real line data at the
   same x always wins. It does push a `focusAnchor` (so it looks like it
   should participate), but empirically never does. Makes "reference lines
   resolve through ordinary marks" (their own docs' phrasing) misleading —
   can't attach a tooltip to the ref line's own point; had to detect
   x-coincidence with a real data point instead.

4. **`areaY` + `lineY` stacked — their own documented composition pattern —
   silently doubles keyboard-nav steps per point**, since both mark types
   register a focus anchor at every x. Not mentioned in the compositing guide;
   found by testing, not reading. `decorative()` fixes it, but you have to
   already know to reach for it.

5. **Axis _titles_ have no `fontSize` option** (`ChartAxisLabelOptions` is
   `{text, offset, motion}` only), while tick labels do
   (`tickLabels.fontSize`). No way to match an axis title to a page's type
   scale without a workaround.

6. **CSS-driven font-size and the internal auto-margin measurement can
   silently disagree.** Overriding painted `font-size` via CSS (necessary
   since it's the lowest-priority SVG presentation attribute) doesn't inform
   the layout engine's own text measurement, so labels clip/overlap unless you
   _also_ supply a custom `measureText` that measures at the same size — two
   separate systems that need manual synchronization.

7. **Default tooltip background reads from `Canvas`/`CanvasText` system
   colors** — renders near-white regardless of the app's theme unless
   `--ts-chart-tooltip-*` is explicitly set. Nothing in the mount API signals
   that the tooltip ships unstyled.

## Probably fine as app-level (noting, not necessarily a bug)

8. Wrapping a scale in a zero-arg factory (`() => scaleLinear().domain(...)`)
   silently discards `.domain()` (re-inferred from mark data instead). This is
   documented behavior, just an easy footgun with no type-level warning.
9. `ruleX`'s default `strokeOpacity: 0.5` is quite faint against a dark theme
   — a minor default-tuning nit.
10. No built-in legend concept for annotation/reference lines — reasonable to
    leave to the app, but worth knowing it doesn't exist before assuming it
    does.

## Found while answering "do we still need ariaLabel"

11. `aria-describedby` naturally gets attached to the _mount container div_
    in app code, but the accessible `role="img"` object is the SVG mounted
    _inside_ that div. A plain, role-less wrapper div doesn't get flattened
    together with its `role="img"` child by most screen readers — the SVG is
    read as its own object. Anything wired via `aria-describedby`/`id` on the
    outer div is easy to write and have it silently never reach the actual
    accessible object. Might be worth the docs calling this out explicitly,
    or the host accepting a description via the mount API in a way that's
    harder to place wrong.
