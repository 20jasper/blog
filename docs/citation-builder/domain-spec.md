# Citation Builder — Domain Spec

Bluebook citation-format rules for the reported-case slice. No
architecture, UI, or testing-process content.

**Bluebook edition:** The Bluebook, 22nd edition (Harvard Law Review
Association, May 2025).

---

## 1. Glossary

| Term              | Meaning                                                                                                                                                               | Rule            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Full citation** | First, complete citation of a source. Not "long cite."                                                                                                                | Rule 10         |
| **Short form**    | Abbreviated citation to a source already cited in full. Not "short cite."                                                                                             | Rule 10.9       |
| **Pincite**       | The specific page pointing to exactly where cited support appears.                                                                                                    | —               |
| **Reporter**      | Publication series a case is printed in (e.g., N.E.3d, F.3d).                                                                                                         | —               |
| **Id.**           | Short form indicating the citation is to the same, and only, source cited immediately before. Requires manual confirmation (§5.7).                                    | Rule 4.1        |
| **Name variant**  | Which form of the case name a **short form** uses: full name, one party, or omitted. Applies to short forms only -- a full citation always carries the complete name. | Rule 10.9(a)(i) |
| **Span**          | A pincite covering consecutive pages (`208-14`).                                                                                                                      | Rule 3.2(a)     |
| **Segment**       | One unit of the internal citation representation: a run of text plus its emphasis state. Tool-internal, not a Bluebook concept.                                       | —               |

**Rule-ID convention:** every normative statement that a test can assert
against carries an `r[...]` identifier.

---

## 2. Rule reference map

| Feature                                                    | Rule            |
| ---------------------------------------------------------- | --------------- |
| Case citation, general structure                           | Rule 10         |
| Case-name abbreviation (not automated -- user-entered)     | Rule 10.2       |
| Court identification; omission when reporter implies court | Rule 10.4       |
| Short form for cases                                       | Rule 10.9       |
| Short-form party choice (which party is retained)          | Rule 10.9(a)(i) |
| Id.                                                        | Rule 4.1        |
| Pincite spans, digit retention                             | Rule 3.2(a)     |

---

## 3. Data model

### 3.1 Shared fields

| Field     | Input                               | Required?                                               |
| --------- | ----------------------------------- | ------------------------------------------------------- |
| Case type | select: `v.` / `In re` / `Ex parte` | required                                                |
| Party 1   | text                                | required                                                |
| Party 2   | text                                | required only if case type = `v.`                       |
| Court     | text (freeform, unvalidated)        | **optional** -- see r[court.optional]                   |
| Pincite   | text                                | optional for full citation; **required** for short form |

r[court.optional]
Court is optional, not required. Rule 10.4 omits the court from the date
parenthetical when the reporter itself unambiguously identifies the
deciding court -- most commonly the U.S. Supreme Court cited to U.S.
Reports (`Roe v. Wade, 410 U.S. 113, 164 (1973).` -- no court shown).
When Court is blank, the parenthetical contains the date alone.

r[short-form.party-choice]
Short-form party selection is a user choice, not an inference. Rule
10.9(a)(i) keeps whichever party is more distinctive -- for _Universal
City Studios, Inc. v. Corley_ that is "Corley," the second party, not
the first. The short-form control offers **Party 1 / Party 2** (§5.2)
rather than guessing. For `In re` / `Ex parte` types there is only one
party and the control is not shown.

### 3.2 Reported case

| Field      | Input                        | Required? |
| ---------- | ---------------------------- | --------- |
| Volume     | text/number                  | required  |
| Reporter   | text (freeform, unvalidated) | required  |
| First page | text/number                  | required  |
| Year       | number                       | required  |

---

## 4. Normalization rules

### 4.1 Pincite span normalization

r[normalize.span-separator]
Rule 3.2(a) permits **either** an en dash (`–`) or a hyphen (`-`) for a
page span. Neither is required. The separator is therefore a **user
preference** (§5.3), defaulting to hyphen -- Word's word counter treats
`1065-66` as one word but `1065–66` as two, and briefs filed under a
word limit certify counts from that counter.

r[normalize.span-digits]
Rule 3.2(a): always retain the final two digits of the closing page;
drop other repetitious leading digits.

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
| 208–214   | `208–14`   | common prefix `2`                        |
| 1099–1101 | `1099–101` | common prefix `1`, three digits retained |
| 199–201   | `199–201`  | no common prefix, full number kept       |
| 44–45     | `44–45`    | two-digit span, floor applies            |
| 8–10      | `8–10`     | differing digit counts, full number kept |

r[normalize.span-input]
The pincite field accepts a span as the user types it (`208-214` or
`208-14`). If the closing number is given in full, it is reduced per
r[normalize.span-digits]. If already reduced, it is left alone.

r[normalize.span-nonconsecutive]
Non-consecutive pages are separated by commas, not a span (`490, 495`)
-- Rule 3.2(a). The pincite field accepts comma-separated components,
each parsed independently.

r[normalize.span-passthrough]
Pincite components that are not pure numeric spans pass through
verbatim -- this is what makes footnote (`1137 n.4`, Rule 3.2(b))
pincites work without a dedicated field.

### 4.2 Case name assembly

r[case-name.assembly]
`Party1 v. Party2`, `In re Party1`, or `Ex parte Party1` depending on
case type.

r[case-name.short-form]
Short form uses whichever single party the user selected (Party 1 or
Party 2, per r[short-form.party-choice]), or the assembled name for
`In re` / `Ex parte`, which have only one party.

---

## 5. Output rules

### 5.1 Sentence form

All output is a standalone, capitalized, period-terminated citation.

### 5.2 Name variant -- short forms only

r[name-variant.short-form-only]
The name-variant control applies to **short forms only**. A full
citation always carries the complete assembled case name (§4.2). When
mode = full citation, the control is hidden, not merely defaulted.

r[name-variant.options]
In short-form mode the control offers: **Full name / Party 1 / Party 2
/ No name.** Party 1 / Party 2 collapse to a single option for `In re` /
`Ex parte` types, which have one party.

### 5.3 Output preferences

Toggle: **Italic / Underline** for case names and _Id._

Toggle: **Hyphen / En dash** for page spans, defaulting to hyphen
(r[normalize.span-separator]).

### 5.4 Long-form structure

```
[Name], [Volume] [Reporter] [First page], [Pincite] ([Court] [Year]).
```

With Court omitted (r[court.optional]):

```
[Name], [Volume] [Reporter] [First page], [Pincite] ([Year]).
```

r[citation.reported-long-form]
Full citation follows the template above: assembled name (always
complete -- r[name-variant.short-form-only]), then volume/reporter/first
page, an optional pincite, and a parenthetical carrying court and year,
or year alone when Court is blank -- framed as one capitalized,
period-terminated sentence.

### 5.7 Id. gating

r[id.gating]
_Id._ is available only when: mode = short form, and the user checks a
confirmation control stating the citation immediately follows a
citation to the same source, and only that source. Manual by design (§6
-- no citation-sequence memory).

When Id. is selected, the name-variant control is hidden.

```
[Name?], [Volume] [Reporter] at [Pincite].
```

r[citation.reported-short-form]
Short form: name (per the §5.2 variant -- full, one party, or omitted
entirely, dropping its trailing comma too), then volume, reporter, and
pincite joined by "at". Pincite is required for short form (§3.1).
_Id._ replaces the entire name-and-reporter portion with just `Id.`,
emphasized: `Id. at [Pincite].`

Worked example (_Universal City Studios, Inc. v. Corley_, 273 F.3d 429
(2d Cir. 2001), at page 435):

| Name variant | Output                                                     |
| ------------ | ---------------------------------------------------------- |
| Full name    | `Universal City Studios, Inc. v. Corley, 273 F.3d at 435.` |
| Party 1      | `Universal City Studios, Inc., 273 F.3d at 435.`           |
| Party 2      | `Corley, 273 F.3d at 435.`                                 |
| No name      | `273 F.3d at 435.`                                         |
| Id.          | `Id. at 435.`                                              |

---

## 6. Known limitations

- No Table 1 validation on reporter/court abbreviations -- freeform, no
  UI disclaimer.
- No Rule 10.2 case-name abbreviation automation.
- **Court omission is the user's judgment call.** Rule 10.4 omits the
  court when the reporter implies it, but the tool cannot infer that
  from a freeform reporter string (r[court.optional]).
- **Short-form party choice is surfaced, not inferred**
  (r[short-form.party-choice]).
- **Footnote pincites are accepted but not validated**
  (r[normalize.span-passthrough]).
- **No citation-sequence memory.** _Id._ can't be verified by the tool
  -- hence the manual confirmation in §5.7 rather than an automatic
  option.
- Unreported cases and statutes are not yet supported -- reported cases
  only, in this slice.

---

## 7. Rule provenance

### 7.1 Schema

| Column      | Meaning                                             |
| ----------- | --------------------------------------------------- |
| `rule`      | The `r[...]` identifier                             |
| `authority` | Bluebook rule/table or external standard            |
| `status`    | `verified` (external source confirms) or `asserted` |
| `source`    | Where it was confirmed                              |

### 7.2 Bluebook-derived rules

| rule                            | authority       | status   | source                                                                        |
| ------------------------------- | --------------- | -------- | ----------------------------------------------------------------------------- |
| `court.optional`                | Rule 10.4       | verified | Georgetown Federal Courts; Monmouth (Supreme Court parenthetical omits court) |
| `short-form.party-choice`       | Rule 10.9(a)(i) | verified | Georgetown Short Forms (_Corley_ retains second party)                        |
| `case-name.short-form`          | Rule 10.9(a)(i) | verified | Georgetown Short Forms                                                        |
| `name-variant.short-form-only`  | Rule 10.9       | verified | Georgetown Short Forms                                                        |
| `name-variant.options`          | Rule 10.9(a)(i) | verified | Georgetown Short Forms                                                        |
| `case-name.assembly`            | Rule 10.2.1     | verified | Colorado CCS; Liberty; Notre Dame                                             |
| `citation.reported-long-form`   | Rule 10         | verified | Georgetown Federal Courts; Monmouth                                           |
| `citation.reported-short-form`  | Rule 10.9       | verified | Georgetown Short Forms                                                        |
| `id.gating`                     | Rule 4.1        | verified | Georgetown Short Forms                                                        |
| `normalize.span-separator`      | Rule 3.2(a)     | verified | Georgetown Basic Bluebook handout; Tarlton                                    |
| `normalize.span-digits`         | Rule 3.2(a)     | verified | Georgetown handout; Suffolk; Briefly                                          |
| `normalize.span-nonconsecutive` | Rule 3.2(a)     | verified | Georgetown handout; Monmouth                                                  |
| `normalize.span-passthrough`    | Rule 3.2(b)     | verified | Georgetown handout (footnote pincites pass through unchanged)                 |
