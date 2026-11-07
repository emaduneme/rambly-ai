# Design check (spec section 3.1)

Checked 2026-10-22 on `/`, the step 2 panel, `/confirmed` and `/privacy`, at 375×667 and 1440×900.

## Automated

| Check | Result |
|---|---|
| Lighthouse `/` (mobile) | Performance 95, Accessibility 100, Best practices 100, SEO 100 after adding `robots.txt` |
| Lighthouse `/privacy` | Accessibility 100, SEO 100 |
| Lighthouse `/confirmed` | Accessibility 100. SEO flags "not crawlable", which is intended (`noindex`) |
| Above the fold at 375×667 | Headline, subheadline, email field and button visible; button bottom at 536px |
| Horizontal scroll at 375px | None (page width 375) |

## Gestalt principles

| Principle | Result |
|---|---|
| Figure-ground | Pass. The gradient appears only on the primary buttons and the logo; the form is the strongest element above the fold. |
| Proximity | Pass. Inside groups 8–16px, between groups 48px, between sections 96px; all from the token scale. |
| Similarity | Pass. One primary button style; the three objections and the three steps each share one format; choices share one pill style. |
| Common region | Pass. Form fields and button share one region; step 2 is one card; each FAQ item is its own box. |
| Continuity | Pass. Phones read top to bottom in one column; desktop hero is text and form left, video right, then one column. |
| Closure | Pass. Used only in the logo mark. |
| Focal point | Pass. One per screen: the call to action above the fold, then section titles. |
| Prägnanz | Pass. No background patterns or decorative icons; borders only where they mark a region. |
| Symmetry and order | Pass. Every section shares the same max width, side padding and left edge. |

## Core design principles

| Principle | Result |
|---|---|
| Visual hierarchy | Pass. Hero (serif, 38–64px), lead (20px), body (17px); two typefaces. |
| Contrast and accessibility | Pass. Lighthouse contrast audit clean; button uses `#4F46E5`→`#7C3AED` behind white text; visible focus outline; real labels on every field. |
| Alignment | Pass. Shared left edge across header, sections and footer. |
| White space | Pass. 96px between sections, 48px hero gap. |
| Consistency | Pass. One radius (12px) for controls and cards, one button style, one link style, across all pages. |
| Hick's law | Pass. One action per screen; no navigation menu. |
| Fitts's law | Pass after fix. All buttons, inputs, choices and FAQ summaries are 48px tall. Fixed: footer "Privacy" link was 23px tall, now 48px. Links inside sentences ("Read the study", "Waitlist privacy") stay inline, which WCAG 2.5.8 allows. |
| Readability | Pass. Body 17px, line height 1.6, text columns capped at 65 characters. |
| Motion | Pass. Only a small hover change on buttons and the play icon; all motion is turned off under "reduce motion". |

## Keyboard

Every control is a native link, button, input or `<details>`, so all are reachable by Tab with the visible focus outline. A "Skip to signup" link appears on first Tab. After signup, focus moves to the first step 2 question; status messages are announced through `role="status"`.

## Not yet checked

- The full live signup with real Kit (plan Task 11 step 5), after the Kit setup.
- The final demo video and Open Graph image (`/og-image.png` doesn't exist yet).
