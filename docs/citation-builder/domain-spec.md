# Bluebook 22

_AI-generated, human-validated._

`<required>` `[optional]`

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
<Name>, <Volume> <Reporter> <First page>, [Pincite] ([Court] <Year>).
```

Pincite required for short form (see Reported Short Form). Reporter is
freeform, unvalidated against Table 1.

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

## Weight of Authority Parenthetical

r[weight-of-authority.parenthetical]

> "To highlight information regarding the weight of the cited
> authority (e.g., for concurring and dissenting opinions), insert an
> additional parenthetical after the date parenthetical. Remember to
> separate the parentheticals with a space."
> — [Indigo Book, Rule 13.1](https://law.resource.org/pub/us/code/blue/IndigoBook.html#R13.1)

<!-- prettier-ignore -->
> `Ward v. Rock Against Racism, 491 U.S. 781 (1989) (Marshall, J.,
> dissenting).`
> — [Indigo Book, Rule 13.1](https://law.resource.org/pub/us/code/blue/IndigoBook.html#R13.1)

Free text, wrapped in parens and appended after the date parenthetical
(and before any trailing URL, for online-only unreported cases).
Applies to reported and unreported cases, full form only -- not
statutes, which have no concept of weight of authority. Explanatory
parentheticals (Rule 13.2, explaining what a case holds) and stacking
multiple weight-of-authority parentheticals in one citation are out of
scope; type them all into the one field if needed.

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
case type (Rule 10.2.1).

## Case Name Word Abbreviation

r[case-name.word-abbreviation]

> "Citation sentences must additionally abbreviate the words in Rule
> 10.2.2 and Table 6."
> — [Suffolk, Bluebook Guide for Law Students](https://lawguides.suffolk.edu/bluebook/cases)

Sourced from [freelawproject/reporters-db](https://github.com/freelawproject/reporters-db)'s
`case_name_abbreviations.json`.

Not implemented:

> "Use T10 to abbreviate states, countries, and other geographical
> units, unless the geographical unit is the entire name of the party
> (e.g., United States)."
> — [Suffolk, Bluebook Guide for Law Students](https://lawguides.suffolk.edu/bluebook/cases)

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
[Name], <Volume> <Reporter> at <Pincite>.
```

Rule 10.9. _Id._ replaces name+reporter with `Id.`

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

## Signal

r[signal.prefix]

> "A signal illustrates the relationship between the author’s
> assertion and the source cited for that assertion. The signal begins
> the citation sentence or clause."
> — [Indigo Book, Rule 4.1](https://law.resource.org/pub/us/code/blue/IndigoBook.html#R4.1)

r[signal.options]

> "There are four basic categories of signals:"
> — [Indigo Book, Rule 4.2](https://law.resource.org/pub/us/code/blue/IndigoBook.html#R4.2)

| Category                            | Signals                                                    |
| ----------------------------------- | ---------------------------------------------------------- |
| Signals for Supporting Authority    | `[No signal]`, `E.g.,`, `Accord`, `See`, `See Also`, `Cf.` |
| Signals for Contradictory Authority | `Contra`, `But see`, `But cf.`                             |
| Signals for Background Material     | `See generally`                                            |

`Compare ... with ...` (Signals for Comparison) is out of scope --
it cites two sources, and this tool assembles one citation at a time.
Multi-authority ordering (Rule 4.3) is likewise out of scope.

Rendered as `See also`, not the table's `See Also`: the signal is
only ever sentence-initial here (Rule 4.1), so only its first word is
capitalized.

r[signal.typeface]

> "Only the following items should be italicized: ... Introductory
> signals (e.g., see, cf. and accord)"
> — [Indigo Book, Rule 2.1](https://law.resource.org/pub/us/code/blue/IndigoBook.html#R2.1)

## Docket Number Prefix

r[normalize.docket]

> `United States v. Bennett, No. 05-CR-6050 CJS, 2005 WL 2709572`
> — [Georgetown, Unpublished Opinions](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339386)

> "Docket / Case number - as it appears on court documents or follow
> local court rules"
> — [Cincinnati, Bluebook Citation 101 (Rule 10.8.1)](https://guides.libraries.uc.edu/c.php?g=222561&p=1472891)

| Input                 | Output                |
| --------------------- | --------------------- |
| `05-1234`             | `No. 05-1234`         |
| `No. 05-1234`         | `No. 05-1234`         |
| `No.05-1234`          | `No. 05-1234`         |
| `Case No. 21-56789`   | `Case No. 21-56789`   |
| `Docket No. 21-56789` | `Docket No. 21-56789` |
| `Civ. A. No. 1234`    | `Civ. A. No. 1234`    |
| `North-123`           | `No. North-123`       |

## Month Abbreviations

r[date.month-list]

> "Date the case was decided, including month (Table 12), day, and
> year"
> — [Georgetown, Unpublished Opinions](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339386)

`Jan.` `Feb.` `Mar.` `Apr.` `May` `June` `July` `Aug.` `Sep.` `Oct.`
`Nov.` `Dec.`

## Date Assembly

r[normalize.date]

> `(W.D.N.Y. Oct. 21, 2005)`
> — [Georgetown, Unpublished Opinions](https://guides.ll.georgetown.edu/c.php?g=261289&p=2339386)

`[Month] [Day], [Year]`

## Unreported Case Availability

r[unreported.availability]

> `2007 WL 1032301, at *3 (E.D. Ky. Mar. 30, 2007)`
> — [UC Cincinnati, Commercial Databases](https://guides.libraries.uc.edu/c.php?g=222561&p=1472887)

`database` | `slip` | `online`

## Unreported Long Form

r[citation.unreported-long-form]
r[citation.unreported-pincite-form]

> `No. 1-07-2937, slip op. at 2 (Ill. App. Ct. 1st Dist. June 30, 2008)`
> — [NIU, Sample Bluebook Citations](https://libguides.niu.edu/c.php?g=700603&p=4971129)

```
[Name], No. [Docket], [Database ID], at *[Pincite] ([Court] [Month] [Day], [Year]).
[Name], No. [Docket], slip op. at [Pincite] ([Court] [Month] [Day], [Year]).
```

## Online-Only Availability

r[unreported.online-only]

> "Opinions only available online, but not in an electronic database:
> Some cases, particularly ones that are pending, may be accessed only
> through a court’s website. If so, include the URL."
> — [Indigo Book, Rule 12.4.3](https://law.resource.org/pub/us/code/blue/IndigoBook.html#R12.4.3)

<!-- prettier-ignore -->
> `Macy’s Inc. v. Martha Stewart Living Omnimedia, Inc., No. 1728,
> slip op. at 1 (N.Y. App. Div. Feb. 26, 2015),
> http://www.nycourts.gov/reporter/3dseries/2015/2015_01728.htm.`
> — [Indigo Book, Rule 12.4.3](https://law.resource.org/pub/us/code/blue/IndigoBook.html#R12.4.3)

Same as `slip` (docket + `slip op. at` pincite), with the URL appended
after the date parenthetical, separated by a comma.

## Unreported Short Form

r[citation.unreported-short-form]

> `Beaven, 2007 WL 1032301, at *3.`
> — [UC Cincinnati, Commercial Databases](https://guides.libraries.uc.edu/c.php?g=222561&p=1472887)

```
[Name?], [Database ID], at *[Pincite].
[Name?], No. [Docket], slip op. at [Pincite].
```

## Statute Section Prefix

r[normalize.section]

> `28 U.S.C. §§ 1350(a)(2)-(c)(2) (2018)`
> — [Suffolk, Statutory Citation: Rule 12](https://lawguides.suffolk.edu/bluebook/statutes)

| Input       | Output       |
| ----------- | ------------ |
| `1350`      | `§ 1350`     |
| `§1350`     | `§ 1350`     |
| `§ 1350`    | `§ 1350`     |
| `§§1350-51` | `§§ 1350-51` |

## Statute Code Type

r[statute.code-type]

> "Cite to the official United Statutes Code (U.S.C.), if available;
> otherwise, cite an unofficial code, such as the United States Code
> Annotated (U.S.C.A.), available on Westlaw, or the United States Code
> Service (U.S.C.S.), available on Lexis."
> — [Suffolk, Statutory Citation: Rule 12](https://lawguides.suffolk.edu/bluebook/statutes)

`official` | `annotated`

## Statute Material Location

r[statute.material-location]

> `17 U.S.C. § 107 (2012 & Supp. I 2014)`
> — [Georgetown, Federal Statutes](https://guides.ll.georgetown.edu/c.php?g=261289&p=2383798)

`main` | `both` | `supplement`

## Statute Date Parenthetical

r[statute.supplement-pairing]

> `17 U.S.C. § 107 (2012)`
> `17 U.S.C. § 107 (Supp. I 2014)`
> `17 U.S.C. § 107 (2012 & Supp. I 2014)`
> — [Georgetown, Federal Statutes](https://guides.ll.georgetown.edu/c.php?g=261289&p=2383798)

## Statute Publisher

r[statute.publisher]

> `17 U.S.C.A. § 107 (West 2015)`
> `17 U.S.C.S. § 107 (LexisNexis 2016)`
> — [Georgetown, Federal Statutes](https://guides.ll.georgetown.edu/c.php?g=261289&p=2383798)

## Statute Popular Name

r[statute.popular-name]

> `Copyright Act of 1976, 17 U.S.C. §§ 101-1332 (2012)`
> — [Georgetown, Federal Statutes](https://guides.ll.georgetown.edu/c.php?g=261289&p=2383798)

## Statute Original Section Number

r[statute.original-section]

> "Include the original section number of the provision after the
> statute name. “Original section number” refers to the section in the
> original act, whereas “section number” refers to the equivalent
> section as codified in the code."
> — [Indigo Book, Rule 16.1.4](https://law.resource.org/pub/us/code/blue/IndigoBook.html#R16.1.4)

<!-- prettier-ignore -->
> `Drug Price Competition and Patent Term Restoration Act § 202,
> 17 U.S.C. § 271(e) (2012).`
> — [Indigo Book, Rule 16.1.4](https://law.resource.org/pub/us/code/blue/IndigoBook.html#R16.1.4)

Meaningless without a popular name; a no-op if one isn't given.

## Statute Long Form

r[citation.statute-long-form]

> `17 U.S.C. § 107 (2012)`
> — [Georgetown, Federal Statutes](https://guides.ll.georgetown.edu/c.php?g=261289&p=2383798)

```
[Popular Name, ][Title ]<Code> § <Section> (<Parenthetical>).
```

After-code title placement is unconfirmed; only before-code is supported.

## Statute Short Form

r[citation.statute-short-form]

> `48 U.S.C. §§1411-12`
> — [Colorado CCS, Bluebook Citation](https://cccs.libguides.com/c.php?g=1318336&p=9697124)

```
[Title ]<Code> § <Section>.
```
