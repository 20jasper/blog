# Citation Builder — Architecture Spec

Tool-internal decisions for the Phase 1 (V1) build: architecture,
rendering, data model, and process history. No Bluebook citation-format
content — that's `domain-spec.md`, which this doc's rules are never
part of (nothing here carries external, verified-against-a-rule
status).

---

## 1. Architecture requirements (binding)

### 1.1 Single intermediate representation

r[segment.representation]
Citation assembly MUST produce one internal representation — an ordered
list of segments, each `{ text: string, emphasized: boolean }` — never
two independently hand-built strings (one HTML, one plain text). One
shared renderer converts that segment list to HTML and to plain text. If
HTML and plain-text output ever diverge, that's a renderer bug, not a
builder bug.

r[segment.emphasis-is-abstract]
The segment flag is `emphasized`, **not** `italic`. Whether emphasis
renders as italic or underline is a render-time setting
(`domain-spec.md` §5.3), applied uniformly by the renderer — builders
mark _what_ is emphasized (case names, `Id.`), never _how_. An earlier
draft specified `{ text, italic: boolean }`, which could not represent
the underline toggle at all: a binding architecture rule contradicting
a stated output feature.

### 1.2 Case type is data, not branches

r[case-type.data]
The case-type table (`v.`, `In re`, `Ex parte`) MUST be a small ordered
list of records (`{ id, label, template }`), not `if/else`/`switch`
branches duplicated across long-form, short-form, and Id. code paths.
Adding a case type later should mean adding one record, not touching any
builder function.

### 1.3 Composable assembly, not per-type monoliths

r[assemble.composable]
Decompose citation construction into small, independent, ordered steps
applied uniformly regardless of type: assemble name → open core citation
→ append pincite → close parenthetical (court/date) → apply sentence
framing. Each step is a pure function operating on the segment list from
§1.1. No function may special-case a full citation end-to-end per source
type.

### 1.4 Sentence framing is a parameter

r[framing.parameter]
Leading capitalization and the terminal period are applied by the shared
renderer as a configurable framing step, not hardcoded inline in each
builder's template string.

### 1.5 Tech stack

Deliberately unspecified — choose based on the actual delivery target.
The one binding requirement: the citation logic module must be pure and
DOM-free (no framework imports, testable in isolation), regardless of
what wraps it.

---

## 2. Rendering and copy behavior

### 2.1 Rendering model

No explicit Generate action (an earlier draft specified one, with a
stale-marking model for edits made after it ran — see §5 and §6 item 9);
descoped for V1. Every field — data or display — re-renders the output
live on each edit, validated against the active source type's required
fields (`domain-spec.md` §3). Before any required field has a value, the
output area shows a placeholder, not a partial citation.

### 2.2 Copy behavior

Clipboard write includes both `text/html` (emphasis markup intact) and
`text/plain`. Manual-selection fallback (if Clipboard API write fails)
changes the copy button's label to confirm selection occurred — no
live-region announcement needed.

---

## 3. Concrete data model

Field IDs below are normative — tests, UI, and logic refer to these
exact names. Types are given in TypeScript notation for precision; no
particular language is implied (§1.5).

### 3.1 Enumerations

```ts
type SourceType = 'reported' | 'unreported' | 'statute';
type CaseType = 'v' | 'inRe' | 'exParte';
type Availability = 'database' | 'slipOpinion';
type CodeType = 'official' | 'annotated';
type MaterialLoc = 'mainVolume' | 'both' | 'supplementOnly';
type Mode = 'full' | 'short';
type NameVariant = 'fullName' | 'party1' | 'party2' | 'none';
type Emphasis = 'italic' | 'underline';
type SpanSep = 'hyphen' | 'enDash';

type Month =
	| 'Jan.'
	| 'Feb.'
	| 'Mar.'
	| 'Apr.'
	| 'May'
	| 'June'
	| 'July'
	| 'Aug.'
	| 'Sept.'
	| 'Oct.'
	| 'Nov.'
	| 'Dec.';
```

r[month.literal-values]
`Month` values are the rendered strings themselves — not indices, not
`Date` objects. `May`, `June`, and `July` take no period; September is
`Sept.` Storing the literal removes any chance of a formatting layer
reintroducing `Sep.`

### 3.2 Field data

One flat object. Fields not used by the active `sourceType` are
`disabled` in the UI but retain their values (never cleared on type
switch).

```ts
interface CitationFields {
	sourceType: SourceType;

	// shared, case types only
	caseType: CaseType;
	party1: string;
	party2: string; // used only when caseType === 'v'
	court: string; // optional — r[court.optional] (domain-spec.md)
	pincite: string; // freeform; parsed per §3.4

	// reported only
	volume: string; // string, not number — may carry letters
	reporter: string;
	firstPage: string; // string — may carry letters in some reporters
	year: string; // 4-digit, validated as numeric

	// unreported only
	availability: Availability;
	docket: string;
	databaseId: string; // required iff availability === 'database'
	month: Month;
	day: string; // '1'..'31', validated numeric
	dateYear: string;

	// statute only
	codeType: CodeType;
	popularName: string; // optional — r[statute.popular-name] (domain-spec.md)
	statuteTitle: string; // optional — r[statute.title] (domain-spec.md)
	codeAbbrev: string;
	section: string;
	publisher: string; // required iff codeType === 'annotated'
	materialLocation: MaterialLoc;
	codeEditionYear: string; // unused iff materialLocation === 'supplementOnly'
	supplementDesig: string; // e.g. 'Supp.', 'Supp. I', 'Supp. V'
	supplementYear: string;
}
```

r[types.numeric-fields-are-strings]
Numeric-looking fields are typed `string`, not `number`. Volume, first
page, and section routinely carry non-numeric characters
(`14A`, `703-309`, `3767.32(A)`), leading zeros are meaningful in docket
numbers, and an empty field must be distinguishable from zero. Numeric
_validation_ happens at the boundary; storage is textual.

### 3.3 Display state

Separate from field data because it is presentation, not source data,
and it is not saved in Phase 2.

```ts
interface DisplayState {
	mode: Mode;
	nameVariant: NameVariant; // meaningful only when mode === 'short'
	useId: boolean; // gated per r[id.gating] (domain-spec.md)
	emphasis: Emphasis; // default 'italic'
	spanSep: SpanSep; // default 'hyphen' — r[normalize.span-separator] (domain-spec.md)
}
```

### 3.4 Pincite parsing

r[pincite.parse]
The pincite field is one freeform string parsed into comma-separated
components. Span reduction (r[normalize.span-digits], `domain-spec.md`)
applies **only** to components matching a pure numeric span; every
other component passes through verbatim. This is what lets footnote and
paragraph pincites work without a dedicated field.

```ts
interface PinciteOptions {
	separator: '-' | '–';
	starPages: boolean;
}

function parsePincite(raw: string, opts: PinciteOptions): string;
```

Algorithm:

1. Split on `,`; trim; drop empties.
2. For each component, test against `/^(\d+)\s*[-–]\s*(\d+)$/`.
   - Match → reduce the closing number per r[normalize.span-digits] and
     rejoin with the selected separator.
   - No match → keep verbatim.
3. If `starPages`, prefix **each** component with `*` — Rule 10.8.1(a)
   marks every star page individually (`at *1, *3`), not once per list.
4. Rejoin with `, `.

Verified behaviour (13/13 in test):

| Input          | Options | Output        |
| -------------- | ------- | ------------- |
| `214`          | —       | `214`         |
| `208-214`      | —       | `208-14`      |
| `208-214`      | en dash | `208–14`      |
| `1-2`          | star    | `*1-2`        |
| `1, 3`         | star    | `*1, *3`      |
| `4, 12`        | star    | `*4, *12`     |
| `490, 495`     | —       | `490, 495`    |
| `188, 190-193` | —       | `188, 190-93` |
| `495-497, 501` | —       | `495-97, 501` |
| `1099-1101`    | —       | `1099-101`    |
| `495-97`       | —       | `495-97`      |
| `1137 n.4`     | —       | `1137 n.4`    |
| `¶ 12`         | —       | `¶ 12`        |

r[pincite.no-validation]
Components that aren't pure numeric spans are not validated. `1137 n.4`
and `¶ 12` are accepted because they're correct Bluebook forms the tool
shouldn't obstruct; a typo in the same position is equally accepted.
Consistent with the freeform stance taken for reporters and courts
(`domain-spec.md` §6).

### 3.5 Segment representation

```ts
interface Segment {
	text: string;
	emphasized: boolean;
}
type Citation = Segment[];

function renderHtml(c: Citation, e: Emphasis): string;
function renderText(c: Citation): string;
```

Per r[segment.emphasis-is-abstract], `emphasized` is abstract; the
`Emphasis` argument decides `<em>` versus `<u>` at render time.
`renderText` drops emphasis entirely.

---

## 4. Tool-internal rules

No Bluebook authority. These are implementation decisions; a
jurisdiction variant would not change them.

| rule                               | category     | rationale                                                        |
| ---------------------------------- | ------------ | ---------------------------------------------------------------- |
| `normalize.span-input`             | parsing      | Accepts reduced or full closing page; both normalize identically |
| `normalize.span-passthrough`       | parsing      | Guards the span normaliser so footnote/paragraph forms survive   |
| `pincite.parse`                    | parsing      | Comma-split algorithm (§3.4)                                     |
| `pincite.no-validation`            | parsing      | Consistent with freeform stance for reporters/courts             |
| `statute.supplement-pairing`       | validation   | Designation and year required together                           |
| `types.numeric-fields-are-strings` | data model   | Volumes/sections carry non-numeric characters                    |
| `month.literal-values`             | data model   | Stores rendered literal, not an index                            |
| `segment.representation`           | architecture | Single IR, one renderer                                          |
| `segment.emphasis-is-abstract`     | architecture | Builders mark what, renderer decides how                         |
| `case-type.data`                   | architecture | Case types as records, not branches                              |
| `assemble.composable`              | architecture | Ordered pure steps over the segment list                         |
| `framing.parameter`                | architecture | Sentence framing configurable                                    |

---

## 5. Explicitly out of scope for Phase 1

Subsequent history, statute session-law citations, live reporter/court
validation at runtime, all persistence/save/load/notes (Phase 2),
parallel/historical citations, constitutions, regulations, court rules,
record citations. An explicit **Generate** action with a stale-marking
model for edits made after it ran (see §6 item 9) — every field
re-renders the output live instead (§2.1). See the master spec's
deferred-features section for why each was cut and what would need to
be resolved to pick it back up.

---

## 6. Revision log — corrections applied to the prior draft

Each entry is a defect found in review, not a scope change. Listed so a
reader of the earlier draft knows what changed and why. Section numbers
below are as they stood at the time of each finding and may reference
material that has since moved to `domain-spec.md` or been removed
entirely.

**Correctness — produced invalid citations:**

1. **Slip-opinion pincite form** (r[citation.unreported-pincite-form],
   `domain-spec.md` §5.5). The prior draft treated the slip-opinion
   variant as "the same citation minus the database ID," which emitted
   `No. 2021CA0007, at *1 (...)`. Star pages are inserted by
   Westlaw/Lexis; a slip opinion has none. The Availability toggle now
   switches pincite form (`at *N` ↔ `slip op. at N`), not just segment
   presence. Rule 10.8.1(a)/(b).

2. **Name variants applied to full citations**
   (r[name-variant.short-form-only], `domain-spec.md` §5.2). Rule 10.9
   short forms are short forms; a full citation always carries the
   complete case name. The prior draft scoped the control to neither
   mode, so the combinatorial test matrix would have asserted invalid
   full citations as correct.

3. **Court required always** (r[court.optional], `domain-spec.md` §3.1).
   Rule 10.4 omits the court when the reporter identifies it —
   `Roe v. Wade, 410 U.S. 113, 164 (1973).` A mandatory Court field made
   every U.S. Supreme Court citation impossible to render correctly.

4. **Short form fixed to Party 1** (r[short-form.party-choice],
   `domain-spec.md` §3.1). Rule 10.9(a)(i) keeps the more distinctive
   party — "Corley," not "Universal City Studios, Inc." Now a Party 1 /
   Party 2 user choice. (The prior draft's own correction of the Rule
   10.2.1 miscitation was right; the resulting always-Party-1 rule still
   shipped wrong output.)

5. **IR could not represent underline** (§1.1,
   r[segment.emphasis-is-abstract]). Segment shape was
   `{ text, italic }` while the display preferences offer an
   italic/underline toggle — a binding architecture rule contradicting a
   stated feature. Now `{ text, emphasized }`, with the italic/underline
   decision made at render time.

**Internal contradictions:**

6. **Supplement year visibility** (`domain-spec.md` §3.4). One passage
   said "shown only if supplement designation is filled"; another said
   fields are always visible and only their enabled state changes.
   Resolved in favour of the latter — all supplement fields stay
   visible; Material location changes their _enabled_ state only.

7. **Supplement scope** (r[statute.supplement-scope], `domain-spec.md`
   §3.4). One passage said annotated-only; another said unconditional.
   Resolved to both code types, now confirmed against `Haw. Rev. Stat.
§ 703-309 (2014 & Supp. 2017).` — an official code carrying a
   supplement with no publisher.

8. **Rule map gaps** (`domain-spec.md` §2). Rules 10.4 and 10.9(a)(i)
   are now cited in normative text and added to the map, which requires
   every rule used to appear there.

**Undefined behavior the tests assumed:**

9. **Generation and staleness model** (§2.1 at the time). An earlier
   testing draft tested "stale-marking" against a model the spec never
   defined. Specified: an explicit Generate action, display controls
   re-rendering live, data edits marking output stale, stale output
   staying copyable. Descoped for V1 before implementation (§5) — §2.1
   now specifies live rendering only.

10. **_Marbury_ assertion.** "Fails as a non-goal, not a crash" was
    untestable. Now: renders the single reporter given, parallel
    citation silently absent, no error.

**Gaps filled:**

11. Unreported and statute **short-form templates** (`domain-spec.md`
    §5.8, §5.9) — only the reported short form existed.
12. **Pincite range normalization** (`domain-spec.md` §4.3) — hyphen →
    en dash, with the star marker attaching once to the whole range.
13. **Table 12 months enumerated** (r[date.month-list],
    `domain-spec.md`) — the select exists to make `Sep.` unrepresentable,
    so the twelve exact strings belong in the spec.
14. **Statute pincite** (`domain-spec.md` §3.1) — explicitly not used;
    the statutory pinpoint is the subsection, already inside the Section
    field.
15. **_Id._ for statutes** (`domain-spec.md` §5.7, §6) — restriction
    reframed as a V1 simplification rather than presented as Rule 4.1's
    content.
16. **Glossary** (`domain-spec.md` §1) — added slip opinion, star page,
    name variant, Availability, Code type, segment, stale; added the
    `r[...]` tagging convention.
17. **Test matrix dimensions** — added pincite presence, court presence,
    and typeface; corrected name-variant scoping and added the
    single-party exclusion.

**Found while confirming the previously-unconfirmed supplement format:**

18. **Supplement-only citations have no base year**
    (r[statute.material-location], `domain-spec.md` §3.4, §5.6).
    Confirming Rule 12.3.1(e)'s `&` join — which the prior draft had
    flagged as an unverified best-effort reading, and which is now
    confirmed correct — surfaced a third parenthetical shape the spec
    never had: material appearing _only_ in the supplement drops the
    base year entirely (`42 U.S.C. § 1985 (Supp. V 1999).`). The prior
    draft made Year unconditionally required, making that shape
    unrepresentable. Resolved with a three-way **Material location**
    field (main volume / both / supplement only) driving which fields
    apply.

19. **Supplement designation is freeform, not a `Supp.` literal**
    (r[statute.supplement-designation-freeform]). Federal supplements
    carry Roman-numeral designations (`Supp. I`, `Supp. V`); a hardcoded
    `Supp.` would be wrong for U.S.C. citations.

**Rule 3 / Rule 12 coverage pass — findings 20–27:**

20. **Statutes had no title element** (`domain-spec.md` §3.4,
    r[statute.title]). `42 U.S.C. § 1983` — the `42` had nowhere to go.
    So did `Okla. Stat. tit. 14A, § 6-203`. The golden case
    (`Ohio Rev. Code Ann.`) happens to have no title, which is why this
    never surfaced. Users would have had to type `42 U.S.C.` into the
    code-abbreviation field — the same structural conflation the
    Party 1 / Party 2 split eliminated for case names. Now a separate
    optional field.

21. **Statute year semantics were undefined** (`domain-spec.md` §3.4,
    r[statute.year-is-edition-year]). Rule 12.3.2 wants the year of the
    code edition consulted — spine or copyright year — not the year of
    enactment. The spec said only "Year: number." An enactment year is a
    well-formed number, so nothing would catch the error. Field renamed
    **Code edition year** so the label carries the rule.

22. **En-dash normalization was wrong and has been reverted**
    (`domain-spec.md` §4.3, r[normalize.span-separator]). An earlier
    revision speced hyphen → en dash normalization. Rule 3.2(a) permits
    **either**; neither is required. Worse, the normalization had a real
    cost: Word counts `1065-66` as one word and `1065–66` as two, so
    silently converting would inflate the word count on a brief filed
    under a limit. Now a user preference defaulting to hyphen. This was
    an error introduced by this spec's own revision process, not
    inherited.

23. **Page-span digit retention was unimplemented** (`domain-spec.md`
    §4.3, r[normalize.span-digits]). Rule 3.2(a) retains the last two
    digits and drops other repetitious leading digits: `208-14`, not
    `208-214`. Deterministic given both numbers; the algorithm is
    specified and verified against eleven worked examples drawn from
    four independent guides, including the awkward cases (`1099-101`,
    `199-201`, `498-503`).

24. **Statute popular names unsupported** (`domain-spec.md` §6, Rule
    12.2.1) — now a listed limitation rather than an unstated absence.

25. **Non-consecutive pincites unsupported** (`domain-spec.md` §6,
    r[normalize.span-nonconsecutive]) — `at *1, *3` and `490, 495`.

26. **Footnote and paragraph pincites unsupported** (`domain-spec.md`
    §6, Rule 3.2(b)).

27. **Abbreviation spacing is the user's responsibility**
    (`domain-spec.md` §6, Rules 6.1–6.2) — `N.E.3d` closes up,
    `F. Supp. 2d` does not. Freeform fields render verbatim. Previously
    unstated.

**Deferred items pulled forward — findings 28–30:**

28. **Non-consecutive pincites now supported**
    (r[normalize.span-nonconsecutive], §3.4). Deferred in the previous
    pass; implemented here because one comma-split in the pincite parser
    covers it. `490, 495` and `at *1, *3` both work, with each star page
    marked individually per Rule 10.8.1(a).

29. **Footnote and paragraph pincites now work**
    (r[normalize.span-passthrough]). Not a feature so much as a
    consequence of guarding the span normaliser: components that aren't
    pure numeric spans pass through verbatim, so `1137 n.4` (Rule
    3.2(b)) and `¶ 12` render correctly with no dedicated field.
    Accepted but not validated — consistent with the freeform stance
    elsewhere.

30. **Statute popular names now supported in the simple form**
    (r[statute.popular-name]) — `Consumer Credit Code, Okla. Stat. tit.
14A, § 6-203 (1996).` One optional prefix field. The act-section
    variant (NEPA § 102) stays deferred: it needs a second section
    number belonging to the act, not the code.

**Added in this pass:**

31. **Concrete data model** (§3) — normative field IDs, enumerations,
    and types. Numeric-looking fields are typed `string`
    (r[types.numeric-fields-are-strings]): volumes, sections, and titles
    carry non-numeric characters (`14A`, `3767.32(A)`), docket leading
    zeros are meaningful, and empty must be distinguishable from zero.
    `Month` stores the rendered literal (`Sept.`) rather than an index,
    so no formatting layer can reintroduce `Sep.`

32. **UI specification** (later removed — see note below) — layout,
    field grouping and order, state badges, validation and staleness
    affordances, responsive and target sizing were specced here as a
    standalone section. It was removed once the declarative UI
    components (`src/views/citation-builder/components/`) became the
    source of truth for layout and field state, and the accessibility
    affordances it described either didn't match what was actually
    built or belonged with the code they govern rather than in a doc
    that could drift from it.

**Rule provenance audit — findings 33–35:**

33. **All three previously-`asserted` rules confirmed**
    (`domain-spec.md` §7.5). `citation.unreported-short-form` verified
    against Texas Southern and Cincinnati worked examples;
    `case-name.assembly` against Colorado CCS and Liberty; the `No.`
    prefix in `normalize.docket` across five guides. The audit table now
    shows every Bluebook-derived rule verified, none merely asserted.

34. **Turned-comma substitution documented as unsupported**
    (`domain-spec.md` §6, Rule 10.2.1(a)). New in the 22nd edition:
    older party names take a turned comma (`ʻ`) rather than an
    apostrophe. The tool renders names as typed. Found while confirming
    the edition pin.

35. **Short-form eligibility scope documented as unmodelled**
    (`domain-spec.md` §6, Rule 10.9). A short form is permitted only
    when the full citation is in the same general discussion — five
    footnotes in law-review format, or readily findable in practitioner
    format. Same root cause as the _Id._ restriction: the tool cannot
    see the surrounding document. Previously unstated.

**Spec restructuring:**

36. **Split into `domain-spec.md` and this file** — the single-file
    spec mixed Bluebook citation-format rules (verifiable against an
    external authority) with implementation detail (architecture,
    testing process, UI affordances) that churns far more often and
    isn't checked against anything external. Domain rules now live
    alone in `domain-spec.md`, tracked for coverage against
    `src/components/citation-builder/domain/` and `state/`. The testing
    plan and the UI specification were removed outright rather than
    relocated — the testing plan restated what the test suites already
    express better as code, and the UI specification's field-state and
    accessibility claims (state badges, a persistent "shared field"
    marker, colour-only-state avoidance) didn't match the actual
    implementation and would only drift further from it; the real
    source of truth for both is the code itself
    (`src/components/citation-builder/domain/**/*.test.ts`,
    `src/views/citation-builder/components/`).
