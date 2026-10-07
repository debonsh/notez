# Notes — MAIN study notes folder

All college subjects live here. This is canonical. Do not create study HTML outside `notes/`.

```
notes/
  README.md          <- this file
  note.md            <- the style guide: folder rules, page contract,
                        ASCII diagram standard, fetching guide, done checklist
  mathematics/       <- BT102 Mathematics-I
    README.md
    unit1/           <- Unit 1 Calculus (7 topic pages + formula sheet)
      index.html     <- hub: topic cards + PYQ map + Resources tab
      formula-sheet.html
      01-rolles-theorem.html ... 07-maxima-minima-three-variables.html
  physics/           <- BT201 Engineering Physics
    README.md
    unit1/           <- Unit 1 Quantum Mechanics (2 topic pages + formula sheet)
      index.html, formula-sheet.html, 01-*.html, 02-*.html
  bt203/             <- BT203 Basic Mechanical Engineering
    README.md
    midsem.html
    unit1/           <- Unit 1 Materials (8 topic pages + formula sheet) - complete
    unit2/           <- Unit 2 Measurement & Production (hub only, topics queued)
  bt204/             <- BT204 Basic Civil Engineering & Mechanics
    midsem.html      <- mid-sem plan only; unit notes not yet built
  bt205/             <- BT205 Basic Computer Engineering
    README.md
    unit1/           <- index.html + 01-06 + formula-sheet.html + README.md
    unit2/           <- index.html + 01-06 + formula-sheet.html + README.md
    midsem.html
```

Rules: `index.html` = hub, `NN-slug.html` = topics in syllabus/exam order, relative links only —
every folder must work from `file://` or a WhatsApp share with no server. Read `note.md` before
creating or editing any topic file; it is the contract, and this file is only the index of it.

`web/` is generated from this tree by `tools/sync-web.py` and is overwritten on every sync — never
edit anything under `web/` by hand.

Legacy source `ShareableThings/` is deprecated — canonical is `notes/`.