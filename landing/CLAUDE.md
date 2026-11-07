# Waitlist page: instructions for Claude Code

This folder is the Rambly waitlist site. It is a separate Vercel project (Root Directory = `landing`). Read the root `CLAUDE.md` and `docs/BRAND.md` first.

## The page today

One screen, top to bottom:

1. Header: logo tile + "Rambly".
2. Headline: "Your first draft is already in your **head.**" (the last word is Mauve).
3. Subtitle: "Say it. Rambly writes it down."
4. Email field + "Get early access" button (Mauve).
5. Interactive demo on the right (below the form on phones). See `DEMO.md`.
6. Footer: Privacy link, contact placeholder, "© 2026 Rearguard Online".

After signup, the form is replaced by the optional step 2 panel ("Optional: two taps") with role and use-case chips.

Keep it this short. Emmanuel removed the objections, "why talking works", FAQ, repeat CTA and the three-step strip on purpose.

## Design tokens

All tokens live in `src/styles.css` inside `@theme`. Tailwind's default colours, spacing, radius and text sizes are switched off (`--color-*: initial` etc.), so only these utilities exist:

| Kind | Tokens |
|---|---|
| Colour | `bg` `surface` `ink` `muted` `line` `accent` `accent-tint` `error` `white` `transparent` |
| Spacing | `0` `1` (4px) `2` (8px) `4` (16px) `6` (24px) `12` (48px) `24` (96px) |
| Radius | `rounded-ui` (12px), `rounded-full` |
| Text | `text-small` `text-body` `text-lead` `text-title` `text-hero` |
| Font | `font-sans` (Geist), `font-mono` (Geist Mono) |

If a class like `p-3`, `text-gray-500` or `rounded-lg` does nothing, that is why. Use a token or add one on purpose.

## Accent rule

Mauve appears in exactly these places. Do not add more without asking:

- Submit buttons (`bg-accent`).
- The last word of the headline (`text-accent`).
- Selected step-2 chips (`.choice:has(:checked)`).
- Focus outline.
- Inside the demo: Record, Organize, the tab indicator, the ticked checkbox, the strike-through on filler words.

## Things the tests rely on

`tests/form.test.ts` loads `index.html` and checks the form. Keep:

- `form[data-signup]` (the first one is the main form), `#email`, the hidden `website` honeypot field.
- `[data-step2]`, `[data-step2-form]`, `[data-step2-status]`, `[data-step2-save]`, `[data-step2-skip]`, and a focusable `legend` (tabindex="-1") as the first legend in step 2.
- `[data-status]` inside each signup form.
- Radio `name`/`value` pairs: `role` = masters, phd, faculty, staff_researcher, other. `use_case` = drafting, ideas, teaching, personal, other. Kit tags and fields depend on these values.

`tests/demo.test.ts` checks the demo (spring maths, seamless loop, the state at each beat, accessible controls).

## Checks

```bash
npm test && npm run typecheck && npm run build
```

Then look at the page at 1440×900 and 390×844. Open `/#demo=9` to freeze the demo on a known frame.

## Deploy notes

- `vercel.json` sets `cleanUrls`, so `/privacy` and `/confirmed` work without `.html`.
- Env vars: `KIT_API_KEY`, `KIT_FORM_ID`, `KIT_ROLE_TAGS`, `SIGNUP_TOKEN_SECRET`, `VITE_UMAMI_WEBSITE_ID` (optional). Details in `README.md`. Copy `.env.example` to `.env.local` for `npx vercel dev`.
- Fonts load from Google Fonts (Geist, Geist Mono). If they fail, the page falls back to the system sans.
