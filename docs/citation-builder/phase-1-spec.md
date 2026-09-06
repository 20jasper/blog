# Citation Builder — Phase 1 Implementation Spec

This is the build spec for Phase 1 (V1) only: a single-citation Bluebook
formatting tool, no persistence. Full history, review notes, and deferred
scope (V2, subsequent history, session law, etc.) live in the master
spec — reference it if you want the "why," not just the "what."

**Bluebook edition:** The Bluebook, 22nd edition (Harvard Law Review
Association, May 2025). If a rule referenced here has since changed
editions, that's a deliberate spec revision, not something to silently
work around.

**Disclaimer decision:** no in-UI warning is shown for unvalidated
reporter/court fields. This is a documented limitation (§6), not a UI
feature. Do not add one.

---

## 1. Glossary — use these terms, no others

| Term                    | Meaning                                                                                                                            | Rule                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Full citation**       | First, complete citation of a source. Not "long cite."                                                                             | Rule 10 (cases), Rule 12 (statutes)      |
| **Short form**          | Abbreviated citation to a source already cited in full. Not "short cite."                                                          | Rule 10.9 (cases), Rule 12.10 (statutes) |
| **Pincite**             | The specific page, star page, or subsection pointing to exactly where cited support appears.                                       | —                                        |
| **Reporter**            | Publication series a case is printed in (e.g., N.E.3d, F.3d).                                                                      | —                                        |
| **Docket number**       | Court-assigned case number, used for unreported cases.                                                                             | Rule 10.8.1                              |
| **Database identifier** | Westlaw/Lexis/Bloomberg citation string (e.g., 2021 WL 4269952).                                                                   | Rule 10.8.1(a)                           |
| **Code**                | The statutory compilation being cited, official or annotated.                                                                      | Rule 12                                  |
| **Id.**                 | Short form indicating the citation is to the same, and only, source cited immediately before. Requires manual confirmation (§5.7). | Rule 4.1                                 |

If a new field or label is needed and isn't in this table, check it
against the rule itself before inventing terminology.

---

## 2. Rule reference map

| Feature                                               | Rule           |
| ----------------------------------------------------- | -------------- |
| Case citation, general structure                      | Rule 10        |
| Case-name abbreviation (not automated — user-entered) | Rule 10.2      |
| First-listed party only, each side                    | Rule 10.2.1    |
| Unreported opinions, in electronic database           | Rule 10.8.1(a) |
| Unreported opinions, slip opinion only                | Rule 10.8.1(b) |
| Short form for cases                                  | Rule 10.9      |
| Statute citation, general structure                   | Rule 12        |
| Official code preference                              | Rule 12.3      |
| Supplements / pocket parts                            | Rule 12.3.1(e) |
| Short form for statutes                               | Rule 12.10     |
| Id.                                                   | Rule 4.1       |
| Month abbreviations                                   | Table 12       |

Every generated citation must be traceable to a rule here. Anything not
traceable is a labeled UI convenience or a listed limitation (§6) — never
an invented convention.

---

## 3. Data model

### 3.1 Shared fields (all case types)

| Field     | Input                               | Required?                                               |
| --------- | ----------------------------------- | ------------------------------------------------------- |
| Case type | select: `v.` / `In re` / `Ex parte` | required                                                |
| Party 1   | text                                | required                                                |
| Party 2   | text                                | required only if case type = `v.`                       |
| Court     | text (freeform, unvalidated)        | required                                                |
| Pincite   | text                                | optional for full citation; **required** for short form |

Full case name is assembled from case type + party fields — never typed
directly. No "short name override" field: the short form is always
Party 1 -- a deliberate V1 simplification, not Rule 10.2.1 (which
governs first-listed-party truncation in the _full_ citation, not
short-form party choice). The real short-form rule, Rule 10.9(a)(i),
keeps whichever party is more distinctive; we don't automate that
judgment call. See §5.7 for the divergence this causes against a real
citation.

### 3.2 Reported case only

| Field      | Input                        | Required? |
| ---------- | ---------------------------- | --------- |
| Volume     | text/number                  | required  |
| Reporter   | text (freeform, unvalidated) | required  |
| First page | text/number                  | required  |
| Year       | number                       | required  |

### 3.3 Unreported case only

| Field               | Input                                                  | Required?                                                         |
| ------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Availability        | toggle: "In electronic database" / "Slip opinion only" | required                                                          |
| Docket number       | text                                                   | required                                                          |
| Database identifier | text                                                   | required if Availability = database; **disabled** if slip opinion |
| Month               | select (Table 12 list)                                 | required                                                          |
| Day                 | number 1–31                                            | required                                                          |
| Year                | number                                                 | required                                                          |

### 3.4 Statute only

| Field                  | Input                                                   | Required?                                                        |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| Code type              | toggle: "Official code" / "Annotated / unofficial code" | required                                                         |
| Code abbreviation      | text (freeform, unvalidated)                            | required                                                         |
| Section                | text                                                    | required                                                         |
| Publisher              | text                                                    | required only if Code type = annotated; **disabled** if official |
| Year                   | number                                                  | required                                                         |
| Supplement designation | text (e.g. "Supp.")                                     | optional                                                         |
| Supplement year        | number                                                  | optional, shown only if supplement designation is filled         |

### 3.5 Field state and interaction rules

- Every field is always visible. Type/toggle selections change each
  field's **required / optional / not-used** state, never its visibility.
- Fields marked **not used** for the current type are `disabled`, not
  just dimmed — prevents entering data that silently disappears at
  generation.
- Fields shared across types are visually marked (distinct from the
  required/optional/not-used tag) so it's clear why a value persisted
  after switching type.
- Switching type never clears any field's value.

---

## 4. Normalization rules

### 4.1 Docket number auto-prefix

```
/^(?:case\s+no\.?|docket\s+no\.?|no\.?)(?=\s|$|\d)\s*/i
```

r[normalize.docket]
Strip if matched (prefix followed by whitespace, end, or a digit only —
**not** by another letter, which was a confirmed bug: `"North-123"` must
never become `"No. rth-123"`), then prepend `No. `.

> **Spec revision (2026-09-05):** the original lookahead was `(?=\s|$)`,
> which does not match a prefix directly followed by a digit with no
> separating space (e.g. `"No.05-1234"`) — so it would fail to strip
> that prefix and produce `"No. No.05-1234"` instead of the intended
> `"No. 05-1234"`, contradicting the §8.4 test table. Widened to
> `(?=\s|$|\d)` so a digit also counts as a valid boundary. The
> letter-boundary bug (`"North-123"`, `"Norfolk County 44"`) is still
> guarded against, since a following letter still fails the lookahead.

### 4.2 Statute section auto-prefix

r[normalize.section]
If the value already starts with `§` or `§§`, normalize spacing after
the symbol and leave as-is (preserves user-entered multi-section `§§`).
Otherwise prepend `§ `.

### 4.3 Date assembly

r[normalize.date]
Month (Table 12 abbreviation, from a fixed select list) + Day + Year are
combined as `[Month] [Day], [Year]` — e.g. `Sept. 17, 2021`. No freeform
date text field exists.

### 4.4 Case name assembly

r[case-name.assembly]
`Party1 v. Party2`, `In re Party1`, or `Ex parte Party1` depending on
case type.

r[case-name.short-form]
Short form always uses Party 1 alone (or the assembled name for
`In re`/`Ex parte`) -- a deliberate simplification per Rule 10.9(a)(i);
see §3.1 and §5.7 for why this can diverge from real Bluebook practice.

---

## 5. Output rules

### 5.1 Sentence form

All output is a standalone, capitalized, period-terminated citation.
Clause form is out of scope.

### 5.2 Name variant

Segmented control: **Full name / Short name / No name.** A live example
line beneath the control shows the current selection applied to the
user's actual data.

### 5.3 Typeface toggle

Toggle: **Italic / Underline** for case names and _Id._

### 5.4 Long-form structure (reported case)

```
[Name], [Volume] [Reporter] [First page], [Pincite] ([Court] [Year]).
```

r[citation.reported-long-form]
Full citation for a reported case follows the template above: assembled
name, then volume/reporter/first page, an optional pincite, and a
court/year parenthetical -- framed as one capitalized, period-terminated
sentence.

> **External verification (2026-09-06):** confirmed against
> [Georgetown Law Library's Bluebook guide — Federal Courts](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339383):
>
> > Six-element format: Case name + Volume + Reporter abbreviation (F.,
> > F.2d, or F.3d) + First page + Court abbreviation + Year
> >
> > Example: _Universal City Studios, Inc. v. Corley, 273 F.3d 429 (2d
> > Cir. 2001)_
>
> Pincite placement confirmed by the same page's U.S. Supreme Court
> example: _Roe v. Wade, 410 U.S. 113, 164 (1973)_ -- pincite follows
> the first page directly with a comma, no separate label, matching
> our template exactly.

### 5.5 Long-form structure (unreported case)

```
[Name], No. [Docket], [Database ID], at *[Pincite] ([Court] [Month] [Day], [Year]).
```

r[citation.unreported-long-form]
Database ID segment omitted entirely if Availability = slip opinion.
Pincite (with its "at *" star-page marker) is omitted entirely when
absent, same as the reported-case template.

> **External verification (2026-09-06):** confirmed verbatim against
> [Georgetown Law Library's Bluebook guide — Unpublished Opinions](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339386):
>
> > United States v. Bennett, No. 05-CR-6050 CJS, 2005 WL 2709572
> > (W.D.N.Y. Oct. 21, 2005)
>
> and the slip-opinion variant, same page:
>
> > United States v. Bennett, No. 05-CR-6050 CJS (W.D.N.Y. Oct. 21, 2005)
>
> Both match our §8.3 golden-case test output exactly, character for
> character.

### 5.6 Long-form structure (statute)

> **Spec revision (2026-09-06):** unlike §5.4/§5.5 for cases, no §5.x
> output-template subsection for statutes existed in the original
> spec draft -- only the data model (§3.4) and one golden case
> (§8.3: `Ohio Rev. Code Ann. § 3767.32(A) (West 2025).`). The two
> non-supplement templates below are inferred directly from that
> golden case plus the §3.4 field model and are low-risk. The
> supplement-present template's join format (`[Year] & [Supplement
designation] [Supplement year]`) is a best-effort reading of Rule
> 12.3.1(e) with no golden case to confirm it against -- flag if
> that's not the intended format.

```
[Code abbreviation] § [Section] ([Year]).
```

r[citation.statute-long-form]
Official code (no Publisher field): code abbreviation, section, and
year in parentheses -- no publisher segment.

```
[Code abbreviation] § [Section] ([Publisher] [Year]).
```

Annotated code: same as official, with Publisher inserted before Year
in the parenthetical. Matches the §8.3 golden case exactly.

```
[Code abbreviation] § [Section] ([Publisher] [Year] & [Supplement designation] [Supplement year]).
```

When Supplement designation is filled (annotated code only, per §3.4):
append `& [Supplement designation] [Supplement year]` inside the same
parenthetical, after the base Year.

### 5.7 Id. gating

_Id._ is available only when: mode = short form, type ≠ statute, **and**
the user checks a confirmation control stating the citation immediately
follows a citation to the same source, and only that source. Manual by
design (§6 — no citation-sequence memory).

When Id. is selected, the name-variant control is hidden.

> **External verification (2026-09-06):** confirmed against
> [Georgetown Law Library's Bluebook guide — Short Forms for Cases](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339389):
>
> > Id. is used when the case appeared in the immediately preceding
> > citation and the citation included only that case.

```
[Name?], [Volume] [Reporter] at [Pincite].
```

r[citation.reported-short-form]
Short form (reported case): name (per the §5.2 variant -- full, short,
or omitted entirely, dropping its trailing comma too), then volume,
reporter, and pincite joined by "at". Pincite is required for short
form (§3.1). _Id._ replaces the entire name-and-reporter portion with
just `Id.`, italicized: `Id. at [Pincite].`

> **External verification (2026-09-06):** structure confirmed against
> the same Georgetown page: given _Universal City Studios, Inc. v.
> Corley, 273 F.3d 429 (2d Cir. 2001)_ at page 435 -- `Corley, 273
F.3d at 435` (short name), `273 F.3d at 435` (no name), `Id. at
435`.
>
> **Divergence, noted deliberately:** Georgetown's short-name example
> keeps party 2 ("Corley"), not party 1 -- real Bluebook practice
> (Rule 10.9(a)(i)) keeps whichever party is more distinctive, here
> dropping the corporate plaintiff. Our tool doesn't automate that
> judgment call: per §3.1/§4.4, short form is always Party 1
> (`Universal City Studios, Inc., 273 F.3d at 435.` for this example),
> a documented V1 simplification, not a bug.

### 5.8 Copy behavior

Clipboard write includes both `text/html` (italic/underline markup
intact) and `text/plain`. Manual-selection fallback (if Clipboard API
write fails) changes the copy button's label to confirm selection
occurred — no live-region announcement needed.

---

## 6. Known limitations (V1)

- No Table 1 validation on reporter/court abbreviations — freeform, no
  UI disclaimer (decided; do not add one).
- No Rule 10.2 case-name abbreviation automation.
- No subsequent history, no session-law statute citations, no
  constitutions/regulations/court rules/record citations, no
  parallel/historical dual-reporter citations.
- **No citation-sequence memory.** _Id._ can't be verified by the tool —
  it has no model of the surrounding document — hence the manual
  confirmation in §5.7 rather than an automatic option.
- English-only. No print/export beyond clipboard copy. Nothing persists
  between sessions (that's Phase 2).

---

## 7. Architecture requirements (binding)

### 7.1 Single intermediate representation

r[segment.representation]
Citation assembly MUST produce one internal representation — an ordered
list of segments, each `{ text: string, italic: boolean }` — never two
independently hand-built strings (one HTML, one plain text). One shared
renderer converts that segment list to HTML and to plain text. If HTML
and plain-text output ever diverge, that's a renderer bug, not a builder
bug.

### 7.2 Case type is data, not branches

r[case-type.data]
The case-type table (`v.`, `In re`, `Ex parte`) MUST be a small ordered
list of records (`{ id, label, template }`), not `if/else`/`switch`
branches duplicated across long-form, short-form, and Id. code paths.
Adding a case type later should mean adding one record, not touching any
builder function.

### 7.3 Composable assembly, not per-type monoliths

r[assemble.composable]
Decompose citation construction into small, independent, ordered steps
applied uniformly regardless of type: assemble name → open core citation
→ append pincite → close parenthetical (court/date) → apply sentence
framing. Each step is a pure function operating on the segment list from
§7.1. No function may special-case a full citation end-to-end per source
type.

### 7.4 Sentence framing is a parameter

r[framing.parameter]
Leading capitalization and the terminal period are applied by the shared
renderer as a configurable framing step, not hardcoded inline in each
builder's template string.

### 7.5 Tech stack

Deliberately unspecified — choose based on the actual delivery target.
The one binding requirement: the citation logic module must be pure and
DOM-free (no framework imports, testable in isolation), regardless of
what wraps it.

---

## 8. Testing plan

### 8.1 Two-tier structure

**Tier 1 (build first) — domain consistency.** A programmatically
generated combinatorial matrix (§8.2) proving the implementation is
internally consistent with itself.

**Tier 2 (layer in after Tier 1 passes) — golden, externally-sourced
cases.** Real citations verified against an external authority, never
generated from or edited to match the implementation. No version is
"rule-validated" (as opposed to merely self-consistent) until this tier
passes.

### 8.2 Combinatorial matrix (Tier 1)

| Dimension          | Values                        | Applies to                  |
| ------------------ | ----------------------------- | --------------------------- |
| Source type        | reported, unreported, statute | all                         |
| Mode               | full citation, short form     | all                         |
| Name variant       | full, short, none             | case types only             |
| Id. requested      | true, false                   | short form, case types only |
| Availability       | database, slip opinion        | unreported only             |
| Code type          | official, annotated           | statute only                |
| Supplement present | true, false                   | statute only                |

**Exclusion rules** (generator must skip, not silently produce output
for):

- Id. + type = statute → invalid.
- Id. + mode = full citation → invalid.
- Id. + name variant ≠ none → invalid (Id. hides the name-variant
  control).
- Name variant applied to statute → invalid.

Build the generator, exclusions, and fixtures as version-controlled test
code, not as a hand-maintained prose list.

### 8.3 Golden cases (Tier 2)

- `Ohio Rev. Code Ann. § 3767.32(A) (West 2025).`
- `Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).`
- `State v. Lucko, No. 2021CA0007, 2021 WL 4269952, at *1–2 (Ohio Ct. App. Sept. 17, 2021).`
- _United States v. Bennett_, No. 05-CR-6050 CJS, 2005 WL 2709572
  (W.D.N.Y. Oct. 21, 2005) — database-available; also test the
  slip-opinion variant (same citation minus database ID) per Rule
  10.8.1(b).
- _Marbury v. Madison_ — confirms parallel/historical-reporter citations
  fail as a documented non-goal, not as a crash.

### 8.4 Normalization tests

| Input                    | Expected                                        |
| ------------------------ | ----------------------------------------------- |
| `05-CR-6050 CJS`         | `No. 05-CR-6050 CJS`                            |
| `No. 05-CR-6050 CJS`     | `No. 05-CR-6050 CJS`                            |
| `Case No. 1:20-cv-01234` | `No. 1:20-cv-01234`                             |
| `Docket No. 21-1234`     | `No. 21-1234`                                   |
| `No.05-1234`             | `No. 05-1234`                                   |
| `North-123`              | `No. North-123` (boundary-safety check)         |
| `Norfolk County 44`      | `No. Norfolk County 44` (boundary-safety check) |
| `3767.32(A)`             | `§ 3767.32(A)`                                  |
| `§ 3767.32(A)`           | `§ 3767.32(A)`                                  |
| `§3767.32(A)`            | `§ 3767.32(A)`                                  |
| `1983`                   | `§ 1983`                                        |
| `§§ 1983, 1988`          | `§§ 1983, 1988`                                 |
| `§§1983,1988`            | `§§ 1983,1988`                                  |

Additionally: a property test running the same normalization logic
against the `reporters-db` dataset (github.com/freelawproject/reporters-db,
~1,000 real reporter strings) as a test-time-only corpus — never vendored
into the shipped tool, never used for runtime validation or autocomplete.
Purely a stress test for the normalization functions against real-world
strings the hand-written test list wouldn't think to include.

> **Tried and removed (2026-09-06):** built as an opt-in `pnpm
test:stress`, fetching `reporters-db` live and asserting idempotency
>
> - "never throws" across every reporter string. Manual spot-checking
>   found zero strings in the entire ~3,592-entry corpus ever exercised
>   the strip branch of either normalization function (no reporter
>   starts with a real `No.`/`Case No.` prefix, none contain `§`) — so
>   it only ever validated the passthrough path, not the logic it was
>   meant to stress. Removed rather than kept for a false sense of
>   coverage.

### 8.5 Rejection paths

Missing required field per type; short form requested with no pincite;
Id. requested when ineligible; Availability = slip opinion with a
database ID still entered (must be disabled/ignored, not silently
included).

### 8.6 UI layer tests

- Switching type preserves shared field values; disabled state applied
  correctly to not-used fields.
- Tags relabel correctly on type switch.
- Stale-marking triggers on any field edit after generation.
- Id. checkbox gating and its effect on hiding the name-variant control.
- Clipboard write called with correct HTML + plain-text payloads (mock
  `navigator.clipboard`).

### 8.7 Manual / cross-target tests

- Paste into Word desktop and Google Docs web; confirm italic and
  underline variants both survive in both targets.
- Paste into a plain-text target to confirm the `text/plain` fallback is
  clean.
- Browser zoom to 200%; confirm no layout breakage.
- Keyboard-only pass: tab order through type selector → fields →
  generate → output controls, with visible focus at every step.

### 8.8 Accessibility

Automated pass (e.g., axe-core), plus the manual keyboard pass above.
Contrast checked at WCAG AA minimum, including the disabled/dimmed state.

---

## 9. Explicitly out of scope for Phase 1

Subsequent history, statute session-law citations, live reporter/court
validation at runtime, all persistence/save/load/notes (Phase 2),
parallel/historical citations, constitutions, regulations, court rules,
record citations. See the master spec's deferred-features section for
why each was cut and what would need to be resolved to pick it back up.
