# Citation Builder — Domain Spec

Bluebook citation-format rules only: what a correct citation looks like,
and why. No architecture, UI, or testing-process content — see
`architecture-spec.md` for that. Full history, review notes, and
deferred scope (V2, subsequent history, session law, etc.) live in the
master spec — reference it if you want the "why," not just the "what."

**Bluebook edition:** The Bluebook, 22nd edition (Harvard Law Review
Association, May 2025). If a rule referenced here has since changed
editions, that's a deliberate spec revision, not something to silently
work around.

**Disclaimer decision:** no in-UI warning is shown for unvalidated
reporter/court fields. This is a documented limitation (§6), not a UI
feature. Do not add one.

---

## 1. Glossary — use these terms, no others

| Term                         | Meaning                                                                                                                                                                                | Rule                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Full citation**            | First, complete citation of a source. Not "long cite."                                                                                                                                 | Rule 10 (cases), Rule 12 (statutes)      |
| **Short form**               | Abbreviated citation to a source already cited in full. Not "short cite."                                                                                                              | Rule 10.9 (cases), Rule 12.10 (statutes) |
| **Pincite**                  | The specific page, star page, or subsection pointing to exactly where cited support appears.                                                                                           | —                                        |
| **Reporter**                 | Publication series a case is printed in (e.g., N.E.3d, F.3d).                                                                                                                          | —                                        |
| **Docket number**            | Court-assigned case number, used for unreported cases.                                                                                                                                 | Rule 10.8.1                              |
| **Database identifier**      | Westlaw/Lexis/Bloomberg citation string (e.g., 2021 WL 4269952).                                                                                                                       | Rule 10.8.1(a)                           |
| **Code**                     | The statutory compilation being cited, official or annotated.                                                                                                                          | Rule 12                                  |
| **Id.**                      | Short form indicating the citation is to the same, and only, source cited immediately before. Requires manual confirmation (§5.7).                                                     | Rule 4.1                                 |
| **Slip opinion**             | A court-issued opinion available separately from the court, not in a reporter and not in an electronic database. Paginated by the court itself.                                        | Rule 10.8.1(b)                           |
| **Star page**                | A page marker inserted by an electronic database (`*1`, `*2`), not by the court. Exists only for database-sourced opinions — a slip opinion has none.                                  | Rule 10.8.1(a)                           |
| **Name variant**             | Which form of the case name a **short form** uses: full name, one party, or omitted. Applies to short forms only — a full citation always carries the complete case name.              | Rule 10.9(a)(i)                          |
| **Availability**             | Whether an unreported case is being cited from an electronic database or from a slip opinion. Determines both the database-identifier segment and the pincite form (§5.5).             | Rule 10.8.1(a)/(b)                       |
| **Code type**                | Whether a statute is cited to an official or an annotated/unofficial code. Determines whether a publisher appears.                                                                     | Rule 12.3                                |
| **Material location**        | Whether the cited statutory material appears in the code's main volume, its supplement, or both. Determines the shape of the date parenthetical (§5.6).                                | Rule 12.3.1(e)                           |
| **Title (statute)**          | The title or division number preceding a code abbreviation — the `42` in `42 U.S.C.`, the `tit. 14A` in `Okla. Stat. tit. 14A`. A separate element, not part of the code abbreviation. | Rule 12.3                                |
| **Code edition year**        | The year of the code volume consulted — spine year or copyright year — **not** the statute's enactment year.                                                                           | Rule 12.3.2                              |
| **Span**                     | A pincite covering consecutive pages (`208-14`). Distinct from non-consecutive pages, which are comma-separated and unsupported in V1.                                                 | Rule 3.2(a)                              |
| **Supplement / pocket part** | A separately issued update to a bound code volume. Federal supplements carry Roman-numeral designations (`Supp. I`, `Supp. V`); state pocket parts are usually plain `Supp.`           | Rule 12.3.1(e)                           |
| **Segment**                  | One unit of the internal citation representation: a run of text plus its emphasis state (see `architecture-spec.md` §1). Tool-internal, not a Bluebook concept.                        | —                                        |

If a new field or label is needed and isn't in this table, check it
against the rule itself before inventing terminology.

**Rule-ID convention:** every normative statement that a test can assert
against carries an `r[...]` identifier. Descriptive prose, tables, and
UI-affordance notes do not. If you add a normative rule, give it an ID.

Every `r[...]` rule is one of exactly two classes, decided when the rule
is written, not left to a later audit:

- **Domain rule** — encodes a Bluebook citation format. Must name its
  authority (rule/table number) in its own text at the point it's
  defined, and must carry an external, worked-example source before it
  can be marked anything but `asserted` in §7.2. No domain rule ships
  as `internal` — if it has no citable authority, it isn't a domain
  rule, it's a tool decision (belongs in `architecture-spec.md`
  instead).
- **UX / implementation rule** — a tool decision: architecture,
  interaction, data model, accessibility. No Bluebook authority exists
  or is claimed. Lives entirely in `architecture-spec.md`, `internal`,
  with a one-line rationale instead of a citation.

§7.2 is the enforcement point for this spec: a domain rule missing from
§7.2, or a §7.2 row with no source, is a spec defect, not a pending
cleanup.

---

## 2. Rule reference map

| Feature                                                    | Rule            |
| ---------------------------------------------------------- | --------------- |
| Case citation, general structure                           | Rule 10         |
| Case-name abbreviation (not automated — user-entered)      | Rule 10.2       |
| First-listed party only, each side                         | Rule 10.2.1     |
| Court identification; omission when reporter implies court | Rule 10.4       |
| Unreported opinions, in electronic database                | Rule 10.8.1(a)  |
| Unreported opinions, slip opinion only                     | Rule 10.8.1(b)  |
| Short form for cases                                       | Rule 10.9       |
| Short-form party choice (which party is retained)          | Rule 10.9(a)(i) |
| Statute citation, general structure                        | Rule 12         |
| Official code preference                                   | Rule 12.3       |
| Supplements / pocket parts                                 | Rule 12.3.1(e)  |
| Short form for statutes                                    | Rule 12.10      |
| Id.                                                        | Rule 4.1        |
| Pincite spans, digit retention, non-consecutive pages      | Rule 3.2(a)     |
| Footnote pincites (unsupported, §6)                        | Rule 3.2(b)     |
| Abbreviation spacing (user's responsibility, §6)           | Rules 6.1–6.2   |
| Statute popular name (unsupported, §6)                     | Rule 12.2.1     |
| Year of code edition                                       | Rule 12.3.2     |
| Turned comma in older case names (unsupported, §6)         | Rule 10.2.1(a)  |
| Short-form eligibility scope (not modelled, §6)            | Rule 10.9       |
| Month abbreviations                                        | Table 12        |

Every generated citation must be traceable to a rule here. Anything not
traceable is a labeled UI convenience or a listed limitation (§6) — never
an invented convention.

---

## 3. Data model

### 3.1 Shared fields (all case types)

| Field     | Input                               | Required?                                                                                 |
| --------- | ----------------------------------- | ----------------------------------------------------------------------------------------- |
| Case type | select: `v.` / `In re` / `Ex parte` | required                                                                                  |
| Party 1   | text                                | required                                                                                  |
| Party 2   | text                                | required only if case type = `v.`                                                         |
| Court     | text (freeform, unvalidated)        | **optional** — see r[court.optional] below                                                |
| Pincite   | text                                | optional for full citation; **required** for short form; **not used** for statutes (§3.4) |

Full case name is assembled from case type + party fields — never typed
directly.

r[court.optional]
Court is optional, not required. Rule 10.4 omits the court from the
date parenthetical when the reporter itself unambiguously identifies the
deciding court — most commonly the U.S. Supreme Court cited to U.S.
Reports (`Roe v. Wade, 410 U.S. 113, 164 (1973).` — no court shown).
Making Court mandatory would make the single most-cited court in the
country impossible to cite correctly. When Court is blank, the
parenthetical contains the date alone.

The tool does **not** decide when omission is correct: it cannot infer
"this reporter implies its court" from a freeform reporter string.
Deciding to leave Court blank is the user's call. Automating it would
require runtime reporter validation, which is out of scope for V1 (§6).

r[short-form.party-choice]
Short-form party selection is a user choice, not an inference. The
short-form control offers **Party 1 / Party 2** (§5.2). Rule 10.9(a)(i)
keeps whichever party is more distinctive — for _Universal City
Studios, Inc. v. Corley_ that is "Corley," the second party, not the
first. An always-Party-1 rule would emit a known-incorrect short form
for the common corporate-plaintiff shape, so the choice is surfaced
rather than guessed. For `In re` / `Ex parte` types there is only one
party and the control is not shown.

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
| Month               | select (Table 12 list, enumerated below)               | required                                                          |
| Day                 | number 1–31                                            | required                                                          |
| Year                | number                                                 | required                                                          |

r[date.month-list]
The Month select offers exactly these twelve values and no others —
Table 12 abbreviations, several of which are not the obvious
three-letter truncation:

`Jan.` `Feb.` `Mar.` `Apr.` `May` `June` `July` `Aug.` `Sept.` `Oct.` `Nov.` `Dec.`

Note `May`, `June`, and `July` take no period, and September is `Sept.`,
not `Sep.` A fixed select exists precisely so these cannot be entered
wrong.

### 3.4 Statute only

| Field                  | Input                                                   | Required?                                                                      |
| ---------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Code type              | toggle: "Official code" / "Annotated / unofficial code" | required                                                                       |
| Popular name           | text (e.g. `Consumer Credit Code`)                      | optional — see r[statute.popular-name]                                         |
| Title / prefix         | text (e.g. `42`, `tit. 14A`)                            | optional — see r[statute.title]                                                |
| Title position         | toggle: "Before code" / "After code (comma-separated)"  | required if Title is filled; **not used** if Title is blank — r[statute.title] |
| Code abbreviation      | text (freeform, unvalidated)                            | required                                                                       |
| Section                | text                                                    | required                                                                       |
| Publisher              | text                                                    | required only if Code type = annotated; **disabled** if official               |
| Material location      | select: "Main volume" / "Both" / "Supplement only"      | required                                                                       |
| Code edition year      | number                                                  | required unless Material location = supplement only, where it is **disabled**  |
| Supplement designation | text (e.g. `Supp.`, `Supp. I`, `Supp. V`)               | required if Material location ≠ main volume; **disabled** if main volume       |
| Supplement year        | number                                                  | required if Material location ≠ main volume; **disabled** if main volume       |

r[statute.popular-name]
Rule 12.2.1 prefixes the citation with the statute's common name when it
is generally known by one, followed by a comma:
`Consumer Credit Code, Okla. Stat. tit. 14A, § 6-203 (1996).` Optional;
omitted entirely when blank.

The variant that also carries the act's own section —
`National Environmental Policy Act of 1969 § 102, 42 U.S.C. § 4332
(1994).` — is **not** supported: it requires a second, independent
section number belonging to the act rather than the code. Listed in §6.

r[statute.title]
Many codes carry a title or division element, and its position relative
to the code abbreviation is not one convention: `42 U.S.C. § 1983`
places the title **before** the code, no comma; `Okla. Stat. tit. 14A,
§ 6-203` places it **after** the code, comma-separated. This is a
separate structural element, not part of the code abbreviation, and the
field holds it verbatim including any `tit.` prefix the jurisdiction
uses.

> **Resolved ambiguity:** the two golden examples above use different
> orderings, and the tool doesn't infer which applies from the title
> string's content (same stance as r[court.optional] and
> r[short-form.party-choice] -- no guessing from freeform text).
> **Title position is therefore a second, explicit field**, alongside
> Title itself: **Before code** / **After code (comma-separated)**.
> Meaningful, required, and shown only when Title is filled.
>
> **Verification status, unequal between the two shapes:** the
> before-code form is externally confirmed --
> [Georgetown's Federal Statutes guide](https://guides.ll.georgetown.edu/c.php?g=261289&p=2383798)
> gives `17 U.S.C. § 107 (2012).`, title before code, no comma, matching
> exactly. The after-code form (`Okla. Stat. tit. 14A, § 6-203`) is
> **not** independently confirmed -- Georgetown's
> [State Statutes guide](https://guides.ll.georgetown.edu/c.php?g=261289&p=2383799)
> covers no title/division example at all (its own worked example,
> `Va. Code Ann. § x-x`, has no title element), so this shape rests on
> the pasted spec text alone. A UI preset for "Federal" title placement
> is safe to build on this basis; a "State" preset would encode an
> unconfirmed guess as a default and should wait for a real source.

Rendering: `[Title] [Code] § [Section]` (before code) or
`[Code] [Title], § [Section]` (after code), with both fields omitted
entirely when Title is blank. Codes with no title division —
`Ohio Rev. Code Ann.`, `Haw. Rev. Stat.` — leave it empty.

Optional rather than required because whether a code has a title element
is a property of the jurisdiction, not something the tool can infer from
a freeform code abbreviation.

r[statute.year-is-edition-year]
The year is the year of the **code edition consulted** — the year on the
volume's spine or its copyright year — **not** the year the statute was
enacted. This is the single most likely data-entry error for this field,
and the tool cannot detect it: an enactment year is a perfectly
well-formed number. The field is labelled **Code edition year**, not
"Year," so the label itself carries the distinction. Rule 12.3.2.

r[statute.material-location]
Material location determines the shape of the date parenthetical
(§5.6) and which of Year / supplement fields apply. Rule 12.3.1(e)
distinguishes three cases: material in the main volume only, in both,
or only in the supplement. In the supplement-only case there is **no
base year** — `42 U.S.C. § 1985 (Supp. V 1999).` — so Code edition year
must be able to go unused, not unconditionally required.

r[statute.supplement-scope]
Supplement fields apply to official and annotated codes alike. Official
compilations issue supplements too — `Haw. Rev. Stat. § 703-309 (2014 &
Supp. 2017).` has a supplement and no publisher. Scoping supplements to
annotated codes only would be wrong.

r[statute.supplement-pairing]
Supplement designation and supplement year are required together
whenever Material location ≠ main volume. One without the other is a
validation error, never a silently half-rendered parenthetical.

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

> **Note:** the boundary check allows whitespace, end-of-string, _or_ a
> digit (e.g. `"No.05-1234"` still strips correctly) — but not another
> letter, which is what guards `"North-123"` and `"Norfolk County 44"`
> from being corrupted.

### 4.2 Statute section auto-prefix

r[normalize.section]
If the value already starts with `§` or `§§`, normalize spacing after
the symbol and leave as-is (preserves user-entered multi-section `§§`).
Otherwise prepend `§ `.

### 4.3 Pincite span normalization

r[normalize.span-separator]
Rule 3.2(a) permits **either** an en dash (`–`) or a hyphen (`-`) for a
page span. Neither is required. The separator is therefore a **user
preference** (§5.3), defaulting to hyphen, **not** a silent
normalization.

Hyphen is the default for a practical reason: Microsoft Word's word
counter treats `1065-66` as one word but `1065–66` as two. Briefs filed
under a word limit certify counts from that counter, so defaulting to en
dash would silently inflate a practitioner's word count. An earlier
draft normalized hyphens to en dashes unconditionally; that was wrong on
both counts — it wasn't required by the rule, and it had a real cost.

r[normalize.span-digits]
Rule 3.2(a): always retain the final two digits of the closing page;
drop other repetitious leading digits. Deterministic given both numbers:

```
commonPrefix = length of shared leading digits (only when both numbers
               have the same digit count)
keep         = max(2, digits(end) - commonPrefix)
closing      = last `keep` digits of end
```

Verified against published examples from four independent guides:

| Span      | Output     | Source shape                             |
| --------- | ---------- | ---------------------------------------- |
| 111–112   | `111–12`   | common prefix `11`, floor of 2 digits    |
| 495–497   | `495–97`   | common prefix `49`                       |
| 190–192   | `190–92`   | common prefix `19`                       |
| 1137–1138 | `1137–38`  | common prefix `113`                      |
| 208–214   | `208–14`   | common prefix `2`                        |
| 1099–1101 | `1099–101` | common prefix `1`, three digits retained |
| 199–201   | `199–201`  | no common prefix, full number kept       |
| 498–503   | `498–503`  | hundreds digit changes, full number kept |
| 44–45     | `44–45`    | two-digit span, floor applies            |
| 8–10      | `8–10`     | differing digit counts, full number kept |

r[normalize.span-input]
The pincite field accepts a span as the user types it (`208-214` or
`208-14`). If the closing number is given in full, it is reduced per
r[normalize.span-digits]. If already reduced, it is left alone. The
star-page marker attaches once to the whole span (`at *1-2`), never to
each number.

r[normalize.span-nonconsecutive]
Non-consecutive pages are separated by commas, not a span
(`490, 495`) — Rule 3.2(a). **Supported**: the pincite field accepts
comma-separated components, each parsed independently. For star
pages every component takes its own asterisk (`at *1, *3`), per Rule
10.8.1(a).

r[normalize.span-passthrough]
Pincite components that are not pure numeric spans pass through
verbatim. This is what makes footnote (`1137 n.4`, Rule 3.2(b)) and
paragraph (`¶ 12`) pincites work without dedicated fields — the parser
recognises what it can normalise and leaves everything else alone.

### 4.4 Date assembly

r[normalize.date]
Month (Table 12 abbreviation, from a fixed select list, r[date.month-list])

- Day + Year are combined as `[Month] [Day], [Year]` — e.g.
  `Sept. 17, 2021`. No freeform date text field exists.

### 4.5 Case name assembly

r[case-name.assembly]
`Party1 v. Party2`, `In re Party1`, or `Ex parte Party1` depending on
case type.

r[case-name.short-form]
Short form uses whichever single party the user selected (Party 1 or
Party 2, per r[short-form.party-choice]), or the assembled name for
`In re` / `Ex parte`, which have only one party. The tool does not infer
which party is more distinctive under Rule 10.9(a)(i) — it presents the
choice.

---

## 5. Output rules

### 5.1 Sentence form

All output is a standalone, capitalized, period-terminated citation.
Clause form is out of scope.

### 5.2 Name variant — short forms only

r[name-variant.short-form-only]
The name-variant control applies to **short forms only**. A full
citation always carries the complete assembled case name (§4.5), subject
to Rule 10.2 abbreviation the user performs themselves. There is no
valid full citation reading `Corley, 273 F.3d 429 (2d Cir. 2001).`, and
none with the name omitted entirely. When mode = full citation, the
control is hidden, not merely defaulted.

r[name-variant.options]
In short-form mode the control offers: **Full name / Party 1 / Party 2 /
No name.** Rule 10.9 permits any of these so long as the source remains
unambiguous. Party 1 / Party 2 collapse to a single option for
`In re` / `Ex parte` types, which have one party. A live example line
beneath the control shows the current selection applied to the user's
actual data.

This corrects an earlier draft that scoped name variants across both
modes and would have caused the combinatorial test matrix to assert
invalid full citations as correct.

### 5.3 Output preferences

Toggle: **Italic / Underline** for case names and _Id._

Toggle: **Hyphen / En dash** for page spans, defaulting to hyphen
(r[normalize.span-separator]). Both are permitted by Rule 3.2(a); hyphen
is the default because Word's word counter treats an en dash span as two
words, which matters under a brief's word limit.

### 5.4 Long-form structure (reported case)

```
[Name], [Volume] [Reporter] [First page], [Pincite] ([Court] [Year]).
```

With Court omitted (r[court.optional]):

```
[Name], [Volume] [Reporter] [First page], [Pincite] ([Year]).
```

r[citation.reported-long-form]
Full citation for a reported case follows the template above: assembled
name (always complete — r[name-variant.short-form-only]), then
volume/reporter/first page, an optional pincite, and a parenthetical
carrying court and year, or year alone when Court is blank — framed as
one capitalized, period-terminated sentence.

### 5.5 Long-form structure (unreported case)

The Availability toggle switches **two** things, not one: whether the
database identifier appears, **and** which pincite form is used. Star
pages are inserted by Westlaw/Lexis; a slip opinion has none, and is
paginated by the court itself as `slip op. at N`.

**Availability = in electronic database** (Rule 10.8.1(a)):

```
[Name], No. [Docket], [Database ID], at *[Pincite] ([Court] [Month] [Day], [Year]).
```

**Availability = slip opinion only** (Rule 10.8.1(b)):

```
[Name], No. [Docket], slip op. at [Pincite] ([Court] [Month] [Day], [Year]).
```

r[citation.unreported-long-form]
Database ID segment appears only when Availability = database. Pincite
is omitted entirely when absent, in either variant.

r[citation.unreported-pincite-form]
Pincite form is determined by Availability: `at *[Pincite]` for
database-sourced opinions, `slip op. at [Pincite]` for slip opinions.
Emitting `at *N` for a slip opinion is incorrect — star pagination does
not exist outside an electronic database. This corrects an earlier draft
which described the slip variant as "the same citation minus the
database ID," which would have produced `No. 2021CA0007, at *1 (...)`, a
citation pointing at a page marker that does not exist in the cited
source.

### 5.6 Long-form structure (statute)

r[citation.statute-long-form]
Official code takes no publisher; annotated code inserts the publisher
before the year. Both may carry a supplement.

```
[Title] [Code abbreviation] § [Section] ([Code edition year]).
[Title] [Code abbreviation] § [Section] ([Publisher] [Code edition year]).
```

Title omitted when blank (r[statute.title]).

r[citation.statute-supplement]
The supplement parenthetical has **three** confirmed forms, determined by
where the cited material actually appears (§3.4, Material location):

**Main volume only** — supplement fields unused:

```
[Title] [Code] § [Section] ([Code edition year]).
[Title] [Code] § [Section] ([Publisher] [Code edition year]).
```

**Both main volume and supplement** — base year, `&`, then designation
and supplement year:

```
[Title] [Code] § [Section] ([Code edition year] & [Supp. designation] [Supp. year]).
[Title] [Code] § [Section] ([Publisher] [Code edition year] & [Supp. designation] [Supp. year]).
```

**Supplement only** — **no base year at all**:

```
[Title] [Code] § [Section] ([Supp. designation] [Supp. year]).
[Title] [Code] § [Section] ([Publisher] [Supp. designation] [Supp. year]).
```

Confirmed against (Rule 12.3.1(e)):

| Citation                                         | Shape                      |
| ------------------------------------------------ | -------------------------- |
| `12 U.S.C. § 1455 (1982 & Supp. I 1983).`        | official, both             |
| `42 U.S.C. § 3001 (1994 & Supp. V 1999).`        | official, both             |
| `42 U.S.C. § 1985 (Supp. V 1999).`               | official, supplement only  |
| `18 U.S.C. § 510(b) (Supp. I 1983).`             | official, supplement only  |
| `Haw. Rev. Stat. § 703-309 (2014 & Supp. 2017).` | official, both             |
| `42 U.S.C.A. § 1983 (West 2000 & Supp. 2002).`   | annotated, both            |
| `42 U.S.C.A. § 2001 (West Supp. 2002).`          | annotated, supplement only |

Two consequences worth stating plainly:

1. **Supplements apply to official codes.** `Haw. Rev. Stat. § 703-309
(2014 & Supp. 2017).` carries a supplement with no publisher at all.
   This confirms r[statute.supplement-scope].
2. **Year is not unconditionally required.** In the supplement-only form
   there is no base year — `42 U.S.C. § 1985 (Supp. V 1999).`

r[statute.supplement-designation-freeform]
Supplement designation is freeform text, not a fixed `Supp.` literal,
because federal supplements carry Roman-numeral designations —
`Supp. I`, `Supp. V` — while state pocket parts are usually plain
`Supp.` The field holds the whole designation.

### 5.7 Id. gating

r[id.gating]
_Id._ is available only when: mode = short form, type ≠ statute, **and**
the user checks a confirmation control stating the citation immediately
follows a citation to the same source, and only that source. Manual by
design (§6 — no citation-sequence memory).

When Id. is selected, the name-variant control is hidden.

> **The statute exclusion is a V1 simplification, not the rule.** Rule
> 4.1 permits _Id._ for statutes (`Id. § 1983.`). It is excluded here
> only to keep V1's Id. surface to a single shape; listed as a
> limitation in §6, not presented as Bluebook doctrine.

```
[Name?], [Volume] [Reporter] at [Pincite].
```

r[citation.reported-short-form]
Short form (reported case): name (per the §5.2 variant — full, one
party, or omitted entirely, dropping its trailing comma too), then
volume, reporter, and pincite joined by "at". Pincite is required for
short form (§3.1). _Id._ replaces the entire name-and-reporter portion
with just `Id.`, emphasized: `Id. at [Pincite].`

Worked example (_Universal City Studios, Inc. v. Corley_, 273 F.3d 429
(2d Cir. 2001), at page 435):

| Name variant | Output                                                     |
| ------------ | ---------------------------------------------------------- |
| Full name    | `Universal City Studios, Inc. v. Corley, 273 F.3d at 435.` |
| Party 1      | `Universal City Studios, Inc., 273 F.3d at 435.`           |
| Party 2      | `Corley, 273 F.3d at 435.`                                 |
| No name      | `273 F.3d at 435.`                                         |
| Id.          | `Id. at 435.`                                              |

Party 2 is the form a practitioner would normally choose here under
Rule 10.9(a)(i) — the corporate plaintiff is the less distinctive
party. The tool offers the choice rather than making it.

### 5.8 Short-form structure (unreported case)

**Availability = database:**

```
[Name?], [Database ID], at *[Pincite].
```

**Availability = slip opinion:**

```
[Name?], No. [Docket], slip op. at [Pincite].
```

r[citation.unreported-short-form]
Same name-variant handling and same pincite-form split as the full
citation (r[citation.unreported-pincite-form]). _Id._ form is
`Id. at *[Pincite].` for database-sourced and `Id. at [Pincite].` for
slip opinions.

### 5.9 Short-form structure (statute)

```
[Title] [Code abbreviation] § [Section].
```

r[citation.statute-short-form]
Statute short form (Rule 12.10) drops the entire parenthetical —
publisher, year, and any supplement. No name variant applies (statutes
have no case name) and no pincite is appended: the statutory pinpoint is
the subsection, which is already part of the Section field (§3.4).

---

## 6. Known limitations (V1)

- No Table 1 validation on reporter/court abbreviations — freeform, no
  UI disclaimer (decided; do not add one).
- No Rule 10.2 case-name abbreviation automation.
- **Court omission is the user's judgment call.** Rule 10.4 omits the
  court when the reporter implies it, but the tool cannot infer that
  from a freeform reporter string (r[court.optional]). Leaving Court
  blank is supported; knowing _when_ to leave it blank is not automated.
- **_Id._ is not offered for statutes**, though Rule 4.1 permits it
  (`Id. § 1983.`). A V1 simplification to keep the Id. surface to one
  shape, not a statement of the rule.
- **Short-form party choice is surfaced, not inferred.** Rule 10.9(a)(i)
  keeps the more distinctive party; the tool offers Party 1 / Party 2 and
  lets the user decide (r[short-form.party-choice]).
- No subsequent history, no session-law statute citations, no
  constitutions/regulations/court rules/record citations, no
  parallel/historical dual-reporter citations. A parallel citation's
  second reporter is silently absent, not an error (_Marbury_).
- **Statute popular names are supported in their simple form only**
  (r[statute.popular-name]). The variant carrying the act's own section
  — `National Environmental Policy Act of 1969 § 102, 42 U.S.C. § 4332
(1994).` — is not: it needs a second section number belonging to the
  act rather than the code.
- **Footnote and paragraph pincites are accepted but not validated**
  (r[normalize.span-passthrough]). `1137 n.4` and `¶ 12` render
  correctly because non-numeric components pass through verbatim; a
  malformed one passes through equally.
- **Reporter and code abbreviation spacing is the user's
  responsibility.** Rules 6.1–6.2 close up adjacent single capitals
  (`N.E.3d`, `F.3d`) but not single capitals followed by longer
  abbreviations (`F. Supp. 2d`). Freeform fields are rendered verbatim;
  the tool neither enforces nor corrects spacing.
- **No turned-comma substitution in older case names.** The 22nd
  edition's Rule 10.2.1(a) requires a turned comma (`ʻ`) rather than an
  apostrophe (`'`) in older party names — a change from the 21st
  edition. The tool renders party names exactly as typed and does not
  substitute the character.
- **Short-form eligibility scope is not modelled.** Rule 10.9 permits a
  short form only when the full citation appears in the same general
  discussion — within five footnotes in law-review format, or readily
  findable in practitioner format. The tool has no view of the
  surrounding document (no citation-sequence memory, below), so it
  cannot check this; the same reasoning that gates _Id._ behind manual
  confirmation applies to short forms generally, but is not enforced.
- **No citation-sequence memory.** _Id._ can't be verified by the tool —
  it has no model of the surrounding document — hence the manual
  confirmation in §5.7 rather than an automatic option.
- English-only. Nothing persists between sessions (that's Phase 2).

---

## 7. Rule provenance

Every `r[...]` rule below, with its authority and verification status.
Purpose: nothing here should be an invented convention, and a reader
adding jurisdiction-specific rules later needs to know which rules are
national Bluebook doctrine. Tool-internal (non-Bluebook) rules —
architecture, data model, interface — live in `architecture-spec.md`
instead; nothing here ever carries `internal` status.

### 7.1 Schema

| Column         | Meaning                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| `rule`         | The `r[...]` identifier                                                                                            |
| `authority`    | Bluebook rule/table or external standard                                                                           |
| `status`       | `verified` (external source confirms) or `asserted` (traced to a rule but not externally confirmed here)           |
| `source`       | Where it was confirmed                                                                                             |
| `jurisdiction` | `universal` for all current rules. State variants would add `state:XX`; local court rules override Bluebook (§7.3) |

### 7.2 Bluebook-derived rules

| rule                                      | authority             | status    | source                                                                                                                                                                                                                                                                                                                                                                             | jurisdiction |
| ----------------------------------------- | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `court.optional`                          | Rule 10.4             | verified  | Georgetown Federal Courts; Monmouth (Supreme Court parenthetical omits court)                                                                                                                                                                                                                                                                                                      | universal    |
| `short-form.party-choice`                 | Rule 10.9(a)(i)       | verified  | Georgetown Short Forms (_Corley_ retains second party)                                                                                                                                                                                                                                                                                                                             | universal    |
| `case-name.short-form`                    | Rule 10.9(a)(i)       | verified  | Georgetown Short Forms                                                                                                                                                                                                                                                                                                                                                             | universal    |
| `name-variant.short-form-only`            | Rule 10.9             | verified  | Georgetown Short Forms                                                                                                                                                                                                                                                                                                                                                             | universal    |
| `name-variant.options`                    | Rule 10.9(a)(i)       | verified  | Georgetown Short Forms                                                                                                                                                                                                                                                                                                                                                             | universal    |
| `case-name.assembly`                      | Rule 10.2.1           | verified  | Colorado CCS (Bluebook shortens procedural phrases to `In re` / `Ex parte`); Liberty ("in the matter of" and "petition of" → `In re`); first-listed-party rule (Notre Dame)                                                                                                                                                                                                        | universal    |
| `citation.reported-long-form`             | Rule 10               | verified  | Georgetown Federal Courts; Monmouth (five/six-element structure)                                                                                                                                                                                                                                                                                                                   | universal    |
| `citation.reported-short-form`            | Rule 10.9             | verified  | Georgetown Short Forms                                                                                                                                                                                                                                                                                                                                                             | universal    |
| `citation.unreported-long-form`           | Rule 10.8.1(a)        | verified  | Georgetown Unpublished Opinions (_Bennett_); NIU (_Chatlas_)                                                                                                                                                                                                                                                                                                                       | universal    |
| `citation.unreported-pincite-form`        | Rule 10.8.1(a)/(b)    | verified  | NIU (_Chatlas_ database vs. slip pair); Notre Dame, Monmouth (`slip op. at`)                                                                                                                                                                                                                                                                                                       | universal    |
| `citation.unreported-short-form`          | Rule 10.9             | verified  | Texas Southern (`Albrecht, 1991 U.S. Dist. LEXIS 5088, at *3.`; `Kvass, 1991 WL 47632, at *3.`); Cincinnati (`Beaven, 2007 WL 1032301, at *3.` — database identifier used in the short form)                                                                                                                                                                                       | universal    |
| `id.gating`                               | Rule 4.1              | verified  | Georgetown Short Forms                                                                                                                                                                                                                                                                                                                                                             | universal    |
| `normalize.date`                          | Rule 10.8.1; Table 12 | verified  | Date format confirmed by worked examples (`Sept. 17, 2021`, `Oct. 21, 2005`)                                                                                                                                                                                                                                                                                                       | universal    |
| `date.month-list`                         | Table 12              | verified  | Bluebook month list: `Jan., Feb., Mar., Apr., May, June, July, Aug., Sept., Oct., Nov., Dec.` — note this differs from AP style, which spells out March/April                                                                                                                                                                                                                      | universal    |
| `normalize.span-separator`                | Rule 3.2(a)           | verified  | Georgetown Basic Bluebook handout; Tarlton (en dash **or** hyphen permitted)                                                                                                                                                                                                                                                                                                       | universal    |
| `normalize.span-digits`                   | Rule 3.2(a)           | verified  | Georgetown handout (`111–12`, `1099–101`); Suffolk (`190-92`, `199-201`); Briefly (`495–97`, `498–503`)                                                                                                                                                                                                                                                                            | universal    |
| `normalize.span-nonconsecutive`           | Rule 3.2(a)           | verified  | Georgetown handout (commas for non-consecutive); Monmouth (_Albrecht_, `at *1, *3`)                                                                                                                                                                                                                                                                                                | universal    |
| `normalize.section`                       | Rule 6.2(c)           | verified  | Applied Antitrust Bluebook handout (space between section sign and number)                                                                                                                                                                                                                                                                                                         | universal    |
| `normalize.docket`                        | Rule 10.8.1           | verified  | `No.` prefix confirmed across Georgetown, Akron, NIU, Loyola, Cincinnati worked examples. The strip-and-normalize _algorithm_ itself is tool-internal (`architecture-spec.md`)                                                                                                                                                                                                     | universal    |
| `statute.popular-name`                    | Rule 12.2.1           | verified  | Harvard Law Library (`Consumer Credit Code, Okla. Stat. tit. 14A, § 6-203 (1996)`)                                                                                                                                                                                                                                                                                                 | universal    |
| `statute.title`                           | Rule 12.3             | **split** | Before-code shape verified — Georgetown Federal Statutes (`17 U.S.C. § 107 (2012)`), Florida A&M (title precedes code name). After-code, comma-separated shape (`Okla. Stat. tit. 14A, § 6-203`) is `asserted` only — Georgetown's State Statutes guide has no title/division worked example to check it against; see the "Verification status" note under r[statute.title] (§3.4) | universal    |
| `statute.year-is-edition-year`            | Rule 12.3.2           | verified  | Pace (year of cited code edition — spine or copyright year)                                                                                                                                                                                                                                                                                                                        | universal    |
| `citation.statute-long-form`              | Rule 12.3             | verified  | Hawaii (official vs. annotated, publisher placement)                                                                                                                                                                                                                                                                                                                               | universal    |
| `citation.statute-supplement`             | Rule 12.3.1(e)        | verified  | Akron (`12 U.S.C. § 1455 (1982 & Supp. I 1983)`); Notre Dame; Hawaii                                                                                                                                                                                                                                                                                                               | universal    |
| `statute.material-location`               | Rule 12.3.1(e)        | verified  | Akron (supplement-only form); Notre Dame (`42 U.S.C. § 1985 (Supp. V 1999)`)                                                                                                                                                                                                                                                                                                       | universal    |
| `statute.supplement-scope`                | Rule 12.3.1(e)        | verified  | Hawaii (`Haw. Rev. Stat. § 703-309 (2014 & Supp. 2017)` — official code, no publisher)                                                                                                                                                                                                                                                                                             | universal    |
| `statute.supplement-designation-freeform` | Rule 12.3.1(e)        | verified  | Roman-numeral designations in Akron and Notre Dame (`Supp. I`, `Supp. V`)                                                                                                                                                                                                                                                                                                          | universal    |
| `citation.statute-short-form`             | Rule 12.10            | verified  | Pace (section alone acceptable); Briefly ("omit the date parenthetical in subsequent references: 42 U.S.C. § 1983")                                                                                                                                                                                                                                                                | universal    |
| `normalize.span-passthrough` (¶ form)     | Rule 10.8.1(a)        | verified  | Loyola: for unpublished cases, pages take an asterisk and paragraphs take `¶` — confirms both forms the parser passes through                                                                                                                                                                                                                                                      | universal    |

### 7.3 Adding jurisdictions later

The `jurisdiction` column exists so state-specific behaviour can be
added without re-auditing this table. Three things a future maintainer
needs to know:

1. **Bluebook is national; local court rules override it.** Suffolk's
   guide is explicit that documents filed with a court must follow that
   court's citation rules, and that local rules often require parallel
   citations — which V1 does not support (§6). A jurisdiction layer is
   therefore not cosmetic: it can change what a _correct_ citation is.
2. **Table 1 already encodes per-jurisdiction formats.** State
   statutory compilations and court abbreviations live in T1.3 / T1.4.
   Any state layer should draw on Table 1 rather than inventing
   per-state rules, and would pair naturally with the `reporters-db` /
   `courts-db` datasets used as a test corpus (`architecture-spec.md`).
3. **Only §7.2 rules can vary by jurisdiction.** Everything in
   `architecture-spec.md` is a tool decision — a state variant changes
   citation format, never the internal representation or the
   accessibility requirements.

### 7.4 Audit status

- 28 Bluebook-derived rules: **27 verified, 1 split** (`statute.title` —
  the before-code shape is externally confirmed, the after-code shape is
  not; see §7.2).
- Sources span 14 independent institutions (Georgetown, Harvard, Akron,
  Notre Dame, Hawaii, Pace, Suffolk, Tarlton/Texas, NIU, Loyola
  Chicago, Cincinnati, Texas Southern, Florida A&M, Monmouth), so no
  single guide's idiosyncrasy is load-bearing.

### 7.5 Confirmed during the final audit

Three rules previously marked `asserted` were confirmed, and the
process surfaced two corrections:

1. **`citation.unreported-short-form`** — confirmed exactly as speced.
   Texas Southern gives `Albrecht, 1991 U.S. Dist. LEXIS 5088, at *3.`
   and Cincinnati states the database identifier is what carries the
   short form. Our template matches.
2. **Slip-opinion pincite, reconciled.** Georgetown describes the slip
   citation as "the same, except without the database identifier" —
   `United States v. Bennett, No. 05-CR-6050 CJS (W.D.N.Y. Oct. 21,
2005).` That example carries **no pincite**, which is why it looks
   like a simple deletion. NIU shows the same case both ways: without a
   pincite the citation is name/docket/court/date; _with_ one it is
   `No. 1-07-2937, slip op. at 2`. Both sources are consistent, and
   r[citation.unreported-pincite-form] is correct as written — the
   `slip op. at` form applies only when a pincite is present, and the
   spec already omits the pincite segment entirely when absent.
3. **`case-name.assembly`** — `In re` and `Ex parte` confirmed as the
   Bluebook's procedural-phrase forms.
