# BT204 Unit 1 — Building Materials & Construction

RGPV **BT-204 Basic Civil Engineering & Mechanics** (3L-0T-2P, 4 credits). Unit 1 of 5, and half the
mid-sem scope together with Unit 2.

Read `../../note.md` before editing anything in this folder — it is the style contract, and this
file is only the index of it.

## Order

Decided once, on 3 October 2026, in **mid-sem priority order** — by how often each topic appears in
the ten-paper corpus, not by the syllabus listing. Once set it is **never renumbered**, because
renumbering breaks bookmarks and the Progress `localStorage` keys.

| NN | File | Topic | Status |
|:--|:--|:--|:--|
| 01 | `01-building-materials.html` | Building materials: stones, bricks, cement and the workability of concrete | done |
| 02 | `02-building-stones.html` | Building stones: quarrying, dressing, deterioration, selection | queued |
| 03 | `03-bricks-cement.html` | Bricks and cement: manufacture, types, bonds, tests | queued |
| 04 | `04-concrete-construction.html` | Concrete: mixes, batching, placing, curing, tests | queued |
| 05 | `05-doors-windows-partitions.html` | Elements of building construction: foundations, walls, floors, doors, windows, staircases | queued |

Plus `index.html` (the hub) and a `formula-sheet.html` to be built once the unit is complete.

**Numbering is permanent.** A topic added later becomes `06-…`, never a re-order.

## Why 01 was built first

**Workability of concrete appeared in 6 of the 10 papers read for the battle plan** — the single
most-repeated question in BT-204. It is a definition plus a factor list with no calculation, so it is
also the cheapest 7 marks on the paper. Topic 01 therefore carries the full workability treatment
plus the materials survey around it, and it closes the highest-value question in the subject on its
own.

The remaining four topics are ordered by their own corpus counts: staircases (4), brick bonds (4),
then stones, doors and windows, concrete tests, cement, plastering and foundations at 3 each.

## Weightage and ROI

Unit 1 is nominally 20% of the BT-204 syllabus, but it is the **biggest block in the real paper**:
**25.7% of the marks asked across ten papers**, against 19.1% for Unit 2.

Almost all of it is recall — definitions, property tables and test names — with only the quantity
numerals needing arithmetic. **There are three numerals in the whole unit**: bricks for a wall,
cement content of a mix, and water from the water-cement ratio. Topic 01 carries all three.

## Figures that must not be confused

| Figure | Applies to | The trap |
|:--|:--|:--|
| **200 × 100 × 100 mm** | Brick, **nominal** size with the mortar joint | The moulded size is 190 × 90 × 90 mm. Using it overstates the brick count by ~30% |
| **under 20%** | Water absorption, good brick | Not the same figure as for stone |
| **under 5%** | Water absorption, good stone | The two are easily swapped |
| **30 min / 10 hours** | Initial / final setting time, OPC | Initial is the *minimum*, final is the *maximum* |
| **1.52** | Dry volume factor, concrete | Mortar uses 1.33 — different figure |
| **~400 kg/m³** | Cement content, M20 | The anchor that catches a missing dry factor |
| **1440 kg/m³** | Bulk density of cement | Needed to turn a volume into a mass |

And one conceptual trap that is asked often because it is counter-intuitive:

- **Gypsum RETARDS setting.** It is added to slow the set so the cement can be placed. It is not an
  accelerator.

## Page contract

Every topic page in this folder carries, in order:

`zevu-header` → `tab-bar` (Lesson / Cheat-Sheet / Questionnaire) → `#lesson` → `#cheatsheet` →
`#questionnaire` → `zevu-footer` → the two canonical scripts.

Each topic page contains 5 MCQs, a PYQ drill (set A theory + set B recall), deep numerals with three
worked cases, and an ASCII diagram in the lesson body and at least three in the questionnaire.

Check a page against the contract before calling it done:

```bash
python3 tools/build-note-page.py --subject=bt204 --unit=unit1 01-building-materials "Title &mdash; Here" 01-building-materials.md
python3 tools/check-diagrams.py
python3 tools/sync-web.py && python3 tools/check-web.py
```

## Rebuilding a topic page

The `<style>` block and the two scripts are byte-identical on every page in the repo and are held
once in `tools/note-scaffold/`. Topic bodies live in
`tools/note-scaffold/bt204/unit1/` — namespaced by subject and unit, so a bt204 topic 02 cannot read
bt203's topic 02.

**The title is only in the page.** It is passed as a build argument and stored nowhere else, so copy
the exact existing `<title>` out of the page you are about to rebuild rather than retyping it.

**Diagrams:** the checker models ASCII art as boxes, so a border row may only carry `+` at columns
with a `|` directly beneath. For a tree, use `+--` indentation — do not use a spanning bar with a
stem landing mid-bar.

## Verified resources

Every link in the hub Resources tab and in the topic Sources blocks was checked on
**28 September 2026**. Re-verify before adding anything new.

- Official syllabus and unit notes —
  <https://www.rgpvnotes.in/btech/grading-system-old/notes/2018/12/basic-civil-engineering-bt-204>
- Question-paper index —
  <https://www.rgpvnotes.in/btech/grading-system-old/qp/2018/12/basic-civil-engineering-bt-204>
- Reference books: B. C. Punmia, *Building Construction*, Laxmi (primary for Unit 1);
  S. K. Duggal, *Building Materials*, New Age International
