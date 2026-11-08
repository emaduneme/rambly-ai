# Rambly: instructions for Claude Code

Rambly turns spoken rambles into organized writing. You talk. Rambly transcribes it, removes the filler, and gives your own words back in order. One recording can fan out into several outputs: a cleaned note, action items, a calendar (.ics) file, and the raw transcript.

Owner: Emmanuel Maduneme. He is named in every copyright line and on the privacy page. Rambly is not a registered business yet.

## Read these first

| File | Read it when |
|---|---|
| `docs/BRAND.md` | Any change to UI, colour, type, logo, copy or the background |
| `docs/HANDOFF-2026-11-rebrand.md` | You need context on the November 2026 rebrand and its open items |
| `landing/CLAUDE.md` | Any work inside `landing/` |
| `landing/DEMO.md` | Any change to the interactive demo (`landing/src/demo.ts`) |

## Two separate projects in one repo

They share no code. Each one deploys as its own Vercel project.

| Folder | What it is | Stack | Dev URL |
|---|---|---|---|
| `/` (root) | The Rambly app | React 19, TypeScript, Tailwind v4, Framer Motion, Vite 6 | `npm run dev` → http://localhost:3000 |
| `landing/` | The waitlist page | Plain HTML + TypeScript, Tailwind v4, Vite 6, Vitest | `cd landing && npm run dev` → http://localhost:5173 |

### App (root)

- `src/App.tsx`: screens and state. `src/components/`: Landing, Header, Footer (record button), NoteArea, Library, ContextSelector.
- `src/hooks/useAudioRecorder.ts`: browser recording.
- `src/lib/`: `gemini.ts` (client calls), `storage.ts` (local library), `contexts.ts` (writing contexts).
- `api/transcribe.ts`: audio to text with Gemini (`gemini-2.5-flash`). Needs `GEMINI_API_KEY`.
- `api/process.ts`: text cleanup through OpenRouter (`google/gemma-3-27b-it`). Needs `OPENROUTER_API_KEY`.

### Waitlist page (`landing/`)

- `index.html` (home), `confirmed.html`, `privacy.html`.
- `src/form.ts` (signup + optional step 2), `src/demo.ts` (interactive demo), `src/analytics.ts` (Umami), `src/utm.ts`.
- `api/subscribe.ts` + `api/_lib/`: sends signups to Kit. Env vars are listed in `landing/README.md`.

## Commands

```bash
# App
npm install
npm run dev          # http://localhost:3000
npm run lint         # tsc --noEmit (the app's only check)
npm run build

# Waitlist page
cd landing
npm install
npm run dev          # http://localhost:5173
npm test             # vitest, 84 tests at the time of writing
npm run typecheck
npm run build
```

Run `/check` to do all of the above in one go.

## Rules for every change

1. **Check before you say it is done.** Run `/check`. For any visual change, also look at the result (`/screenshot`). A passing build does not prove a page looks right.
2. **Follow `docs/BRAND.md`.** Black and white plus one accent (Mauve `#8C5A86`). Geist and Geist Mono only. No gradients, no new colours, no new fonts without asking Emmanuel.
3. **Less text.** The product promise is "less text". Do not add sections, paragraphs or explanations to the waitlist page unless Emmanuel asks. When in doubt, cut.
4. **Never commit secrets.** `.env` and `.env.*` are ignored, except `.env.example`. Never read or print real keys.
5. **Keep the form hooks stable.** The `data-*` attributes and the `name`/`value` pairs in `landing/index.html` feed Kit and the tests. Change labels freely; do not change values.
6. **Branches.** Work on a branch, never directly on `main`. Commit with clear messages. Push or open a PR only when Emmanuel asks.

## How Emmanuel likes to work

- Short, direct answers. Plain language. Short sentences. No em dashes.
- Information broken out into small pieces, not dense paragraphs.
- Push back only when something is clearly wrong or risky. Frame doubts as questions a quick test could answer.
- When he asks for a design choice (colour, logo, layout), show 2 to 4 options visually and let him pick.
- Ask before big or hard-to-undo changes. Small fixes: just do them and say what you did.

## Known gaps (do not "fix" silently, ask first)

- The app's start page (`src/components/Landing.tsx`) still has the longer copy. The waitlist page was trimmed; the app page was not.
