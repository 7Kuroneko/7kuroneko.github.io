# The Kuroneko Company — Brand Guide

**Excellence.**
> "As each has received a gift, use it to serve one another, as good stewards of God's varied grace." — 1 Peter 4:10 (ESV)

## Logo
- **Cat mark**: pixel-bar black cat. Pure black (`#000000`) on night (`#0E0D0C`). Files: `logo/cat-black.svg`, `logo/cat-moon-eyes.svg` (glowing slit eyes, the hero/header version).
- **Wordmark**: "Kuroneko" in Geist Bold inside the ear-tab outline. Bone on dark (`wordmark-bone.svg`), ink on light (`wordmark-ink.svg`).
- Use the cat large. On the homepage it leads at up to 760px wide, with the wordmark beneath.
- Don't recolor the cat, add gradients, or stretch it. Eyes are always Moonlight red, slit style.

## Color
| Token | Hex | Use |
|---|---|---|
| Void | #000000 | The cat |
| Night | #0E0D0C | Page ground |
| Panel | #0A0908 | Inset panels |
| Rule | #24221F | Hairlines |
| Bone | #F2EFE8 | Primary text |
| Ash | #A8A39A | Body copy |
| Smoke | #8E8980 | Labels |
| Moonlight | #E8ECCC | Signal: eyes, light bars, numbers, CTAs |

Black on black is the default. Moonlight is the only accent and is used as light, not as fill.

## Type
- **Geist** 600 for headlines (tight tracking, -0.04em), 400 for body.
- **Geist Mono** for labels, numbers, sheet IDs: 11–12px, uppercase, +0.08em.

## Light bars
The signature effect. A thin bar with a pale core (`#FFFFF6`) and a moonlight glow (`--kn-glow`). It ignites on hover under nav links, footer links, index rows, and along each project sheet's edge and dimension line. Light bars always connect two real things; they never float or end in empty space.

## Project covers
Isometric "solid" scenes, black blocks on black, with moonlight light bars and glass enclosures. One scene per project that depicts the real thing (the actual campus, chip, rack, statue). Rules:
- Everything sits on something. No floating parts.
- Even spacing, equal margins, aligned corners.
- Glass boxes fully contain what's inside them.
- Light paths start and end at real components.
Regenerate with `tools/cover-generator.js`.

## Layout: Cross-section
Drawing-sheet layout: header (cat + wordmark, Index / About / Contact), hero cat, wordmark + verse, a compact **Drawing Index** tool (filters, cover tiles, readout), then one sheet per project (dimension line, FIG. number, 560px cover, spec column, title, description, CTA), footer with email.
