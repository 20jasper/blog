# Bluebook 22

_AI-generated, human-validated._

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

## Reported Long Form

r[citation.reported-long-form]

> "Name of the case (underlined or italicized and abbreviated
> according to Rule 10.2) / Volume of the _United States Reports_ /
> Reporter abbreviation ("U.S.") / First page of the case / Year the
> case was decided"
> — [Georgetown, Federal Courts](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339383)

Generalized beyond U.S. Reports:

```
[Name], [Volume] [Reporter] [First page], [Pincite] ([Court] [Year]).
```

Volume, Reporter, First page, and Year are required. Pincite is
optional here (required for short form; see Reported Short Form).
Reporter is freeform, unvalidated against Table 1.

## Court Omission

r[court.optional]
Rule 10.4. The U.S. Reports citation format (quoted under Reported
Long Form) has no court element at all:

> `Roe v. Wade, 410 U.S. 113 (1973)`
> — [Georgetown, Federal Courts](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339383)

The Federal Reporter format does have one ("Name of the court
(abbreviated according to Rule 10.4)"), which is why a circuit case
carries it: `Universal City Studios, Inc. v. Corley, 273 F.3d 429 (2d
Cir. 2001)`. Blank Court renders the year alone.

## Short-Form Party Choice

r[short-form.party-choice]
Rule 10.9(a)(i). Georgetown's own short-form example for the same case
keeps the second, more distinctive party:

> `Universal City Studios, Inc. v. Corley, 273 F.3d at 435` or
> `Corley, 273 F.3d at 435`
> — [Georgetown, Short Forms](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339389)

Not inferred here: the user picks Party 1 or Party 2.

## Case Name Assembly

r[case-name.assembly]

> "The Bluebook recommends, for example, shortening any procedural
> phrases to abbreviations such as 'In re' or 'Ex parte'"
> — [Colorado CCS, Bluebook Citation](https://cccs.libguides.com/c.php?g=1318336&p=9697124)

`Party1 v. Party2`, `In re Party1`, or `Ex parte Party1` depending on
case type (Rule 10.2.1). Case type and Party 1 are always required;
Party 2 is required only for `v.` Party names are typed in already
abbreviated (Rule 10.2 abbreviation itself isn't automated).

## Short-Form Case Name

r[case-name.short-form]
Uses the selected party (per Short-Form Party Choice), or the assembled
name for `In re`/`Ex parte`, which have only one party.

## Id. Gating

r[id.gating]

> "Id. is used when the case appeared in the immediately preceding
> citation and the citation included only that case."
> — [Georgetown, Short Forms](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339389)

Rule 4.1. Gated behind a manual checkbox confirming exactly that, since
no citation-sequence memory exists to verify it automatically.

## Reported Short Form

r[citation.reported-short-form]

> "Name of the case (underlined or italicized and abbreviated
> according to Rule 10.2) / Volume of the reporter / Reporter
> abbreviation / Pinpoint citation to specific page referenced preceded
> by 'at'"
> — [Georgetown, Short Forms](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339389)

```
[Name?], [Volume] [Reporter] at [Pincite].
```

Rule 10.9. Pincite required. _Id._ replaces name+reporter with `Id.`

| Name variant | Output                                                     |
| ------------ | ---------------------------------------------------------- |
| Full name    | `Universal City Studios, Inc. v. Corley, 273 F.3d at 435.` |
| Party 1      | `Universal City Studios, Inc., 273 F.3d at 435.`           |
| Party 2      | `Corley, 273 F.3d at 435.`                                 |
| No name      | `273 F.3d at 435.`                                         |
| Id.          | `Id. at 435.`                                              |

## Name Variant Scope

r[name-variant.short-form-only]

> "Thus far, this guide has described how to cite cases in long form,
> i.e., how you cite a case for the first time in a document. ...
> [t]he Bluebook has established a 'short form' for use in subsequent
> citations."
> — [Georgetown, Short Forms](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339389)

Rule 10.9: applies to short forms only. A full citation always carries
the complete name; the control is hidden in full-citation mode.

## Name Variant Options

r[name-variant.options]

> "Other short forms are acceptable as long as it's clear which case
> you are citing."
> — [Georgetown, Short Forms](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339389)

Full name / Party 1 / Party 2 / No name (the four forms Georgetown's
own example list shows). Party 1/Party 2 collapse to one option for
`In re`/`Ex parte` (single-party types).

## Pincite Span Separator

r[normalize.span-separator]

> "A span of multiple pages may be cited by giving the inclusive page
> numbers separated by either an en dash (–) or a hyphen (-)."
> — [Tarlton, Pages, Paragraphs, and Pincites](https://tarlton.law.utexas.edu/bluebook-legal-citation/pages-paragraphs-pincites)

Rule 3.2(a): neither separator is required. Defaults to hyphen: Word's
word counter reads `1065-66` as one word, `1065–66` as two, which
matters under a brief's word limit.

## Pincite Digit Retention

r[normalize.span-digits]

> "only retain the last two digits if the first are identical. Use an
> en dash or dash to separate the pages (e.g. 190-92 or 199-201 or 188,
> 190-93)."
> — [Suffolk, Bluebook Guide: Cases](https://lawguides.suffolk.edu/bluebook/cases)

Rule 3.2(a). Counts shared leading digits between start and end page
(only when both have the same digit count; `8-10` keeps both pages in
full since they don't), then keeps at least the last two:
`keep = max(2, digits(end) - sharedLeadingDigits)`.

| Span      | Output   |
| --------- | -------- |
| 208–214   | 208–14   |
| 1099–1101 | 1099–101 |
| 199–201   | 199–201  |

## Pincite Span Input

r[normalize.span-input]
Accepts a span as typed, full (`208-214`) or already reduced
(`208-14`); both normalize identically.

## Non-Consecutive Pincites

r[normalize.span-nonconsecutive]

> "Citations to multiple, non-consecutive pages are separated by
> commas: _Edgewater Foundation v. Thompson_, 350 F.3d 694, 695, 697
> (7th Cir. 2003)."
> — [Tarlton, Pages, Paragraphs, and Pincites](https://tarlton.law.utexas.edu/bluebook-legal-citation/pages-paragraphs-pincites)

Rule 3.2(a). `490, 495`, not a span. Each component parses
independently.

## Footnote Pincite Passthrough

r[normalize.span-passthrough]

> "For a citation directly to a footnote, give the page number on
> which the note begins, the abbreviation "n." and the footnote
> number."
> — [Tarlton, Pages, Paragraphs, and Pincites](https://tarlton.law.utexas.edu/bluebook-legal-citation/pages-paragraphs-pincites)

`1137 n.4` passes through verbatim, unvalidated.
