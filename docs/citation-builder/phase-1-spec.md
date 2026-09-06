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
| **Segment**                  | One unit of the internal citation representation: a run of text plus its emphasis state (§7.1). Tool-internal, not a Bluebook concept.                                                 | —                                        |
| **Stale**                    | State of a generated citation whose underlying field data has changed since generation (§5.9). Tool-internal.                                                                          | —                                        |

If a new field or label is needed and isn't in this table, check it
against the rule itself before inventing terminology.

**Rule-ID convention:** every normative statement that a test can assert
against carries an `r[...]` identifier. Descriptive prose, tables, and
UI-affordance notes do not. If you add a normative rule, give it an ID.

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
require runtime reporter validation, which is out of scope for V1
(§8.4, §9).

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

| Field                  | Input                                                   | Required?                                                                     |
| ---------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Code type              | toggle: "Official code" / "Annotated / unofficial code" | required                                                                      |
| Popular name           | text (e.g. `Consumer Credit Code`)                      | optional — see r[statute.popular-name]                                        |
| Title / prefix         | text (e.g. `42`, `tit. 14A`)                            | optional — see r[statute.title]                                               |
| Code abbreviation      | text (freeform, unvalidated)                            | required                                                                      |
| Section                | text                                                    | required                                                                      |
| Publisher              | text                                                    | required only if Code type = annotated; **disabled** if official              |
| Material location      | select: "Main volume" / "Both" / "Supplement only"      | required                                                                      |
| Code edition year      | number                                                  | required unless Material location = supplement only, where it is **disabled** |
| Supplement designation | text (e.g. `Supp.`, `Supp. I`, `Supp. V`)               | required if Material location ≠ main volume; **disabled** if main volume      |
| Supplement year        | number                                                  | required if Material location ≠ main volume; **disabled** if main volume      |

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
Many codes carry a title or division element **before** the code
abbreviation: `42 U.S.C. § 1983`, `18 U.S.C. § 510(b)`,
`Okla. Stat. tit. 14A, § 6-203`. This is a separate structural element,
not part of the code abbreviation, and the field holds it verbatim
including any `tit.` prefix the jurisdiction uses.

Rendering: `[Title] [Code] § [Section]`, with the title omitted entirely
when blank. Codes with no title division — `Ohio Rev. Code Ann.`,
`Haw. Rev. Stat.` — leave it empty.

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
must be disableable, not unconditionally required.

r[statute.supplement-scope]
Supplement fields apply to official and annotated codes alike. Official
compilations issue supplements too — `Haw. Rev. Stat. § 703-309 (2014 &
Supp. 2017).` has a supplement and no publisher. Scoping supplements to
annotated codes only would be wrong.

r[statute.supplement-pairing]
Supplement designation and supplement year are required together
whenever Material location ≠ main volume. One without the other is a
validation error (§8.5), never a silently half-rendered parenthetical.

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
comma-separated components, each parsed independently (§11.4). For star
pages every component takes its own asterisk (`at *1, *3`), per Rule
10.8.1(a).

r[normalize.span-passthrough]
Pincite components that are not pure numeric spans pass through
verbatim. This is what makes footnote (`1137 n.4`, Rule 3.2(b)) and
paragraph (`¶ 12`) pincites work without dedicated fields — the parser
recognises what it can normalise and leaves everything else alone
(§11.4).

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
modes and would have caused the Tier 1 matrix (§8.2) to assert invalid
full citations as correct.

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

Two consequences worth stating plainly, both of which contradict the
earlier draft:

1. **Supplements apply to official codes.** `Haw. Rev. Stat. § 703-309
(2014 & Supp. 2017).` carries a supplement with no publisher at all.
   This confirms r[statute.supplement-scope].
2. **Year is not unconditionally required.** In the supplement-only form
   there is no base year — `42 U.S.C. § 1985 (Supp. V 1999).` The
   earlier draft made Year required for every statute, which made this
   shape unrepresentable.

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

### 5.11 Generation and staleness model

Previously assumed by the test plan (§8.6) but never specified. Defined
here.

r[generate.explicit]
Output is produced by an explicit **Generate** action, which validates
required fields for the active source type (§3) and, on success, renders
a citation. Before the first successful generation the output area shows
a placeholder, not a partial citation.

r[generate.display-controls-live]
Once a citation has been generated, changing a **display** control —
mode (full/short), name variant, Party 1/Party 2, typeface, Id. —
re-renders immediately from the already-validated data. These do not
require pressing Generate again, because they change presentation, not
the underlying source data.

r[generate.stale-on-data-edit]
Editing any **data** field (§3) after a successful generation marks the
displayed output **stale**: it is still shown, still copyable, and
visibly flagged as no longer reflecting current field values. Staleness
clears on the next successful Generate. The distinction is that display
controls re-render, while data edits invalidate — a stale citation is
the last _valid_ output, not a partial reflection of half-finished
edits.

r[generate.type-switch-stale]
Switching source type marks output stale by the same rule, since the
active field set changes.

### 5.12 Copy behavior

Clipboard write includes both `text/html` (emphasis markup intact) and
`text/plain`. Manual-selection fallback (if Clipboard API write fails)
changes the copy button's label to confirm selection occurred — no
live-region announcement needed.

r[copy.stale-permitted]
A stale citation (r[generate.stale-on-data-edit]) remains copyable. The
user is warned, not blocked — the output is a previously valid citation,
not a malformed one.

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
  second reporter is silently absent, not an error (§8.3, _Marbury_).
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
list of segments, each `{ text: string, emphasized: boolean }` — never
two independently hand-built strings (one HTML, one plain text). One
shared renderer converts that segment list to HTML and to plain text. If
HTML and plain-text output ever diverge, that's a renderer bug, not a
builder bug.

r[segment.emphasis-is-abstract]
The segment flag is `emphasized`, **not** `italic`. Whether emphasis
renders as italic or underline is a render-time setting (§5.3), applied
uniformly by the renderer — builders mark _what_ is emphasized (case
names, `Id.`), never _how_. An earlier draft specified
`{ text, italic: boolean }`, which could not represent the underline
toggle at all: a binding architecture rule contradicting a stated output
feature.

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

| Dimension         | Values                                | Applies to                          |
| ----------------- | ------------------------------------- | ----------------------------------- |
| Source type       | reported, unreported, statute         | all                                 |
| Mode              | full citation, short form             | all                                 |
| Name variant      | full, party 1, party 2, none          | **short form**, case types only     |
| Id. requested     | true, false                           | short form, case types only         |
| Pincite present   | true, false                           | all (required for short form)       |
| Court present     | true, false                           | case types only (r[court.optional]) |
| Typeface          | italic, underline                     | all                                 |
| Span separator    | hyphen, en dash                       | all (spans only)                    |
| Pincite shape     | single page, span                     | all                                 |
| Title present     | true, false                           | statute only                        |
| Popular name      | present, absent                       | statute only                        |
| Pincite form      | page, span, non-consecutive, footnote | all                                 |
| Availability      | database, slip opinion                | unreported only                     |
| Code type         | official, annotated                   | statute only                        |
| Material location | main volume, both, supplement only    | statute only                        |

**Exclusion rules** (generator must skip, not silently produce output
for):

- Id. + type = statute → invalid (V1 simplification, §5.7).
- Id. + mode = full citation → invalid.
- Id. + name variant ≠ none → invalid (Id. hides the name-variant
  control).
- **Name variant + mode = full citation → invalid**
  (r[name-variant.short-form-only]) — full citations always carry the
  complete name.
- Name variant applied to statute → invalid.
- Party 1 / Party 2 variants + case type ∈ {`In re`, `Ex parte`} →
  invalid (single-party types).
- Pincite absent + mode = short form → invalid (pincite required).
- Court present/absent applied to statute → invalid (statutes have no
  court field).
- Code edition year absent + Material location ≠ supplement only →
  invalid (required in the other two cases).
- Supplement fields present + Material location = main volume → invalid
  (fields disabled there).

Build the generator, exclusions, and fixtures as version-controlled test
code, not as a hand-maintained prose list.

### 8.3 Golden cases (Tier 2)

- `Ohio Rev. Code Ann. § 3767.32(A) (West 2025).` — annotated, main
  volume only.
- **Statute title element** (r[statute.title]):
  - `42 U.S.C. § 1983 (1994).` — federal title before the code.
  - `Okla. Stat. tit. 14A, § 6-203 (1996).` — state title division,
    `tit.` prefix carried verbatim in the field.
  - `Ohio Rev. Code Ann. § 3767.32(A) (West 2025).` — no title element;
    field blank, nothing rendered.
- **Statute supplement forms** (r[citation.statute-supplement]), all
  three shapes, both code types:
  - `42 U.S.C. § 3001 (1994 & Supp. V 1999).` — official, both.
  - `42 U.S.C. § 1985 (Supp. V 1999).` — official, supplement only, no
    base year.
  - `Haw. Rev. Stat. § 703-309 (2014 & Supp. 2017).` — official with a
    supplement and no publisher.
  - `42 U.S.C.A. § 1983 (West 2000 & Supp. 2002).` — annotated, both.
  - `42 U.S.C.A. § 2001 (West Supp. 2002).` — annotated, supplement
    only.
- `Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).`
- `State v. Lucko, No. 2021CA0007, 2021 WL 4269952, at *1–2 (Ohio Ct. App. Sept. 17, 2021).`
  — note the en dash in the range (r[normalize.span-digits]).
- _United States v. Bennett_, No. 05-CR-6050 CJS, 2005 WL 2709572
  (W.D.N.Y. Oct. 21, 2005) — database-available, Rule 10.8.1(a).
- **Slip-opinion pair** (r[citation.unreported-pincite-form]) — the two
  forms of one case, which must differ in pincite form, not merely in
  the presence of a database ID:
  - Database: `Chatlas v. Allstate Ins. Co., No. 1-07-2937, 2008 WL 2610471 (Ill. App. Ct. 1st Dist. June 30, 2008).`
  - Slip op.: `Chatlas v. Allstate Ins. Co., No. 1-07-2937, slip op. at 2 (Ill. App. Ct. 1st Dist. June 30, 2008).`
- **Court omission** (r[court.optional]) — `Roe v. Wade, 410 U.S. 113,
164 (1973).` with Court left blank. Asserts the parenthetical contains
  the date alone and does **not** emit `(U.S. 1973)`.
- _Marbury v. Madison_, 5 U.S. (1 Cranch) 137 (1803) — parallel-reporter
  non-goal. **Assertion:** entering `5` / `U.S.` / `137` produces
  `Marbury v. Madison, 5 U.S. 137 (1803).` — the single reporter given,
  rendered cleanly, with the `(1 Cranch)` parallel citation simply
  absent. No error, no crash, no partial rendering. The test asserts
  graceful omission, not a thrown exception.

External verification:

- **Reported case (§5.4):** Georgetown's [Federal
  Courts](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339383) page
  confirms the six-element format and the _Corley_ example; the U.S.
  Supreme Court example (_Roe v. Wade_, 410 U.S. 113, 164 (1973))
  confirms both pincite placement — directly after the first page, comma
  separated — and, per Rule 10.4, that the court is **omitted** when the
  reporter identifies it.
- **Unreported case (§5.5):** Georgetown's [Unpublished
  Opinions](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339386)
  page confirms the Bennett database form. The slip-opinion pincite form
  is confirmed separately by Northern Illinois University's guide, which
  places the two Chatlas variants side by side, and by the Notre Dame and
  Monmouth guides, which show slip opinions taking `slip op. at N` rather
  than star pages.
- **Id. gating and short form (§5.7):** Georgetown's [Short Forms for
  Cases](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339389) page
  confirms the Id. rule and the short-form structure. Its _Corley_
  example retains the second party, which is why party choice is now
  user-selected rather than fixed to Party 1
  (r[short-form.party-choice]).

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
| `214` (pincite)          | `214` (single page, unchanged)                  |

**Pincite span digit retention** (r[normalize.span-digits]) — every row
below is drawn from a published guide's worked example, not invented:

| Span in     | Span out   | Why                                      |
| ----------- | ---------- | ---------------------------------------- |
| `111-112`   | `111-12`   | common prefix `11`, two-digit floor      |
| `495-497`   | `495-97`   | common prefix `49`                       |
| `190-192`   | `190-92`   | common prefix `19`                       |
| `1137-1138` | `1137-38`  | common prefix `113`                      |
| `208-214`   | `208-14`   | common prefix `2`                        |
| `1099-1101` | `1099-101` | common prefix `1`, three digits retained |
| `199-201`   | `199-201`  | no common prefix                         |
| `498-503`   | `498-503`  | hundreds digit changes                   |
| `44-45`     | `44-45`    | two-digit span, floor applies            |
| `8-10`      | `8-10`     | differing digit counts                   |
| `495-97`    | `495-97`   | already reduced, unchanged               |

Separator is a preference, not a normalization
(r[normalize.span-separator]): each row above must also pass with an en
dash when that setting is selected.

Additionally: a property test running the same normalization logic
against the `reporters-db` dataset (github.com/freelawproject/reporters-db,
~1,000 real reporter strings) as a test-time-only corpus — never vendored
into the shipped tool, never used for runtime validation or autocomplete.
Purely a stress test for the normalization functions against real-world
strings the hand-written test list wouldn't think to include.

### 8.5 Rejection paths

Missing required field per type; short form requested with no pincite;
Id. requested when ineligible; Availability = slip opinion with a
database ID still entered (must be disabled/ignored, not silently
included); supplement designation present without supplement year, or
vice versa (r[statute.supplement-pairing]); Code edition year missing
when Material location ≠ supplement only (r[statute.material-location]).

### 8.6 UI layer tests

- Switching type preserves shared field values; disabled state applied
  correctly to not-used fields.
- Tags relabel correctly on type switch.
- Name-variant control is **hidden** in full-citation mode
  (r[name-variant.short-form-only]) and shown in short-form mode.
- Party 1 / Party 2 options collapse for `In re` / `Ex parte` types.
- Material location switches which of Year / supplement fields are
  enabled (r[statute.material-location]); all remain visible, only their
  enabled state changes (§3.5).
- Display-control changes re-render without a Generate press
  (r[generate.display-controls-live]); data-field edits mark output
  stale (r[generate.stale-on-data-edit]); type switch marks stale
  (r[generate.type-switch-stale]).
- Stale output remains copyable (r[copy.stale-permitted]).
- Id. checkbox gating and its effect on hiding the name-variant control.
- Clipboard write called with correct HTML + plain-text payloads (mock
  `navigator.clipboard`); emphasis renders as italic or underline per the
  typeface setting (r[segment.emphasis-is-abstract]).

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

---

## 10. Revision log — corrections applied to the prior draft

Each entry is a defect found in review, not a scope change. Listed so a
reader of the earlier draft knows what changed and why.

**Correctness — produced invalid citations:**

1. **Slip-opinion pincite form** (§5.5, r[citation.unreported-pincite-form]).
   The prior draft treated the slip-opinion variant as "the same citation
   minus the database ID," which emitted `No. 2021CA0007, at *1 (...)`.
   Star pages are inserted by Westlaw/Lexis; a slip opinion has none. The
   Availability toggle now switches pincite form (`at *N` ↔
   `slip op. at N`), not just segment presence. Rule 10.8.1(a)/(b).

2. **Name variants applied to full citations** (§5.2,
   r[name-variant.short-form-only]). Rule 10.9 short forms are short
   forms; a full citation always carries the complete case name. The
   prior draft scoped the control to neither mode, so the Tier 1 matrix
   would have asserted invalid full citations as correct.

3. **Court required always** (§3.1, r[court.optional]). Rule 10.4 omits
   the court when the reporter identifies it — `Roe v. Wade, 410 U.S.
113, 164 (1973).` A mandatory Court field made every U.S. Supreme
   Court citation impossible to render correctly.

4. **Short form fixed to Party 1** (§3.1, r[short-form.party-choice]).
   Rule 10.9(a)(i) keeps the more distinctive party — "Corley," not
   "Universal City Studios, Inc." Now a Party 1 / Party 2 user choice.
   (The prior draft's own correction of the Rule 10.2.1 miscitation was
   right; the resulting always-Party-1 rule still shipped wrong output.)

5. **IR could not represent underline** (§7.1,
   r[segment.emphasis-is-abstract]). Segment shape was
   `{ text, italic }` while §5.3 offers an italic/underline toggle — a
   binding architecture rule contradicting a stated feature. Now
   `{ text, emphasized }`, with the italic/underline decision made at
   render time.

**Internal contradictions:**

6. **Supplement year visibility** (§3.4). §3.4 said "shown only if
   supplement designation is filled"; §3.5 said visibility never
   changes. Resolved in favour of §3.5 — all supplement fields stay
   visible; Material location changes their _enabled_ state only.

7. **Supplement scope** (§3.4, r[statute.supplement-scope]). §5.6 said
   annotated-only; §3.4 said unconditional. Resolved to both code types,
   now confirmed against `Haw. Rev. Stat. § 703-309 (2014 & Supp.
2017).` — an official code carrying a supplement with no publisher.

8. **Rule map gaps** (§2). Rules 10.4 and 10.9(a)(i) are now cited in
   normative text and added to the map, which requires every rule used
   to appear there.

**Undefined behavior the tests assumed:**

9. **Generation and staleness model** (§5.11). §8.6 tested
   "stale-marking" against a model the spec never defined. Now specified:
   display controls re-render live, data edits mark stale, stale output
   stays copyable.

10. **_Marbury_ assertion** (§8.3). "Fails as a non-goal, not a crash"
    was untestable. Now: renders the single reporter given, parallel
    citation silently absent, no error.

**Gaps filled:**

11. Unreported and statute **short-form templates** (§5.8, §5.9) — only
    the reported short form existed.
12. **Pincite range normalization** (§4.3) — hyphen → en dash, with the
    star marker attaching once to the whole range.
13. **Table 12 months enumerated** (r[date.month-list]) — the select
    exists to make `Sep.` unrepresentable, so the twelve exact strings
    belong in the spec.
14. **Statute pincite** (§3.1) — explicitly not used; the statutory
    pinpoint is the subsection, already inside the Section field.
15. **_Id._ for statutes** (§5.7, §6) — restriction reframed as a V1
    simplification rather than presented as Rule 4.1's content.
16. **Glossary** (§1) — added slip opinion, star page, name variant,
    Availability, Code type, segment, stale; added the `r[...]`
    tagging convention.
17. **Test matrix dimensions** (§8.2) — added pincite presence, court
    presence, and typeface; corrected name-variant scoping and added
    the single-party exclusion.

**Found while confirming the previously-unconfirmed supplement format:**

18. **Supplement-only citations have no base year** (§3.4, §5.6,
    r[statute.material-location]). Confirming Rule 12.3.1(e)'s `&` join
    — which the prior draft had flagged as an unverified best-effort
    reading, and which is now confirmed correct — surfaced a third
    parenthetical shape the spec never had: material appearing _only_ in
    the supplement drops the base year entirely (`42 U.S.C. § 1985
(Supp. V 1999).`). The prior draft made Year unconditionally
    required, making that shape unrepresentable. Resolved with a
    three-way **Material location** field (main volume / both /
    supplement only) driving which fields apply.

19. **Supplement designation is freeform, not a `Supp.` literal**
    (r[statute.supplement-designation-freeform]). Federal supplements
    carry Roman-numeral designations (`Supp. I`, `Supp. V`); a hardcoded
    `Supp.` would be wrong for U.S.C. citations.

**Rule 3 / Rule 12 coverage pass — findings 20–27:**

20. **Statutes had no title element** (§3.4, r[statute.title]). `42
U.S.C. § 1983` — the `42` had nowhere to go. So did
    `Okla. Stat. tit. 14A, § 6-203`. The golden case
    (`Ohio Rev. Code Ann.`) happens to have no title, which is why this
    never surfaced. Users would have had to type `42 U.S.C.` into the
    code-abbreviation field — the same structural conflation the
    Party 1 / Party 2 split eliminated for case names. Now a separate
    optional field.

21. **Statute year semantics were undefined** (§3.4,
    r[statute.year-is-edition-year]). Rule 12.3.2 wants the year of the
    code edition consulted — spine or copyright year — not the year of
    enactment. The spec said only "Year: number." An enactment year is a
    well-formed number, so nothing would catch the error. Field renamed
    **Code edition year** so the label carries the rule.

22. **En-dash normalization was wrong and has been reverted** (§4.3,
    r[normalize.span-separator]). An earlier revision speced hyphen → en
    dash normalization. Rule 3.2(a) permits **either**; neither is
    required. Worse, the normalization had a real cost: Word counts
    `1065-66` as one word and `1065–66` as two, so silently converting
    would inflate the word count on a brief filed under a limit. Now a
    user preference defaulting to hyphen. This was an error introduced
    by this spec's own revision process, not inherited.

23. **Page-span digit retention was unimplemented** (§4.3,
    r[normalize.span-digits]). Rule 3.2(a) retains the last two digits
    and drops other repetitious leading digits: `208-14`, not
    `208-214`. Deterministic given both numbers; the algorithm is
    specified and verified against eleven worked examples drawn from
    four independent guides, including the awkward cases (`1099-101`,
    `199-201`, `498-503`).

24. **Statute popular names unsupported** (§6, Rule 12.2.1) — now a
    listed limitation rather than an unstated absence.

25. **Non-consecutive pincites unsupported** (§6,
    r[normalize.span-nonconsecutive]) — `at *1, *3` and `490, 495`.

26. **Footnote and paragraph pincites unsupported** (§6, Rule 3.2(b)).

27. **Abbreviation spacing is the user's responsibility** (§6, Rules
    6.1–6.2) — `N.E.3d` closes up, `F. Supp. 2d` does not. Freeform
    fields render verbatim. Previously unstated.

**Deferred items pulled forward — findings 28–30:**

28. **Non-consecutive pincites now supported**
    (r[normalize.span-nonconsecutive], §11.4). Deferred in the previous
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

31. **Concrete data model** (§11) — normative field IDs, enumerations,
    and types. Numeric-looking fields are typed `string`
    (r[types.numeric-fields-are-strings]): volumes, sections, and titles
    carry non-numeric characters (`14A`, `3767.32(A)`), docket leading
    zeros are meaningful, and empty must be distinguishable from zero.
    `Month` stores the rendered literal (`Sept.`) rather than an index,
    so no formatting layer can reintroduce `Sep.`

32. **UI specification** (§12) — layout, field grouping and order, state
    badges, validation and staleness affordances, responsive and target
    sizing. State is never conveyed by colour alone
    (r[ui.state-not-colour-only]); errors associate via `aria-invalid`
    and `aria-describedby` and clear on generate rather than on
    keystroke (r[ui.error-association]), so a message cannot vanish
    before it is read.

---

## 11. Concrete data model

Field IDs below are normative — tests, UI, and logic refer to these
exact names. Types are given in TypeScript notation for precision; no
particular language is implied (§7.5).

### 11.1 Enumerations

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

### 11.2 Field data

One flat object. Fields not used by the active `sourceType` are
`disabled` in the UI (§3.5) but retain their values (§3.5, never
cleared on type switch).

```ts
interface CitationFields {
	sourceType: SourceType;

	// shared, case types only
	caseType: CaseType;
	party1: string;
	party2: string; // used only when caseType === 'v'
	court: string; // optional — r[court.optional]
	pincite: string; // freeform; parsed per §11.4

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
	popularName: string; // optional — r[statute.popular-name]
	statuteTitle: string; // optional — r[statute.title]
	codeAbbrev: string;
	section: string;
	publisher: string; // required iff codeType === 'annotated'
	materialLocation: MaterialLoc;
	codeEditionYear: string; // disabled iff materialLocation === 'supplementOnly'
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

### 11.3 Display state

Separate from field data, because changing it re-renders without
re-validating (r[generate.display-controls-live]) and it is not saved
in Phase 2 (§9 of the master spec).

```ts
interface DisplayState {
	mode: Mode;
	nameVariant: NameVariant; // meaningful only when mode === 'short'
	useId: boolean; // gated per r[id.gating]
	emphasis: Emphasis; // default 'italic'
	spanSep: SpanSep; // default 'hyphen' — r[normalize.span-separator]
}
```

### 11.4 Pincite parsing

r[pincite.parse]
The pincite field is one freeform string parsed into comma-separated
components. Span reduction (r[normalize.span-digits]) applies **only** to
components matching a pure numeric span; every other component passes
through verbatim. This is what lets footnote and paragraph pincites work
without a dedicated field.

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
Consistent with the freeform stance taken for reporters and courts (§6).

### 11.5 Segment representation

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

## 12. UI specification

### 12.1 Layout

Single column. Three regions in fixed order: **source-type selector**,
**field form**, **output panel**. No tabs, no accordions — every field
stays visible at all times (§3.5).

### 12.2 Source-type selector

Three options, native radio inputs styled as a segmented control
(`role="radiogroup"`, arrow-key navigable). Changing selection re-labels
field states and marks output stale (r[generate.type-switch-stale]).

### 12.3 Field states

Each field carries exactly one state badge:

| State    | Badge      | Input      | Contrast requirement |
| -------- | ---------- | ---------- | -------------------- |
| Required | `required` | enabled    | WCAG AA              |
| Optional | `optional` | enabled    | WCAG AA              |
| Not used | `not used` | `disabled` | AA for disabled text |

r[ui.state-not-colour-only]
State is conveyed by the badge text and `aria-required` / `disabled`
attributes, never by colour alone.

r[ui.shared-marker]
Fields shared across source types carry a persistent visual marker
(left border rule) distinct from the state badge, plus an
`aria-describedby` note stating the value carries over between types.
This is a fourth visual signal but not a fourth _state_ — a field is
simultaneously shared and required/optional/not-used.

### 12.4 Field grouping and order

| Group           | Fields (in order)                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Case identity   | `caseType`, `party1`, `party2`                                                                                                                              |
| Court & pincite | `court`, `pincite`                                                                                                                                          |
| Reported        | `volume`, `reporter`, `firstPage`, `year`                                                                                                                   |
| Unreported      | `availability`, `docket`, `databaseId`, `month`, `day`, `dateYear`                                                                                          |
| Statute         | `codeType`, `popularName`, `statuteTitle`, `codeAbbrev`, `section`, `publisher`, `materialLocation`, `codeEditionYear`, `supplementDesig`, `supplementYear` |

Group headings dim when the group is not used by the active type; fields
inside remain visible and disabled.

### 12.5 Output panel

- **Mode** segmented control: Full citation / Short form.
- **Name variant** segmented control: hidden entirely when
  `mode === 'full'` (r[name-variant.short-form-only]) or when
  `useId === true`. Party 1 / Party 2 options collapse to one when
  `caseType !== 'v'`.
- **Id.** checkbox, enabled only per r[id.gating], with the confirmation
  text as its label — not as separate helper copy, so the confirmation
  cannot be visually detached from the control.
- **Emphasis** toggle: Italic / Underline.
- **Span separator** toggle: Hyphen / En dash, with a one-line note that
  hyphen keeps word counts lower in Word.
- **Live example line** under the name-variant control showing the
  current selection applied to the user's own data.
- **Output area** rendering the citation with emphasis applied.
- **Copy button** writing `text/html` + `text/plain`
  (r[copy.stale-permitted] — stale output stays copyable).

### 12.6 Validation display

r[ui.error-association]
Validation errors set `aria-invalid` on the offending input and
associate the message via `aria-describedby`. The summary banner is
`role="alert"`. Field-level errors clear on the next successful
generate, not on keystroke — so an error message doesn't disappear
before it's read.

### 12.7 Staleness display

r[ui.stale-affordance]
Stale output (r[generate.stale-on-data-edit]) is marked by a visible
text note plus a border-style change, never a colour change alone. The
output remains readable and copyable.

### 12.8 Responsive and input targets

- Interactive targets ≥44×44 px.
- Two-column field rows collapse to one column below 480 px.
- Layout survives 200% browser zoom without horizontal scroll.
- `prefers-reduced-motion` respected on the copy-confirmation
  transition.
- No hover-only affordances.
