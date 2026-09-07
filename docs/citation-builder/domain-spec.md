# Citation Builder — Domain Spec

Bluebook 22nd ed. rules for the reported-case slice. Each rule below is
`r[id]`-tagged for tracey, tracked against `domain/` and `state/`.

---

## Glossary

| Term              | Meaning                                                       |
| ----------------- | ------------------------------------------------------------- |
| **Full citation** | First, complete citation. Not "long cite."                    |
| **Short form**    | Citation to a source already cited in full. Not "short cite." |
| **Pincite**       | Page pointing to exactly where cited support appears.         |
| **Id.**           | Short form for the same source cited immediately before.      |
| **Name variant**  | Which case-name form a short form uses.                       |
| **Span**          | Consecutive-page pincite (`208-14`).                          |
| **Segment**       | Internal unit: text + emphasis state. Tool-internal.          |

---

## Data Model

**Shared:** Case type (`v.` / `In re` / `Ex parte`, required), Party 1
(required), Party 2 (required iff `v.`), Court (optional), Pincite
(optional full / required short).

**Reported:** Volume, Reporter, First page, Year — all required.

---

## Court Omission

r[court.optional]
Rule 10.4: court is optional, omitted from the parenthetical when the
reporter itself identifies it (`Roe v. Wade, 410 U.S. 113, 164
(1973).`). Blank Court renders the year alone.
[Georgetown Federal Courts](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339383).

## Short-Form Party Choice

r[short-form.party-choice]
Rule 10.9(a)(i): the short form keeps whichever party is more
distinctive, e.g. "Corley" over "Universal City Studios, Inc." Not
inferred — the user picks Party 1 or Party 2.
[Georgetown Short Forms](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339389).

## Case Name Assembly

r[case-name.assembly]
Rule 10.2.1: `Party1 v. Party2`, `In re Party1`, or `Ex parte Party1`.
Source: Colorado CCS; Liberty; Notre Dame.

## Short-Form Case Name

r[case-name.short-form]
Uses the selected party (per Short-Form Party Choice), or the assembled
name for `In re`/`Ex parte`, which have only one party.

## Pincite Span Separator

r[normalize.span-separator]
Rule 3.2(a) permits either hyphen or en dash for a page span; neither
required. Defaults to hyphen — Word's word counter reads `1065-66` as
one word, `1065–66` as two, which matters under a brief's word limit.
Source: Georgetown Basic Bluebook handout; Tarlton.

## Pincite Digit Retention

r[normalize.span-digits]
Rule 3.2(a): retain the closing page's last two digits, drop shared
leading digits. `commonPrefix = shared leading digits (equal length
only); keep = max(2, digits(end) - commonPrefix)`.

| Span      | Output   |
| --------- | -------- |
| 208–214   | 208–14   |
| 1099–1101 | 1099–101 |
| 199–201   | 199–201  |

Source: Georgetown handout; Suffolk; Briefly.

## Pincite Span Input

r[normalize.span-input]
Accepts a span as typed, full (`208-214`) or already reduced
(`208-14`) — both normalize identically.

## Non-Consecutive Pincites

r[normalize.span-nonconsecutive]
Rule 3.2(a): non-consecutive pages are comma-separated (`490, 495`),
not a span. Each component parses independently.

## Footnote Pincite Passthrough

r[normalize.span-passthrough]
Rule 3.2(b): non-numeric-span components (`1137 n.4`) pass through
verbatim, unvalidated.

## Name Variant Scope

r[name-variant.short-form-only]
Rule 10.9: applies to short forms only. A full citation always carries
the complete name; the control is hidden in full-citation mode.

## Name Variant Options

r[name-variant.options]
Full name / Party 1 / Party 2 / No name. Party 1/Party 2 collapse to
one option for `In re`/`Ex parte` (single-party types).

## Reported Long Form

r[citation.reported-long-form]

```
[Name], [Volume] [Reporter] [First page], [Pincite] ([Court] [Year]).
```

Rule 10. Court omitted per Court Omission when blank.
[Georgetown Federal Courts](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339383).

## Id. Gating

r[id.gating]
Rule 4.1: available only in short-form mode, gated behind a manual
checkbox confirming the citation immediately follows one to the same,
and only that, source. No citation-sequence memory to verify it
automatically.

## Reported Short Form

r[citation.reported-short-form]

```
[Name?], [Volume] [Reporter] at [Pincite].
```

Rule 10.9. Pincite required. _Id._ replaces name+reporter with `Id.`

_Universal City Studios, Inc. v. Corley_, 273 F.3d 429 (2d Cir. 2001),
at 435:

| Name variant | Output                                                     |
| ------------ | ---------------------------------------------------------- |
| Full name    | `Universal City Studios, Inc. v. Corley, 273 F.3d at 435.` |
| Party 1      | `Universal City Studios, Inc., 273 F.3d at 435.`           |
| Party 2      | `Corley, 273 F.3d at 435.`                                 |
| No name      | `273 F.3d at 435.`                                         |
| Id.          | `Id. at 435.`                                              |

[Georgetown Short Forms](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339389).

---

## Known Limitations

- No Table 1 validation on reporter/court abbreviations — freeform.
- No Rule 10.2 case-name abbreviation automation.
- Footnote pincites accepted but not validated.
- No citation-sequence memory — _Id._ needs manual confirmation.
- Unreported cases and statutes: not in this slice.
