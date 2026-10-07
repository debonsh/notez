# BT203 Unit 2 — Measurement & Production

RGPV **BT-203 Basic Mechanical Engineering** (3L-0T-2P, 4 credits). Unit 2 of 5, and the second half
of the mid-sem scope together with Unit 1.

Read `../../note.md` before editing anything in this folder — it is the style contract, and this
file is only the index of it.

## Order

The order below is fixed and was decided **once**, on 3 October 2026, when the mid-term syllabus
page was ingested. It is **mid-sem priority order, not syllabus order** — the metrology instruments
come first because they are the most-asked items in the subject, ahead of welding and casting which
the narrow official text lists first. Once set it is **never renumbered** — renumbering breaks
bookmarks and the Progress `localStorage` keys.

| NN | File | Topic | Status |
|:--|:--|:--|:--|
| 01 | `01-measurement-concepts-errors.html` | Errors in measurement: systematic, random, gross | done |
| 02 | `02-micrometer-dial-slip.html` | Micrometer, dial gauge, slip gauge | done |
| 03 | `03-vernier-calliper.html` | Vernier calliper and method of measurement | done |
| 04 | `04-sine-bar-combination.html` | Sine bar and combination set | done |
| 05 | `05-lathe-drilling-machines.html` | Lathe and drilling machines | done |
| 06 | `06-physical-quantities-measurement.html` | Temperature, pressure, velocity, flow, force, torque | done |
| 07 | `07-dynamometer.html` | Dynamometer: types and working principle | done |
| 08 | `08-welding-casting.html` | Welding, casting and patterns | done |

Plus `index.html` (the hub) and `formula-sheet.html` (the printable one-pager).

**Numbering is permanent.** If a topic is later added, it becomes `09-…`, never a re-order.

**Note on 05.** Lathe and drilling were originally two planned cards. They were merged into one
topic because RGPV asks them as a pair in the same question, and because their two numerals
(N = 1000V/πD and T = L/fN) belong together. The later cards were renumbered accordingly, before
any page had been built, so no bookmark was broken.

## Why this order

The order follows the paper-corpus counts recorded in `notes/bt203/midsem.html`, not the syllabus
listing:

| Topic | Appearances | Why it sits where it does |
|:--|:--|:--|
| 02 Micrometer | **6 of 11 papers** | The single most-repeated item in the whole subject |
| 03 Vernier | 5 of 11 | Always asked beside the micrometer |
| 04 Sine bar | 4 of 11 | One formula, high marks per minute |
| 05 Lathe / drilling | 4 of 11 each | Asked as a pair |
| 06 Physical quantities | 4 of 11 on temperature alone | "Explain any one" makes it a lookup table |
| 08 Welding / casting | 3 of 11 | Dec-2020 Q6b |
| 07 Dynamometer | 1 of 11 | Dec-2020 Q2b; the cheapest marks in the unit |

## Scope — the wide reading

**This unit is built to the WIDE reading of the syllabus.** The official RGPV Unit 2 text names only
*"Errors in measurement; Dynamometer — types; Welding — processes and types."* The MST-1 syllabus
page adds the full metrology and machinery block, and the December 2020 paper examined exactly those
additions — micrometer, vernier, dial gauge, slip gauge, sine bar, lathe and drilling. Build to the
wide reading; the narrow one would leave most of the paper unprepared.

## Weightage and ROI

Unit 2 is nominally 20% of the BT-203 syllabus. Across 11 real papers its leaders are the
**micrometer (6)**, **vernier (5)**, **lathe (4)**, **drilling (4)**, **sine bar (4)** and
**temperature measurement (4)**.

**Only two numerals exist in the whole unit** — the micrometer's least count and reading, and the
sine bar's `sin θ = h/L`. Everything else is definition, classification and sketch work. If time is
short, do **01 → 02 → 03** and the key-sheet, and accept losing the rest.

## Figures that must not be confused

These are the errors the pages exist to prevent, and they have all been caught and corrected at
least once during the build:

| Instrument | Least count | The trap |
|:--|:--|:--|
| Micrometer | **0.01 mm** | Pitch is **0.5 mm**, not 1 mm |
| Vernier calliper (standard) | **0.02 mm** | **Not** 0.01 mm — that is the micrometer's |
| Vernier, 10 divisions | **0.1 mm** | The "10 MSD / 9 MSD rule" gives 0.1, **not** 0.01 |
| Dial gauge | 0.01 mm | Same count, but a **comparator**, not an absolute reader |

And two more that are not least counts:

- **Micrometer range = the spindle length** (0–25 mm for a 25 mm spindle). `10 × spindle` is the
  *total travel*, not the range.
- **Mercury density is 13600 kg/m³.** 13.6 is the *specific gravity*, and using it gives a pressure
  three orders wrong.

## Page contract

Every topic page in this folder carries, in order:

`zevu-header` → `tab-bar` (Lesson / Cheat-Sheet / Questionnaire) → `#lesson` → `#cheatsheet` →
`#questionnaire` → `zevu-footer` → the two canonical scripts.

Each topic page contains 5 MCQs, a PYQ drill (set A theory + set B recall), deep numerals with three
worked cases, and an ASCII diagram in the lesson body and at least three in the questionnaire.

Check a page against the contract before calling it done:

```bash
python3 tools/build-note-page.py --unit=unit2 02-micrometer-dial-slip "Title &mdash; Here" 02-micrometer-dial-slip.md
node tools/check-bt203-runtime.js unit2
python3 tools/sync-web.py && python3 tools/check-web.py
```

## Rebuilding a topic page

The `<style>` block and the two scripts are byte-identical on every page and are held once in the
scaffold, so a page cannot drift from the house style. Bodies for every subject live under
`tools/note-scaffold/<subject>/<unit>/` — namespaced, so a Unit 2 topic 02 cannot read Unit 1's
topic 02, and bt204 cannot read bt203's.

**The title is only in the page.** It is passed as a build argument and stored nowhere else, so
always copy the exact existing `<title>` out of the page you are about to rebuild rather than
retyping it from memory.

## Verified resources

Every link in the hub Resources tab and in the topic Sources blocks was fetched and checked on
**28 September 2026**. Re-verify before adding anything new — an unverified link is worse than one
fewer link.

- Official syllabus and unit notes —
  <https://www.rgpvnotes.in/btech/grading-system-old/notes/2018/12/basic-mechanical-engineering-bt-203>
  (full text of all five units, per-unit note downloads, reference book list)
- Question-paper index —
  <https://www.rgpvnotes.in/btech/grading-system-old/qp/2018/12/basic-mechanical-engineering-bt-203>
- December 2020 paper —
  <https://rgpvinfo.com/wp-content/uploads/2026/03/bt-203-basic-mechanical-engineering-dec-2020.pdf>
- Official reference books: Nakra & Chaudhary, *Instrumentation and Measurements*, TMH (primary for
  Unit 2); B. C. Punmia, *Engineering Metrology*; C. M. Agrawal, *Basic Mechanical Engineering*,
  Wiley (production content)
