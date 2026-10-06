# Architecture: layers, functional core, imperative shell

Rules for code in this repo (Astro + TypeScript). The charts in
`src/components/npm-study/` are the reference implementation.

## Functional core, imperative shell

- Put decisions in pure functions: data in, data out, no DOM, no timers, no
  module-level reads of `document` or `window`. These are the "core".
- Keep the "shell" thin. The shell is the code that touches the outside world:
  mounting a chart, adding event listeners, reading computed styles. It calls
  the core and does nothing clever itself.
- Inject what the core would otherwise read from the environment. Example:
  `buildThresholdDefinition(config, scaleType, fontPx)` takes `fontPx` instead
  of reading it from the DOM, so it runs under plain Vitest.
- A module that reads the DOM at import time (like `chart-utils.ts`) can only
  be imported by client code. Split the pure half out (`font-size.ts`) so the
  logic stays testable.

## Separate UI from logic, keep components low

- `.astro` files hold markup and wiring only. No branching logic, formatting,
  data shaping or chart configuration inside a component's frontmatter or
  `<script>`. Move it to a `.ts` module and import it.
- A component's `<script>` should read like: find the element, parse its
  config, call a `mount*` function. Roughly ten lines.
- Build order, lowest to highest:
  1. **Data and types** (`data.ts`): constants and plain types.
  2. **Pure logic** (`ref-lines.ts`, `font-size.ts`, `monthly-detections.ts`
     data prep): formatting, lookups, calculations.
  3. **Definition builders** (`threshold-definition.ts`): config in, chart
     definition out. No DOM.
  4. **Mount layer** (`mount-threshold-chart.ts`): the only code that touches
     the DOM. Takes its inputs as arguments.
  5. **Components** (`*.astro`): markup plus one thin `<script>`.
- Dependencies point downward only. A lower layer never imports a higher one.
- Small presentational components (`chart-heading`, `data-table`,
  `ref-line-legend`) stay free of client logic.

## Tests follow the layers

| Layer                                           | How it is tested                                         | Where                                       |
| ----------------------------------------------- | -------------------------------------------------------- | ------------------------------------------- |
| Pure logic, definition builders                 | Vitest unit tests (node), with fast-check for properties | `*.test.ts`                                 |
| Mount layer, anything needing a DOM or layout   | Vitest browser mode (real Chromium), no site server      | `*.browser.test.ts`                         |
| Real page behaviour: real pointer, zoom, reflow | Playwright against the dev server                        | `e2e/`, run with `pnpm run test:e2e:local`  |
| Pixel baselines and axe on every page           | Playwright in Docker                                     | `e2e-visual/`, run with `pnpm run test:e2e` |

- Test at the lowest layer that can observe the behaviour. Do not write an e2e
  test for something a unit or browser test can cover.
- Write the test first and watch it fail. Mutate the code once to confirm the
  test can fail.
- `pnpm test` runs the unit and browser projects. Run lint, format check and
  the build before pushing.

## Types and lint

- Do not cast to silence the compiler. `typescript/no-unnecessary-type-assertion`
  and `typescript/no-unsafe-type-assertion` are enabled; fix the types instead
  (type guard, better inference, `satisfies`).
- Lint runs with `--deny-warnings`, so a warning fails CI.
