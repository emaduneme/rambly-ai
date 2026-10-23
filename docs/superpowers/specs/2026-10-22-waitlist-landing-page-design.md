# Rambly Waitlist Landing Page — Design Spec

**Date:** 2026-10-22
**Builds on:** [docs/landing-page-brief.md](../../landing-page-brief.md). The brief holds the research, the Hormozi structure, and the copy direction. This spec settles the brief's open questions and replaces its email setup (Listmonk, PikaPods, Resend) with Kit.

---

## 1. Why this exists

Rambly needs to find out whether people want it before more of the app gets built. The page is a waitlist: people give their email in exchange for early access, and that list becomes the signal.

**Success:** 100+ confirmed signups at a 10%+ visitor-to-signup rate, mostly grad students or faculty (brief, section 1). Only confirmed (double opt-in) subscribers count.

**Goals**
- A single fast page that a grad student understands without scrolling, on a phone and on desktop.
- Every signup lands in Kit with its role, use case, and traffic source, so the weekly check can be done from a Kit export plus analytics.
- Live quickly and cheaply. This is a test, not the product.

**Non-goals**
- No working app, sign-in, or link to the live app from the page (the app's API has no auth or rate limiting; brief 6.2).
- No AI model changes, no app fixes (brief, section 11).
- No pricing on the page.
- No referral "move up the line" mechanics. They inflate signups with people who want the game, not the tool, and muddy the test.
- No lead magnet in v1 (brief 4.5 stays optional for later).

**Anti-goals** (the page fails even if it works technically)
- It reads like "AI writes your paper for you." Positioning is always "talk through your ideas, get your own words back, organized."
- The copy sounds AI-written. This audience spots it and mocks it.
- It makes a claim the app can't back up: accuracy numbers, invented testimonials, or a privacy promise not yet true.

---

## 2. Decisions

| Question | Decision | Why |
|---|---|---|
| Email list | **Kit, free plan** | Up to 10,000 subscribers free. Includes forms, unlimited broadcasts, tags, custom fields, double opt-in, and API access. One hosted service replaces Listmonk + PikaPods + Resend + a server. The list can be exported any time. |
| Founding-member perk | **Early access plus a "founding member price". No number on the page.** | No evidence that a lifetime discount beats free months. Leaving the number out keeps the test about wanting the tool, not the deal. Set the actual discount only if the test passes. |
| Privacy | **The privacy page covers the email list only, plus one sentence about the future app.** | The waitlist collects no recordings. At launch the app sentence says only: "We'll publish Rambly's privacy policy for recordings before anyone gets access." That is true today, so launch doesn't wait on the provider check. A stronger promise ("never used for AI training") comes later, only after Groq's and the gpt-oss provider's data policies are checked (brief section 11), and never about today's Gemini setup. |
| Page build | **Small Vite build, Tailwind, no React** | Matches the repo's tooling, deploys to Vercel with a serverless function next to it, and avoids loading Tailwind from a CDN on a live site. |
| Hosting | **Its own Vercel project, built from a `landing/` folder in this repo** | Keeps it separate from the app while staying in one repo. Builder's call on exact Vercel settings. |

**Kit free plan limits that shape the design**
- **No automations or email sequences.** No welcome email goes out on its own after someone confirms. Section 5 works around this.
- Emails carry Kit branding.
- Only one user on the account.
- The paid Creator plan ($33/month billed yearly) adds automations. Not needed for the test.

---

## 3. The page

Follow the brief for structure and copy direction:
- **Above the fold:** brief 5.1, Hormozi layout 3 (headline, subheadline, demo video, one-line justification, email field, button, three objection bullets).
- **Objections, in order:** brief 5.2.
- **Below the fold:** brief 5.4 (how it works, why talking works, FAQ, repeat call to action, footer). No testimonials at launch.
- **Copy rules:** brief 5.5.

**Changes from the brief**
- **One-line justification:** "early access and a founding member price". No number.
- **Privacy objection bullet (5.2 #2) and privacy FAQ:** say the waitlist only stores the email and the answers people give. For the app, say only what is true at launch (see section 2).
- **Demo video:** the re-edited 30 to 60 second cut (brief, section 9) isn't made yet. Until it is, embed the existing video (`https://youtu.be/BzVev97bpjk`, already linked from `src/components/Landing.tsx`) and swap it later. Lazy-load the embed so the page stays fast.
- **Privacy page:** the builder drafts it. It covers: who runs the list (Emmanuel Maduneme), what's collected (email, role, use, traffic source, signup date), why (waitlist invites and occasional updates), that Kit stores it as the email provider, that it's kept until the person unsubscribes, that it's never sold, how to unsubscribe, and a contact address. The contact address is a placeholder until Emmanuel supplies one; launch waits on it.

**Copy:** the builder writes a first draft from the brief's directions, including 5 to 10 headline options. Emmanuel picks and edits before launch. One headline goes live; swap it by hand if the numbers say so. No A/B testing setup.

**Design:** carry over the app's look so the brand is consistent: off-white `#FAFAF8` background, `#1A1A2E` text, a serif headline, the indigo-to-violet gradient on the button and logo. Reference galleries for layout ideas: supahero.io (hero sections), land-book.com (full pages), socialproofexamples.com (social proof without users). Everything above the fold must fit at 375px wide.

---

## 4. Signup flow

**Step 1, on the page:** email only, plus a hidden honeypot field.

**Step 2, on the thank-you screen right after:** two optional questions (brief 5.3).
- Role: Grad student (master's), Grad student (PhD), Faculty, Staff or researcher, Other.
- Main use (pick one, so the weekly counts stay simple): Drafting papers or thesis chapters, Capturing research ideas, Teaching or lecture prep, Personal notes, Other.

Skipping step 2 still counts as a signup. Step 2 is only asked here; the page people land on after confirming their email just says they're in.

**Captured automatically:** `utm_source`, `utm_medium`, `utm_campaign`, the referrer, and the signup date.

**How it reaches Kit**

The page posts to `/api/subscribe`, a Vercel function in the landing project. The Kit API key lives only in Vercel environment variables (`KIT_API_KEY`, `KIT_FORM_ID`), never in the page.

1. Reject if the honeypot is filled. Apply a simple per-IP rate limit.
2. Create the subscriber: `POST https://api.kit.com/v4/subscribers` with `email_address` and `fields` (UTM values, signup date). This call upserts.
3. Add them to the waitlist form: `POST /v4/forms/{KIT_FORM_ID}/subscribers` with `email_address` and `referrer` (the landing URL with UTMs). The form has double opt-in on ("Auto-confirm new subscribers" unchecked).
4. Return a short-lived signed token (an HMAC of the email and a timestamp, using a `SIGNUP_TOKEN_SECRET` env var, valid about an hour).
5. Step 2 answers go to the same function with that token plus `role` and `use_case`. Without a valid token the request is rejected, so nobody can change someone else's answers or create subscribers outside the form. Update the fields and tag the subscriber with their role, so broadcasts can target grad students or faculty.

Auth header for all Kit calls: `X-Kit-Api-Key`.

**Must verify first, with real test signups, before building the rest.** This is the first build task and is blocked until Emmanuel has set up Kit (section 7, items 2 and 3). Test signups use Emmanuel's own addresses and get deleted from Kit afterwards.
- **Does adding a subscriber to a form through the API send the form's confirmation email?** Kit's docs don't say for the single-add endpoint. Also check that creating the subscriber first doesn't mark them as already confirmed (try `state: "inactive"` if it does). If the API route can't produce an unconfirmed subscriber who gets the confirmation email, the fallback is: the function itself (server-side, so the honeypot, rate limit and all step-1 fields stay) posts the email to Kit's own form endpoint, which sends the confirmation, then sets the fields through the API.
- Does the upsert in step 2 update `fields` on an existing subscriber, or only `first_name`? If only `first_name`, find Kit's update-subscriber call.
- Custom fields must already exist in Kit. Create `role`, `use_case`, `utm_source`, `utm_medium`, `utm_campaign`, and `signup_date` by hand once, before launch.

Spam: honeypot plus rate limit. Unconfirmed bot signups never count, because only confirmed subscribers are counted. Add Cloudflare Turnstile only if bots show up.

---

## 5. Emails (working around no automations)

1. **Confirmation email.** Rewrite Kit's default so it confirms the address and welcomes them in a few lines: what Rambly is, roughly when invites go out, and that a founding member price is coming. Must sound like Emmanuel, not like a template.
2. **After confirming, people go to the page's own "you're in" URL**, not Kit's default page, which can't be edited. That page is a plain confirmation; it doesn't ask the step 2 questions again.
3. **Weekly welcome broadcast.** Once a week, send one short broadcast to people who joined that week: a welcome note asking "What are you stuck writing right now?" Replies are research.
4. **Updates every 2 to 4 weeks** to the whole list, so people remember signing up.
5. **Invites in batches** when the app is ready, starting with the SEMO pilot. Use tags to pick each batch.

Every email needs an unsubscribe link (Kit adds it) and a physical mailing address in the footer (CAN-SPAM).

---

## 6. Measurement

- **Analytics:** a privacy-friendly tool that reports visitors by UTM source. Umami Cloud's free plan or Vercel Web Analytics. Builder's call; confirm the free tier shows UTM breakdowns.
- **UTM links** per channel, as in brief section 7.
- **Weekly check:** export confirmed subscribers from Kit, count by role, use case, and source, and compare with visitors per source from analytics.

---

## 7. Emmanuel's setup tasks (not code)

1. Choose and buy the domain.
2. Create the Kit account. Authenticate the sending domain in Kit (SPF, DKIM, DMARC) so emails don't land in spam.
3. Create the waitlist form with double opt-in, the custom fields, and the role tags.
4. Rewrite the confirmation email. Add the postal address to the email footer.
5. Give a contact email address for the privacy page and the postal address for the email footer.
6. Before giving anyone app access, check Groq's and the gpt-oss provider's data policies and publish the app's privacy policy.
7. Re-edit the demo video (brief, section 9).
8. Pick the headline from the draft options.

---

## 8. Left to the builder

- Folder layout inside `landing/`, Vercel project settings, and how the rate limit is stored.
- Exact page design within section 3's colors and structure.
- Placeholder video treatment.
- The analytics tool, within section 6.
- Error and loading states on the form (keep messages short and human).
