# Rambly waitlist page

A one-page waitlist site for Rambly. It's a separate Vercel project from the app and shares no code with it. Why it exists and what it must do: [the spec](../docs/superpowers/specs/2026-10-22-waitlist-landing-page-design.md). How it was built: [the plan](../docs/superpowers/plans/2026-10-22-waitlist-landing-page.md).

## What's here

| Path | What it is |
|---|---|
| `index.html` | The waitlist page |
| `confirmed.html` | Where Kit sends people after they confirm their email (`/confirmed`) |
| `privacy.html` | Waitlist privacy page (`/privacy`) |
| `src/` | Browser code: signup form, step 2 questions, video, analytics |
| `api/subscribe.ts` | The serverless function that sends signups to Kit |
| `api/_lib/` | Token, validation, rate limit and Kit client used by the function |
| `COPY-OPTIONS.md` | Headline and subheadline options to pick from |

## Run it locally

```bash
npm install
npm run dev        # the page only, at http://localhost:5173
npx vercel dev     # the page and /api/subscribe together (needs the env vars below)
npm test           # unit tests
npm run build      # production build into dist/
```

## Deploy

Create a new Vercel project from this repo with **Root Directory** set to `landing`. Vercel detects Vite. Add these environment variables:

| Variable | Where the value comes from |
|---|---|
| `KIT_API_KEY` | Kit → Settings → Developer → API key (v4) |
| `KIT_FORM_ID` | The number in the waitlist form's URL in Kit |
| `KIT_ROLE_TAGS` | JSON mapping each role to its Kit tag ID, e.g. `{"masters":1,"phd":2,"faculty":3,"staff_researcher":4,"other":5}`. Tag IDs are in the tag's URL in Kit. |
| `SIGNUP_TOKEN_SECRET` | Any long random string, e.g. the output of `openssl rand -hex 32` |
| `VITE_UMAMI_WEBSITE_ID` | Umami Cloud → your website → Website ID. Leave it out and no analytics load. |

## Kit setup

1. Create the waitlist form. Leave **Auto-confirm new subscribers** unchecked so double opt-in stays on.
2. In the form's confirmation email settings, set the redirect after confirming to `https://<your domain>/confirmed`.
3. Create these custom fields, with exactly these keys: `role`, `use_case`, `utm_source`, `utm_medium`, `utm_campaign`, `signup_date`.
4. Create one tag per role (Grad student (master's), Grad student (PhD), Faculty, Staff or researcher, Other) and put their IDs in `KIT_ROLE_TAGS`.
5. Rewrite the confirmation email so it also welcomes people in a few lines. Add your postal address to the email footer.

`scripts/kit-setup.mjs` creates the custom fields and role tags for you and prints the `KIT_ROLE_TAGS` value: `node --env-file=.env.local scripts/kit-setup.mjs`. How Kit's API behaves for signups is recorded in [KIT-CHECK.md](KIT-CHECK.md).

## Links to share

Give every channel its own link so the numbers can be split by source:

| Channel | Link ending |
|---|---|
| Reddit r/GradSchool | `?utm_source=reddit&utm_medium=post&utm_campaign=gradschool` |
| Reddit r/PhD | `?utm_source=reddit&utm_medium=post&utm_campaign=phd` |
| Facebook groups | `?utm_source=facebook&utm_medium=group&utm_campaign=<group>` |
| YouTube video | `?utm_source=youtube&utm_medium=video&utm_campaign=demo` |
| SEMO flyers | `?utm_source=semo&utm_medium=flyer&utm_campaign=<location>` |
| Personal network | `?utm_source=network&utm_medium=<platform>` |

## Email routine

Kit's free plan has no automations, so a few things are done by hand:

- **Weekly:** send one short welcome broadcast to people who confirmed that week, asking "What are you stuck writing right now?" Replies are research.
- **Every 2 to 4 weeks:** a short update to the whole list.
- **When the app is ready:** invite people in groups using the role tags, starting with the SEMO pilot.

## Weekly check

1. In Kit, export confirmed subscribers as CSV. Only confirmed subscribers count toward the goal.
2. Count them by `role`, `use_case` and `utm_source`.
3. In Umami, read visitors by UTM source for the same period.
4. Compare: signups ÷ visitors per source. The goal is 100+ confirmed signups at 10%+ conversion, mostly grad students or faculty.
