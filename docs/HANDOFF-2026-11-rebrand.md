# Handoff: Rambly rebrand, November 2026

Branch: `black-white-rebrand`. Base: `main` at `09aff09` (waitlist landing page, PR #1).
Work done with Claude on 6 to 7 November 2026, directed by Emmanuel.

Use this file to pick up the work in Claude Code. The rules that last beyond this round live in `docs/BRAND.md` and `CLAUDE.md`.

---

## 1. Goal

Make Rambly look calm, modern and quiet, and match the product promise: **less text**.

- Black and white, plus one accent colour.
- A new logo that says "messy talk in, clean lines out".
- A modern, tech-friendly font.
- A waitlist page with as few words as possible.
- An interactive demo in place of the YouTube video.
- A faint "net" texture behind every page.

---

## 2. What changed, in order

| Commit | Change |
|---|---|
| `8aee5f1` | Indigo/violet removed from app and waitlist page. Black, white and neutral greys. New "ramble to lines" logo in headers and favicons. Checkerboard background (later replaced). |
| `bf1e976` | Waitlist page cut by about 80%: removed objections, "why talking works", FAQ and the repeat signup form. Shorter step-2 labels (stored values unchanged). |
| `a560d83` | Fonts: Plus Jakarta Sans + Georgia replaced by Geist + Geist Mono, on all pages. Step markers made quieter so the button is the one focal point. |
| `48fa0df` | Mauve `#8C5A86` added as the single accent: primary buttons, the last word of each headline, record button, selected chips, focus ring. |
| `cd5e85b` | YouTube video replaced with an interactive one-shape demo (`landing/src/demo.ts`). Step numbers removed. Subtitle shortened to "Say it. Rambly writes it down." Video code and its test removed, 4 demo tests added. |
| `c048784` | Checkerboard replaced with a faint full-page hairline grid (the "net"). |
| `574b100` | Three-step strip ("Talk / Rambly organizes / You edit") removed. Copyright changed to "© 2026 Rearguard Online" on all pages. |
| (this commit) | Claude Code setup: `CLAUDE.md` files, brand guide, demo spec, this handoff, `.claude/` commands and agent, `.env.example` files. |

### Decisions Emmanuel made

| Question | Choice | Rejected |
|---|---|---|
| Logo | A: "Ramble to lines" | B: pixel "R" on a checker grid. C: looping lowercase "r" |
| Accent colour | Mauve `#8C5A86` ("a bit feminine, not too feminine") | Rosewood `#B4475F`, Clay `#B5543C`, Sage `#4F6F5A` |
| Font | Geist + Geist Mono (Claude's pick after "the font is trash") | Plus Jakarta Sans, Georgia |
| Background | Faint net across the whole page | Faded checkerboard |
| Demo | Interactive, built from the awesome-opus5-5-videos "one shape" prompt | YouTube embed |
| Copy | As short as possible | All longer sections |

---

## 3. File map (what to touch for what)

| To change | Edit |
|---|---|
| Colours, fonts, spacing (waitlist) | `landing/src/styles.css` `@theme` block |
| Colours, fonts (app) | `src/index.css` `@theme` block, plus Tailwind classes in `src/components/*.tsx` |
| Background net | `body::before` in `src/index.css` and `landing/src/styles.css` |
| Logo | `public/rambly-mark.svg`, `public/favicon.svg`, the same two in `landing/public/`, and the inline SVG in `src/components/Header.tsx`, `src/components/Landing.tsx`, `landing/index.html`, `landing/confirmed.html`, `landing/privacy.html` (4 SVG files and 5 inline copies) |
| Waitlist copy | `landing/index.html` |
| Demo | `landing/src/demo.ts` (+ `.demo-*` styles). See `landing/DEMO.md` |
| App start page | `src/components/Landing.tsx` |

Reference images: `docs/brand/` (logo concepts, waitlist page, demo frames, app start page).

---

## 4. Open items

Ask Emmanuel before doing these. Do not guess.

1. ~~**Contact email.**~~ Done: `rearguardonline@gmail.com` (PR #3).
2. **Privacy page owner.** `landing/privacy.html` says "Rambly is run by Emmanuel Maduneme", while the copyright says Rearguard Online. Should they match?
3. **App start page copy.** `src/components/Landing.tsx` still says "Turn messy thoughts into polished notes with Rambly." plus a longer sentence. Trim to match the waitlist page?
4. **Demo text on phones.** About 9px on a 390px-wide screen. Check with real people. Enlarge if needed.
5. **Privacy reassurance.** The FAQ line about recordings was removed with the FAQ. Add one short line under the button if testers ask.
6. **OG image.** `landing/index.html` points to `/og-image.png`, which does not exist yet. Make one in the new style (black, white, Mauve, logo, headline).
7. **Logo files for other uses.** Only SVGs exist. Still needed: PNG sizes, `favicon.ico`, Apple touch icon, a wordmark lockup, social avatar.
8. **README screenshot.** `public/rambly-git-readme image.png` still shows the old indigo look.
9. **Trademark.** No trademark search was done on the mark or the name.
10. ~~**Dark mode.**~~ Done for the waitlist page: follows the device (PR #3). The app has no dark variant yet.
11. ~~**Push and PR.**~~ Done: merged in PR #3.

---

## 5. How to verify

```bash
# from the repo root
npm install && npm run lint && npm run build
cd landing && npm install && npm test && npm run typecheck && npm run build
```

Expected: no type errors, 84 tests passing in `landing/`.

Then look at:

- Waitlist page at 1440×900 and 390×844. One Mauve button, Mauve "head.", faint grid, demo on the right (below on phones).
- `/#demo=0.5`, `/#demo=4`, `/#demo=7`, `/#demo=9`, `/#demo=11.5`, `/#demo=13`: Record, recording, loader, note, actions with tick, toast.
- The app at `/`: black logo tile, Mauve "Rambly." and Get Started, faint grid.
- Turn on "reduce motion" in the OS: the demo should start paused on the note.

Or run `/check`, then `/screenshot`.
