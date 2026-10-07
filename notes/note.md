# note.md — how to build notes so every unit looks identical

Read this before creating ANY new topic file. Goal: consistent result across subjects.

## 1. Folder structure (never deviate)

```
notes/
  README.md              <- main index, declares notes/ canonical
  note.md                <- this file (style + fetching guide)
  <subject>/             <- e.g. mathematics, physics
    README.md            <- subject map: units + order + source
    unit<N>/             <- e.g. unit1
      index.html         <- hub: topic cards + Resources tab (ALWAYS named index.html)
      NN-slug.html       <- topics in exam/syllabus order, NN = 01, 02, ...
      README.md          <- unit order + weightage + verified-resource list
```

Rules:
- Hub links are relative `NN-*.html` only — folder must work from WhatsApp share / file:// with no server.
- `NN` follows syllabus or exam-priority order, decided once in unit README, never reordered later.
- One topic at a time: finish NN fully before starting NN+1. Mark hub card `queued` → `done` + add link when finished.
- Never create study HTML outside `notes/`. `ShareableThings/`, `lessons/`, `reference/` are legacy.

## 2. Page style (copy-paste contract)

- Base template: copy `notes/mathematics/unit1/04-maxima-minima.html` head/CSS/JS, or physics `01-wave-nature-debroglie.html` (newer — has quiz-feedback fix).
- CSS tokens (do not restyle per file): `--ink #e6e3dc`, `--ink-soft #a29d92`, `--paper #14161b`, `--accent #e0a370`, `--accent-soft #26201a`, `--rule #2b2e36`, `--code-bg #1b1e25`, `--good/#bad` for quiz states. Serif body (Georgia), mono for code/prompts, `46rem` column.
- Required blocks per topic file, in order:
  1. `.zevu-header` — `zevu:~/learn/<code>/unit<N> $ cat NN-slug.md`
  2. `.tab-bar` — Lesson (active) + Cheat-Sheet buttons, `showTab()` engine
  3. `#lesson` — kicker, h1, intro `<em>`, then sections (see §3)
  4. `#cheatsheet` — statement, derivation steps, formula table, definitions, checklist, numeral shortcut
  5. `.zevu-footer` — `# shared via zevu · built with ART`
  6. `<script>` — tab engine + quiz engine WITH null-guard on `.feedback` (old maths files lack `<p class="feedback">` and throw on click — always include it)
- Components: `.topic-card` (hub only), `.callout > .label` (tips, traps, sources), `.quiz[data-answer][data-explain]` + 4 `button[data-key]` + `<p class="feedback">`, `.terminal-diagram` for ASCII sketches, inline `<svg>` diagrams (dark bg `#1b1e25`, accent stroke — one per topic file, subject-specific, never cross-subject), tables for steps/formulas.
- Hub extras: `formula-sheet.html` (printable, linked from hub + PYQ map), `PYQ map` table (topic → in-file drill → archive), `Progress` checkboxes persisted via `localStorage` (per-hub key), physics hub also carries `Viva + lab` section.
- Topic-card topic-links line states completion: `queued` vs `Lesson + Cheat-Sheet + 5 MCQs + PYQs + deep numerals + extra-marks tips — done`.

## 3. Lesson anatomy (every topic file)

1. Intro `<em>` — hook + what RGPV asks (1–2 lines).
2. Concept sections — statement verbatim in `<pre><code>`, then short derivation, no skipped algebra.
3. `Numericals in great depth` — formula identifier table, 5-line answer format (Given/Find/Formula/Solve/Check), 2–3 Solved A/B/C with full unit handling, sanity check per answer.
4. `Numeral traps` callout — unit conversions (g→kg, Å↔nm), scope limits (e.g. shortcut electrons-only), √ handling, no-unit penalty.
5. `Special lines for extra marks` callout — 3–4 copy-paste examiner lines + "Hence proved" / boxed-answer rule.
6. `Exam tips` callout — statement-first, diagram, underline/box, method marks, significance line.
7. `Retrieval practice` — exactly 5 MCQs (cover: statement, formula, trap, proof/evidence, distinction).
8. `PYQ drill` — Drill set A theory (with session tags) + Drill set B numerals (with answers).
9. Sources — Primary source + More PYQs callouts with verified links (same URLs as hub Resources tab).

## 4. Fetching resources (verify, don't just link)

1. `websearch` first: `<code> <subject> Unit N <topic> syllabus`, `RGPV <code> previous year papers`, `<topic> best notes PDF`, `<topic> derivation YouTube engineering`.
2. `webfetch` every candidate before linking — record status. Known-good: `rgpv.ac.in` scheme PDFs, `lnct.ac.in` unit PDFs, `rgpvnotes.in` unit hubs (OneDrive+Dropbox mirrors), `career-shiksha.com` PYQ archives, `rgpvonline.com` session PDFs, YouTube only if >100K views or NPTEL/IIT. Known-flaky: `primeupdate.org` (down 2026-09-21 — link but flag retry).
3. Hub Resources tab groups: Official syllabus → Subject notes → PYQ papers → Videos → frequency table → blueprint callout. Every external link re-checked with `grep href` + count before marking done.
4. Numerals cross-checked with `python3 -c` (e.g. 1.227/√V) — never trust mental math.

## 5. Done checklist (topic is NOT done until all pass)

- [ ] 5 quizzes × (`data-answer` + `data-explain` + 4 buttons + `<p class="feedback">`), JS null-guarded
- [ ] Cheat-sheet has statement + steps + table + definitions + checklist + numeral shortcut
- [ ] ≥2 fully-worked numerals with Given/Formula/Solve/Check + traps + special lines + tips callouts
- [ ] Hub card linked (`href="NN-*.html"` target exists), card status flipped to done
- [ ] `formula-sheet.html` updated with the new topic's formulas; hub PYQ map row added
- [ ] Inline SVG diagram present (subject-specific); progress tracker lists the new file
- [ ] Unit README order list updated, no stale NEXT/queued labels
- [ ] Print check: tabs force-show via `@media print`, no JS-only content

## 6. Cloning for a new subject/unit

```bash
mkdir -p notes/<subject>/unit<N>
cp notes/physics/unit1/01-wave-nature-debroglie.html notes/<subject>/unit<N>/01-first-topic.html
# rewrite Lesson + Cheat-Sheet, keep CSS/JS untouched
# add hub index.html (copy notes/physics/unit1/index.html, replace cards + resources)
# update both READMEs + hub links, run Done checklist
```
