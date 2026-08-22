# Data viz accessibility research

Compiled while building the npm min-release-age post's charts. Goal: figure out whether
Chart.js (what we used) is the right long-term call for this site, or whether we should
switch before more posts depend on it. Not a final decision — reference doc to dig back
into.

## Foundational reading (concepts, not libraries)

### [Writing Alt Text for Data Visualization — Amy Cesal, Nightingale](https://medium.com/nightingale/writing-alt-text-for-data-visualization-2a218ef43f81)

Blocked by a 403 on direct fetch; pulled via search instead. The load-bearing idea: a
four-level model of what a chart's text description should cover (construction details →
statistics → trends → context), collapsed into a usable formula:

> **[Chart type] of [data description], where [reason for including chart / takeaway]**

This is what we used for every `alt` string in the post. **Worth learning from**: yes — it's
the only source that gives you an actual template instead of "write a good description."

### [Accessible Data Visualization Design — fossheim.io](https://fossheim.io/writing/posts/accessible-dataviz-design/)

General checklist, not library-specific: don't rely on color alone, pair color with
pattern/shape, put real numbers on the chart instead of hiding them behind hover, avoid
animations that are load-bearing for understanding, always ship a table alternative, test
with actual screen readers and colorblind simulators (Coblis, Colorblinding extension).
**Worth learning from**: yes, good broad checklist, nothing library-specific to act on.

### [Apple Health-style dataviz a11y tutorial — fossheim.io](https://fossheim.io/writing/posts/apple-dataviz-a11y-tutorial/)

Misleading title — despite referencing Apple Health's ring design visually, this is a
**D3.js/SVG tutorial**, not Apple's native `AccessibilityChartDescriptor` API. Concrete
pattern shown: `role="img"` on the `<svg>`, `<title>`/`<desc>` elements inside it linked via
`aria-labelledby`, plus a generated text string like `"Moving: 35%. Exercising: 100%."` for
screen readers. This only works because SVG elements are real DOM nodes with a
`aria-labelledby`-addressable `<title>`/`<desc>`; canvas has no equivalent. **Worth learning
from**: as a specific pattern, only if we go SVG. As a general point (SVG's DOM-per-element
model is what makes deeper AT support possible), yes.

### [10 Guidelines for DataViz Accessibility — Highcharts blog](https://www.highcharts.com/blog/best-practices/10-guidelines-for-dataviz-accessibility/)

The most concrete checklist of the bunch — includes actual numbers: WCAG 2.1's 3:1 contrast
floor for non-text/graphical elements, 4.5:1 for small text. Also flags keyboard
accessibility and `prefers-reduced-motion` explicitly as checklist items, not just
mentioned in passing. **Worth learning from**: yes — used its contrast thresholds to
actually verify our palette (see below), not just take on faith.

### ["Accessibility-first" chart design — Smashing Magazine](https://www.smashingmagazine.com/2022/07/accessibility-first-approach-chart-visual-design/)

Case study, not a library. The "heat lane" technique: bin continuous data into discrete
ranges, encode with both color _and_ rectangle height, add high-contrast end-caps so light
fill colors that individually fail contrast still read via a bordered edge. Clever, but
it's a bespoke visualization type (histogram/heatmap hybrid) built for one specific dataset
shape — not a drop-in technique for line/bar charts like ours. **Worth learning from**: the
principle (encode redundantly, don't just pick a chart type and hope) yes; the specific
technique, only if we ever build a similar binned/heatmap chart.

## Audit frameworks / checklists

### [Chartability POUR-CAF](https://chartability.github.io/POUR-CAF/) / [chartability.fizz.studio](https://chartability.fizz.studio/)

The most rigorous thing in this list — 50 heuristics across 7 categories (Perceivable,
Operable, Understandable, Robust, plus Compromising/Assistive/Flexible extensions built
specifically for data experiences, not general web content). Treats accessibility as a
scale, not pass/fail. Real audits with this framework run "weeks of work, 100-200 pages";
a quick self-audit is 30 min-2 hours. We used it mainly for one specific critical failure
mode: **"no data table" is flagged critical**, which is what drove building `DataTable.astro`
for all 8 charts instead of treating it as optional polish. **Worth learning from**: yes,
this is the reference audit tool if we want to formally check a future post rather than
apply guidance from memory.

### [Chart.js accessibility docs](https://www.chartjs.org/docs/latest/general/accessibility.html)

Short and blunt: canvas content is not accessible to screen readers, full stop. No built-in
ARIA, no keyboard nav, no announcements. Recommends exactly what we did — `role="img"` +
`aria-label`, plus fallback content nested inside the `<canvas>` tag for browsers that don't
support canvas at all. **This is the ceiling of what Chart.js gives you** — everything
beyond it is work we do ourselves, chart by chart. **Worth learning from**: yes, it's the
single most important fact in this doc for the "switch libraries?" question.

## Charting libraries, compared

|                           | Chart.js (current)                                                                 | Highcharts                                                                                                                                                                                  | Visa Chart Components                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Rendering                 | Canvas                                                                             | SVG                                                                                                                                                                                         | Web components (Stencil.js), SVG                                                                           |
| Built-in a11y             | None — manual `role`/`aria-label` only                                             | Yes — accessibility module: keyboard nav, screen-reader announcements, sonification ("audio charts")                                                                                        | Yes — core design principle, ships `@visa/keyboard-instructions` + `@visa/visa-charts-data-table` packages |
| Keyboard point-navigation | No (we substitute a data table)                                                    | Yes, built-in                                                                                                                                                                               | Yes, built-in                                                                                              |
| License                   | MIT, free always                                                                   | **Free for personal/non-commercial** (CC BY-NC 3.0) per [Highcharts licensing](https://www.highcharts.com/forum/viewtopic.php?t=41138); commercial tiers $500-$10k+/yr or $176/developer/yr | Open source (Visa-authored, actively developed, 344+ commits)                                              |
| Framework requirement     | None, plain JS                                                                     | None, plain JS                                                                                                                                                                              | Framework-agnostic core, with React/Angular wrappers; heavier dependency footprint                         |
| Bundle weight             | We're already paying for this — `chart.js/auto` tree-shaken to ~220KB in our build | Unknown, need to measure; historically larger than Chart.js                                                                                                                                 | Unknown, likely largest of the three (web-components runtime + design-system scope)                        |

Framing that changes the earlier recommendation: **this site has zero existing Chart.js
investment beyond the one post we just built.** The "switching cost" argument I made
(rebuild 9 charts) is real but shallow — it's one post, not a platform migration. The
license concern I hadn't checked turned out to be a non-issue (free for exactly this use
case). So the actual tradeoff is narrower than I first said: Highcharts buys real keyboard
navigation and screen-reader announcements out of the box, at the cost of an SVG rendering
model and an unmeasured bundle-size hit, for the price of $0 on this site.

## Spike: `chart-yank` rebuilt in Highcharts

Built `HighchartsYankChart.astro`, sitting directly under the Chart.js version in the
published post for side-by-side comparison. Same data, same log-scale threshold-curve
shape, same reference line at 24h, theme pulled from the same CSS custom properties.

**Bundle size — measured, not estimated:**

|                                                            | gzip size |
| ---------------------------------------------------------- | --------- |
| Chart.js chunk (all 9 charts on the page)                  | 72.8 KB   |
| Highcharts core + accessibility module (this 1 chart only) | 145.2 KB  |

Roughly 2x our entire existing chart suite, for one chart. This is the number the earlier
draft of this doc flagged as unmeasured — it's a real cost, not a rounding error, and it
scales per-page-load, not per-chart (Highcharts' core is one shared cost across however many
charts use it, so a page with all 9 charts in Highcharts wouldn't be 9x this — but it's still
a meaningfully heavier floor than Chart.js's).

**Theming**: worked fine via the same `getComputedStyle`-driven token functions
(`colors()`, `ink()`, `gridColor()`, etc.) — no real friction switching the theme layer over.

**Accessibility module**: side-effect import only (`import 'highcharts/modules/accessibility'`)
composes onto the `Highcharts` global automatically — no explicit init call needed, contrary
to what some docs implied. Gets you keyboard tab-into-chart + arrow-key point navigation and
screen-reader point descriptions via `accessibility.point.valueDescriptionFormat`, essentially
for free once the module's imported.

**Still not resolved:**

- Whether the keyboard-nav experience holds up on a chart with as many points/log-scale
  ticks as our real charts have (only spiked the shape, not stress-tested navigation depth)
- Whether 145KB/chart is acceptable given this is a static blog post, not an app — page-weight
  budget for a blog vs a dashboard is a different conversation
- Whether it's worth mixing libraries (Highcharts only where keyboard nav matters most, Chart.js
  elsewhere) vs. picking one for consistency

## Update: rebuilt all 8 charts (not just `chart-yank`) in Highcharts

All 9 Chart.js charts now have a Highcharts sibling directly underneath them in the post
(`SourceYearTable` is a plain `<table>`, no chart needed). Shared boilerplate factored into
`highchartsTheme.ts` (common chart/tooltip/axis options) and `HighchartsCard.astro` (wrapper
markup), same dedup pattern as the Chart.js side.

**Full page weight, measured:**

|                                                           | gzip        |
| --------------------------------------------------------- | ----------- |
| Chart.js — all 9 charts                                   | 72.8 KB     |
| Highcharts core + accessibility module (one shared chunk) | 144.7 KB    |
| + 8 tiny per-chart scripts                                | ~5.4 KB     |
| **Highcharts total — all 8 charts**                       | **~150 KB** |

This confirms the earlier guess: Highcharts' cost is dominated by one fixed shared core, not
multiplied per chart. Adding a 9th or 10th Highcharts chart would cost ~1KB more, not another
145KB. So the real comparison isn't "145KB per chart" — it's a **flat ~150KB floor once,
period**, vs Chart.js's **~73KB for the same 9 charts**. Roughly 2x, and that ratio holds
whether it's 1 chart or all of them.

Next: pick one (or mix), tear out whichever spike loses.

## Standalone accessibility add-on tools (library-agnostic, worth knowing about regardless of chart library choice)

### [Olli](https://umwelt-data.github.io/olli/) (moved from `mitvis/olli` → `umwelt-data/olli`)

Converts a visualization spec into a keyboard-navigable tree view with multiple levels of
detail (overview → drill-down), for screen-reader users specifically. Not clearly
Chart.js-compatible from the docs — examples lean Vega-Lite. **Verdict**: interesting, but
unclear integration cost; would need a spike to know if it's usable outside the Vega-Lite
ecosystem it's demoed with.

### Chart2Music, Data Navigator, AutoVizuA11y (from `dataviza11y/resources`)

Not independently researched yet this session — flagged in the resources repo as
respectively: sonification + keyboard nav, a customizable keyboard-nav toolkit, and a React
library that automates keyboard nav + auto-generated descriptions. All three are candidates
for "bolt accessibility onto whatever chart library we keep" rather than reasons to pick a
specific library. **Worth learning from**: plausible, needs actual eval before relying on
any of them — didn't get past the resource-list description for these three.

## What we already applied, that this research validated rather than introduced new

- Cesal's alt-text formula → every `alt` prop
- fossheim's "don't hide info behind hover, don't rely on color alone" → visible
  `figcaption` (not `sr-only`) + dash patterns on the monthly chart's 3 lines
- POUR-CAF's "no data table = critical" → `DataTable.astro` on all 8 charts
- Highcharts' explicit contrast numbers → actually computed WCAG contrast ratios for our
  palette (axis text 5.57:1, chart colors 5.7-6.7:1 vs background) instead of assuming the
  CVD-validated palette was automatically WCAG-compliant too — those are different checks

## Where to pick this back up

1. Decide if the Highcharts keyboard-nav + screen-reader win is worth an SVG rendering
   model and the unmeasured bundle cost, now that license isn't a blocker
2. If yes: spike one chart in Highcharts, compare bundle size and visual fit before
   committing to a full rewrite
3. Either way: evaluate Olli as a library-agnostic bolt-on before ruling it out on
   integration-cost grounds alone — that verdict above was reached without reading
   Olli's actual integration docs, only its landing page
