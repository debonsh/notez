# Mathematics — BT102 Mathematics-I

Reusable pattern for all subjects. Copy this folder structure for physics, BME, etc.

```
notes/mathematics/
  README.md          <- this file, subject overview + unit map
  unit1/             <- Unit 1 Calculus
    index.html       <- hub (was unit-1-calculus.html)
    01-rolles-theorem.html
    02-lagranges-mvt.html
    03-taylors-maclaurins.html
    04-maxima-minima.html
    README.md        <- unit order + PYQ weightage
  unit2/             <- next: sequences / series / vector spaces
    index.html
    01-*.html
  unit3/ ...
```

## Rules

1. `index.html` is always the hub. Topic files are `NN-slug.html` in exam order.
2. Hub links use relative `NN-*.html` only — keeps folder portable for WhatsApp sharing.
3. Each topic file is standalone: Lesson + Cheat-Sheet tabs + 5 MCQs + PYQ drill.
4. To clone for a new subject:
   ```bash
   mkdir -p notes/physics/unit1
   cp notes/mathematics/unit1/README.md notes/physics/unit1/README.md
   # then add index.html + NN-*.html
   ```

## Source

Consolidated from `ShareableThings/` (2026-09-21). Canonical location is now `notes/mathematics/unit1/`.
`lessons/0002-rolles-theorem.html` + `reference/rolles-theorem-reference.html` are legacy splits — merged into `01-rolles-theorem.html`.
