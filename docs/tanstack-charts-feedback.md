# TanStack Charts (`@tanstack/charts` v0.14.0) — issues hit building one chart

Context: rebuilt one existing chart (log/linear-toggle area+line with 3 reference
lines) from Highcharts to `@tanstack/charts` as a comparison spike. Below is
everything that required a manual workaround, split by whether it looks like
the library's job vs. reasonably app-level.

## Likely library gaps

1. ~~No visible focus indicator in the base `@tanstack/charts` SVG
   renderer.~~ **Wrong — corrected 2026-08-23.** Re-checked against the
   installed `@tanstack/charts@0.14.0` source (`dist/scene.js`): any mark
   _without_ a custom `mark.focus` config (plain `lineY`/`areaY`, exactly
   what this repo's charts use) automatically gets pushed into
   `defaultFocusEntries` and renders its own `<circle class="ts-chart__focus-
layer--default">` per point, toggled via the `visibility` attribute as
   focus moves — confirmed live in the rendered DOM, not just the types.
   This repo's own hand-drawn focus dot (`focusDot()` in `chart-utils.ts`,
   the `.chart-focus-dot` class, and its e2e test) is very likely
   duplicating something the library already draws for free — it just
   happens to render on top and hide the library's dot underneath, since
   `appendChild` on the SVG root puts it last in paint order. Worth
   confirming with a screenshot diff and considering deleting the custom dot
   entirely, but that's a separate decision from this doc correction.

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
    does. **Nuance added 2026-08-23**: the package does export a legend
    (`colorLegend`/`colorGradientLegend`/`interactiveColorLegend`), but it's
    driven by a data channel's color _scale_ (labeled swatches for a
    category axis), not arbitrary caller-declared items — no way to hand it
    an ad-hoc `{color, dash, label}[]` for manually-declared reference lines.
    The original claim stands for that specific case.

## Found while answering "do we still need ariaLabel"

11. `aria-describedby` naturally gets attached to the _mount container div_
    in app code, but the accessible `role="img"` object is the SVG mounted
    _inside_ that div. A plain, role-less wrapper div doesn't get flattened
    together with its `role="img"` child by most screen readers — the SVG is
    read as its own object. Anything wired via `aria-describedby`/`id` on the
    outer div is easy to write and have it silently never reach the actual
    accessible object. Might be worth the docs calling this out explicitly,
    or the host accepting a description via the mount API in a way that's
    harder to place wrong. **Status 2026-08-23**: moot in this repo — the
    current `threshold-curve-chart.astro` already passes the description via
    `mountChart()`'s own `ariaDescription` option instead of wiring
    `aria-describedby` onto the wrapper div, which is exactly the sidestep
    suggested above. `chart-frame.astro` doesn't set `aria-describedby` on
    its container at all anymore.
