# BT203 Unit 1 — Materials

RGPV **BT-203 Basic Mechanical Engineering** (3L-0T-2P, 4 credits). Unit 1 of 5, and the whole
of the mid-sem scope together with Unit 2.

Read `../../note.md` before editing anything in this folder — it is the style contract, and this
file is only the index of it.

## Order

The order below is fixed. It is syllabus order and mid-sem priority order at once, decided once
and **never renumbered** — renumbering breaks bookmarks and the Progress `localStorage` keys.

| NN | File | Topic | Status |
|:--|:--|:--|:--|
| 01 | `01-material-classification.html` | Classification of engineering materials | done |
| 02 | `02-cast-iron-carbon-steels.html` | Cast iron and carbon steels: composition and types | done |
| 03 | `03-iron-carbon-diagram.html` | Iron-carbon diagram | done |
| 04 | `04-alloy-steels.html` | Alloy steels and their applications | done |
| 05 | `05-mechanical-properties.html` | Mechanical properties of materials | done |
| 06 | `06-tensile-test-stress-strain.html` | Tensile test and stress-strain diagrams | done |
| 07 | `07-hookes-law-modulus.html` | Hooke's law and modulus of elasticity | done |
| 08 | `08-hardness-impact-testing.html` | Hardness and impact testing (BHN) | done |

Plus `index.html` (the hub) and `formula-sheet.html` (the printable one-pager).

**Numbering is permanent.** If a topic is later added, it becomes `09-…`, never a re-order.

## Weightage and ROI

Unit 1 is 20% of the BT-203 syllabus. In the December 2020 paper, 6 of 8 questions fell in
Units 1+2, and three of them were Unit 1 materials questions:

| Dec-2020 | Question | Topic |
|:--|:--|:--|
| Q1a | What is steel? Types of steel with applications | 02 |
| Q1b | What is hardness? How to measure it | 08 |
| Q6a | Explain the iron-carbon diagram in brief | 03 |

**Memorise 02, 03 and 08 first.** They are recall and table work, not calculation, and between
them they cover most of the Unit 1 marks. The only genuine numerals in the unit are in **06**
(tensile test), **07** (Hooke's law) and the lever rule in **03**.

## Page contract

Every topic page in this folder carries, in order:

`zevu-header` → `tab-bar` (Lesson / Cheat-Sheet / Questionnaire) → `#lesson` → `#cheatsheet` →
`#questionnaire` → `zevu-footer` → the two canonical scripts.

Each topic page contains 5 MCQs, a PYQ drill (set A theory + set B recall), deep numerals with
three worked cases, and an ASCII diagram in the lesson body and at least three in the
questionnaire.

Check a page against the contract before calling it done:

```bash
python3 tools/build-note-page.py 02-cast-iron-carbon-steels "Title &mdash; Here" 02-cast-iron-carbon-steels.md
python3 tools/check-diagrams.py
python3 tools/sync-web.py && python3 tools/check-web.py
```

## Rebuilding a topic page

The `<style>` block and the two scripts are byte-identical on every page and are held once in
`tools/build-bt203-page.py`'s scaffold, so a page cannot drift from the house style. To edit a
topic, edit the page directly if the change is prose; if it is a structural change, rebuild from
the body so the scaffolding stays identical.

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
- Official reference books: C. M. Agrawal, *Basic Mechanical Engineering*, Wiley (primary for
  Unit 1); Nakra & Chaudhary, *Instrumentation and Measurements*, TMH (Unit 2)