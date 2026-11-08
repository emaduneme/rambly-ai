# Rambly brand and design system

Version 1, November 2026. Applies to the app (repo root) and the waitlist page (`landing/`).

The idea in one line: **messy talk in, clean lines out.** Every visual choice should support that. Calm, quiet, plenty of space, very little text.

---

## 1. Logo

### The mark: "Ramble to lines"

A wavy line at the top settles into three straight lines of text below it. The wave is the ramble. The lines are the organized note.

- Master file: `public/rambly-mark.svg` (also `landing/public/rambly-mark.svg`).
- Favicon / app icon: `public/favicon.svg` (also `landing/public/favicon.svg`): white mark on a black rounded square.

Geometry (viewBox `0 0 256 256`, round caps, no fill):

| Part | Path | Stroke |
|---|---|---|
| Wave | `M44 72 C66 36 98 36 120 72 S174 108 196 72 C202 62 207 56 212 52` | 24 |
| Line 1 | `M44 132 H212` | 24 |
| Line 2 | `M44 180 H212` | 24 |
| Line 3 (short) | `M44 228 H140` | 24 |

Inline use in headers: the same paths, `stroke="white"`, `stroke-width="28"`, rendered at 20px inside a 36 to 40px black tile with 12px radius.

Favicon: tile `rx="56"` in `#0A0A0A`, mark scaled by 0.78 and offset (28, 22), stroke 30, white.

### Rules

- Black or white only. Never colour the mark Mauve. Never add gradients or shadows.
- Keep the short third line. Without it the mark reads as the "≅" math sign.
- Minimum size: 16px (favicon). Below 24px, use the tile version.
- Clear space: at least the height of one line gap (about 20% of the mark) on every side.
- Wordmark: "Rambly" in Geist SemiBold/Bold, set next to the tile. There is no custom wordmark yet.

The two rejected concepts were a pixel "R" on a checker grid and a looping lowercase "r".

---

## 2. Colour

Black and white plus **one** accent.

| Role | Hex | Use |
|---|---|---|
| Ink | `#0A0A0A` | Text, logo tile, secondary buttons |
| White | `#FFFFFF` | Page and card backgrounds |
| Muted | `#525252` | Supporting text |
| Line | `#E5E5E5` | Borders and dividers |
| Demo stage | `#F5F5F4` | Background of the demo frame only |
| **Accent (Mauve)** | `#8C5A86` | The one action on screen, and one highlighted word |
| Accent hover | `#774B72` | Hover state of accent buttons (app) |
| Accent tint | `#F1E8F0` | Selected chip background |
| Error | `#B42318` | Errors and destructive actions only |

Contrast: white on Mauve is 5.35:1 (passes WCAG AA for normal text).

### The accent rule (pre-attentive attributes)

Colour is the strongest signal the eye picks up before reading. If it is everywhere, it signals nothing. So Mauve marks **only**:

1. The primary action (Get early access, Get Started, the record button).
2. One word in the headline.
3. Selected state (chips, active tab underline, ticked box, focus outline).

Everything else stays black, grey or white. One solid filled element per view is the target.

Red stays on Delete because it means "this can't be undone". Do not use red decoratively.

### Dark scheme (waitlist page)

The waitlist page follows the device setting. Mauve and white do not change. The demo stays a light screen in both.

| Name | Light | Dark |
|---|---|---|
| Background | `#FFFFFF` | `#0A0A0A` |
| Surface (fields, chips) | `#FFFFFF` | `#141414` |
| Ink | `#0A0A0A` | `#FFFFFF` |
| Muted | `#525252` | `#A3A3A3` |
| Line | `#E5E5E5` | `#262626` |
| Accent tint | `#F1E8F0` | `#2A1D29` |
| Error | `#B42318` | `#F97066` |
| Net | black at 0.035 | white at 0.04 |

Mauve on black is 3.7:1. Use it for the large headline word only, never for small text.

---

## 3. Type

| Font | Weights | Use |
|---|---|---|
| **Geist** | 400, 500, 600, 700 | Everything |
| **Geist Mono** | 400, 500 | Timers, small labels, data (demo timer, due dates) |

Loaded from Google Fonts. No serif. Plus Jakarta Sans, Georgia and Inter are retired.

- Headlines: Geist 600, tight tracking (`tracking-tight`), line height about 1.08.
- Body: Geist 400, 17px, line height 1.6, max about 65 characters per line.
- Sentence case everywhere. No Title Case on buttons.

---

## 4. Background: the net

A faint hairline grid behind every page, fixed while the page scrolls.

```css
body::before {
  content: ""; position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image:
    linear-gradient(rgba(10, 10, 10, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 10, 10, 0.035) 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: -1px -1px;
}
```

It should be visible only when you look for it. Tune with the alpha (`0.035`) and the cell size (`24px`). Do not let `body` or `html` paint an opaque background above it, or it disappears. In the waitlist page, `html` holds the white background and `body` has none.

The earlier checkerboard was removed.

---

## 5. Layout principles (Gestalt)

- **Proximity.** Things that belong together sit close (8 to 16px). Groups sit apart (48px). Sections sit far apart (96px).
- **Figure and ground.** One focal point per screen. On the waitlist page it is the email + button.
- **Similarity.** One button style for primary actions, one for secondary. One radius (12px) for controls and cards.
- **Alignment.** Header, hero and footer share one left edge and one max width (`max-w-5xl`).
- **Prägnanz (simplicity).** If a section can go, it goes.

---

## 6. Voice and copy

- As few words as possible. The product's promise is less text.
- Short sentences. Plain words. Active voice.
- Talk to the reader as "you". The product never says "I".
- No exclamation marks, no "simply", "just", "easy", "seamless", "unlock".
- No em dashes.

Current lines:

| Where | Copy |
|---|---|
| Headline | Your first draft is already in your head. |
| Subtitle | Say it. Rambly writes it down. |
| Button | Get early access |
| Step 2 title | Optional: two taps |
| Copyright | © 2026 Emmanuel Maduneme |

---

## 7. Motion

- Springs with a tiny overshoot at most. No bouncy easing.
- Content swaps with a short fade and blur, never a hard cut.
- Respect `prefers-reduced-motion`: stop loops and show a still, meaningful frame.
- Full rules for the product demo: `landing/DEMO.md`.

---

## 8. Do and don't

| Do | Don't |
|---|---|
| One Mauve element that matters per screen | Mauve on icons, borders or decoration |
| Black logo tile | Coloured or gradient logo |
| Geist everywhere | A second sans or a serif |
| Cut a sentence | Add a section to "explain" |
| Faint net background | Heavier patterns, textures or gradients |
