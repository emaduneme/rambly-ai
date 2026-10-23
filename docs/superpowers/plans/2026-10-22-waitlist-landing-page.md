# Rambly Waitlist Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A one-page waitlist site for Rambly that collects confirmed signups in Kit with role, use and traffic source, deployed as its own Vercel project.

**Architecture:** A self-contained `landing/` folder with its own `package.json`, built with Vite (no React) into static pages, plus one Vercel edge function, `landing/api/subscribe.ts`, that holds the Kit API key and talks to Kit. Small pure modules (token, validation, rate limit, Kit client) sit in `landing/api/_lib/` and are unit-tested with Vitest; the browser code (`landing/src/`) is plain TypeScript.

**Tech Stack:** Vite 6, Tailwind CSS 4 (`@tailwindcss/vite`), TypeScript 5.8, Vitest (with jsdom for browser code), Vercel edge functions, Kit API v4.

**Spec:** [docs/superpowers/specs/2026-10-22-waitlist-landing-page-design.md](../specs/2026-10-22-waitlist-landing-page-design.md), which builds on [docs/landing-page-brief.md](../../landing-page-brief.md). Read both before starting.

## Global Constraints

- Nothing in `landing/` imports from the app (`src/`, `api/` at the repo root). No link to the live app anywhere on the page.
- Secrets only in Vercel env vars, never in page code: `KIT_API_KEY`, `KIT_FORM_ID`, `KIT_ROLE_TAGS`, `SIGNUP_TOKEN_SECRET`.
- Kit auth header on every call: `X-Kit-Api-Key`. Base URL: `https://api.kit.com/v4`.
- Kit custom field keys (exact): `role`, `use_case`, `utm_source`, `utm_medium`, `utm_campaign`, `signup_date`.
- Role values → labels: `masters` "Grad student (master's)", `phd` "Grad student (PhD)", `faculty` "Faculty", `staff_researcher` "Staff or researcher", `other` "Other".
- Use values → labels (pick one): `drafting` "Drafting papers or thesis chapters", `ideas` "Capturing research ideas", `teaching` "Teaching or lecture prep", `personal` "Personal notes", `other` "Other".
- Copy: positioning is "talk through your ideas, get your own words back, organized". Never "AI writes your paper", "generate", "polish to perfection", "10x". No price, no testimonials, no accuracy numbers. One-line justification says "early access and a founding member price" with no number.
- App privacy sentence, exactly: "We'll publish Rambly's privacy policy for recordings before anyone gets access."
- Colors: background `#FAFAF8`, text `#1A1A2E`, accent gradient indigo `#4F46E5` → violet `#7C3AED` (the app's lighter `#6366F1` fails AA with white text; don't use it behind text). The gradient appears only on the primary button and the logo.
- Design: every rule in spec section 3.1 is a requirement. Spacing only from 4, 8, 16, 24, 48, 96px. One corner radius. At most two typefaces (a serif for headings, Plus Jakarta Sans for the rest). Body text ≥ 16px. Tap targets ≥ 44×44px. Text contrast WCAG AA (4.5:1 body, 3:1 large).
- Above the fold at 375×667: headline, subheadline, email field and button visible without scrolling.
- Commits are authored as Emmanuel Maduneme <culatemerald@gmail.com> with no Claude author, `Co-Authored-By` or `Claude-Session` lines: `git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit ...`.

## Review Focus

1. **Same email signs up twice** → the visitor sees the normal "check your inbox" result, no error; Kit is not asked to create a second subscriber. Test in Task 6.
2. **Email with spaces or capitals, or not an email** (`"  Ana@Uni.EDU "`, `"ana@"`) → trimmed and lowercased before Kit sees it; invalid ones get a short friendly message and never reach Kit. Tests in Tasks 4 and 6.
3. **Kit is down or returns an error** → the visitor sees "Something went wrong, please try again", never a fake success, and no token is issued. Test in Task 6.
4. **Step 2 sent with an expired, forged or missing token** → rejected with 401; the page tells them their answers didn't save but their signup still counts. Tests in Tasks 3 and 8.
5. **Double-click or repeated submit** → only one request goes out; the button is disabled while waiting. Test in Task 8.

---

### Task 1: Kit API check (blocked on Kit setup)

Blocked until Emmanuel has done spec section 7 items 2 and 3 (Kit account, sending domain, waitlist form with double opt-in, the six custom fields, one tag per role). Tasks 2 to 4 and 7 don't depend on this and can be done while waiting. Task 5 can't start until this is done.

**Files:**
- Create: `landing/scripts/kit-check.mjs`
- Create: `landing/KIT-CHECK.md` (results)

**Interfaces:**
- Produces: a decision recorded in `landing/KIT-CHECK.md`: `SIGNUP_MODE = "api"` or `"form"`, the exact working call for each of: create subscriber, add to form (or form post), update fields on an existing subscriber, tag by email.

- [ ] **Step 1: Write `kit-check.mjs`**, a Node script that reads `KIT_API_KEY` and `KIT_FORM_ID` from the environment, takes a test email as its argument, and prints every request and response. It runs, in order:
  1. `POST /v4/subscribers` with `{ email_address, state: "inactive", fields: { utm_source: "kit-check" } }`
  2. `POST /v4/forms/{KIT_FORM_ID}/subscribers` with `{ email_address, referrer: "https://example.com/?utm_source=kit-check" }`
  3. `GET /v4/subscribers?email_address=...` and print the `state`
  4. `POST /v4/subscribers` again with `{ email_address, fields: { role: "phd" } }`, then `GET` again and print `fields`

- [ ] **Step 2: Run it with one of Emmanuel's own addresses**

Run: `KIT_API_KEY=... KIT_FORM_ID=... node landing/scripts/kit-check.mjs <test-email>`
Expected: all calls return 2xx; record the state after step 3 and the fields after step 4.

- [ ] **Step 3: Check the inbox.** Did the form's confirmation email arrive? Click it and re-run the `GET`: did `state` become `active`?

- [ ] **Step 4: Decide the mode and record it in `KIT-CHECK.md`**
  - Confirmation email arrived and state went inactive → active: `SIGNUP_MODE = "api"`.
  - Otherwise: try posting the email server-side to the form's public subscribe URL (find the URL in the form's embed code in Kit) and repeat Step 3. If that sends the confirmation: `SIGNUP_MODE = "form"`, and record the exact URL and body.
  - If step 4 of the script didn't change `fields`, find Kit's update call (`PUT /v4/subscribers/{id}`) and record it.
  - Try `POST /v4/tags/{tag_id}/subscribers` with `{ email_address }` and record whether it works.

- [ ] **Step 5: Delete the test subscribers in Kit, then commit**

```bash
git add landing/scripts/kit-check.mjs landing/KIT-CHECK.md
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "chore(landing): record Kit API check results"
```

---

### Task 2: Scaffold the landing project and design tokens

**Files:**
- Create: `landing/package.json`, `landing/vite.config.ts`, `landing/tsconfig.json`, `landing/vitest.config.ts`, `landing/.gitignore`
- Create: `landing/index.html` (skeleton only), `landing/src/main.ts`, `landing/src/styles.css`
- Test: `landing/tests/smoke.test.ts`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `preview`, `test` (`vitest run`), `typecheck` (`tsc --noEmit`). Tailwind theme tokens in `styles.css` that every later page uses: colors `--color-bg #FAFAF8`, `--color-ink #1A1A2E`, `--color-muted` (a gray that passes 4.5:1 on `#FAFAF8`), `--color-accent-from #4F46E5`, `--color-accent-to #7C3AED`; spacing 4/8/16/24/48/96px; one radius; type scale with three hero levels; `--font-serif` and `--font-sans` (Plus Jakarta Sans).
- Vite multi-page build inputs: `index.html`, `confirmed.html`, `privacy.html` (the last two are created in Task 9; add them to `build.rollupOptions.input` then).

- [ ] **Step 1: Create the files.** Pin dependencies at the versions the app already uses (`vite ^6.2.0`, `tailwindcss ^4.2.1`, `@tailwindcss/vite ^4.2.1`, `typescript ~5.8.2`) plus `vitest` and `jsdom` (current stable 3.x and 25.x or later). `landing/.gitignore`: `node_modules/`, `dist/`, `.vercel`, `.env*`.

- [ ] **Step 2: Write `tests/smoke.test.ts`** asserting `1 + 1 === 2`, so the test runner is proven to work.

- [ ] **Step 3: Install and verify**

Run: `cd landing && npm install && npm test && npm run typecheck && npm run build`
Expected: 1 test passes, no type errors, `dist/index.html` exists.

- [ ] **Step 4: Commit**

```bash
git add landing
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "feat(landing): scaffold waitlist project and design tokens"
```

---

### Task 3: Signup token

**Files:**
- Create: `landing/api/_lib/token.ts`
- Test: `landing/tests/token.test.ts`

**Interfaces:**
- Produces:
  - `signToken(email: string, secret: string, nowMs?: number): Promise<string>`
  - `verifyToken(token: string, secret: string, nowMs?: number): Promise<string | null>` returns the email, or `null` if forged, malformed or older than `TOKEN_TTL_MS`
  - `TOKEN_TTL_MS = 60 * 60 * 1000`
- Format: `base64url(email) + "." + issuedAtMs + "." + base64url(HMAC-SHA256(secret, email + "." + issuedAtMs))`, using Web Crypto (`crypto.subtle`) so it runs on the edge runtime. Compare signatures in constant time.

- [ ] **Step 1: Write the failing tests**

```ts
test('round-trips an email', async () => {
  const t = await signToken('ana@uni.edu', 's3cret', 1_000);
  expect(await verifyToken(t, 's3cret', 1_000 + 60_000)).toBe('ana@uni.edu');
});
test('rejects after one hour', async () => {
  const t = await signToken('ana@uni.edu', 's3cret', 0);
  expect(await verifyToken(t, 's3cret', TOKEN_TTL_MS + 1)).toBeNull();
});
test('rejects a different secret', async () => {
  const t = await signToken('ana@uni.edu', 's3cret', 0);
  expect(await verifyToken(t, 'other', 0)).toBeNull();
});
test('rejects a swapped email', async () => {
  const [, ts, sig] = (await signToken('ana@uni.edu', 's3cret', 0)).split('.');
  const forged = `${btoa('eve@uni.edu').replace(/=+$/, '')}.${ts}.${sig}`;
  expect(await verifyToken(forged, 's3cret', 0)).toBeNull();
});
test.each(['', 'abc', 'a.b', 'a.b.c.d'])('rejects malformed %j', async (t) => {
  expect(await verifyToken(t, 's3cret', 0)).toBeNull();
});
```

- [ ] **Step 2: Run to see them fail**

Run: `cd landing && npx vitest run tests/token.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `token.ts`** to the interface above.

- [ ] **Step 4: Run to see them pass**

Run: `cd landing && npx vitest run tests/token.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add landing/api/_lib/token.ts landing/tests/token.test.ts
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "feat(landing): add signed step-2 token"
```

---

### Task 4: Validation and rate limit

**Files:**
- Create: `landing/api/_lib/validate.ts`, `landing/api/_lib/rateLimit.ts`
- Test: `landing/tests/validate.test.ts`, `landing/tests/rateLimit.test.ts`

**Interfaces:**
- Produces, in `validate.ts`:
  - `ROLES = ['masters','phd','faculty','staff_researcher','other'] as const`, `USES = ['drafting','ideas','teaching','personal','other'] as const`, types `Role`, `Use`
  - `type Utm = { utm_source: string; utm_medium: string; utm_campaign: string }` (missing values are `''`, each value trimmed and cut to 100 characters)
  - `type Step1 = { email: string; honeypot: boolean; utm: Utm; pageUrl: string }`
  - `type Step2 = { token: string; role: Role | null; useCase: Use | null }`
  - `normalizeEmail(raw: unknown): string | null`: trim, lowercase, max 254 characters, must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  - `parseRequest(body: unknown): { kind: 'step1'; data: Step1 } | { kind: 'step2'; data: Step2 } | { kind: 'invalid'; error: 'invalid_email' | 'invalid_request' }`. Step 1 body: `{ email, website, utm_source?, utm_medium?, utm_campaign?, page_url? }`. `website` is the honeypot (any non-empty value means bot). Step 2 body: `{ step: 2, token, role?, use_case? }`; unknown role or use values give `invalid_request`.
- Produces, in `rateLimit.ts`: `createRateLimiter(opts: { limit: number; windowMs: number }): (key: string, nowMs?: number) => boolean` returns `true` if allowed. In-memory `Map`; on the edge this resets per instance, which is acceptable for the test (spec section 4). The handler uses `limit: 5, windowMs: 10 * 60 * 1000` per IP.

- [ ] **Step 1: Write the failing tests**

```ts
// validate.test.ts
test('normalizes email', () => expect(normalizeEmail('  Ana@Uni.EDU ')).toBe('ana@uni.edu'));
test.each(['ana@', '@uni.edu', 'ana uni.edu', '', 42, null])('rejects %j', (v) =>
  expect(normalizeEmail(v)).toBeNull());
test('step1 with honeypot flags bot', () =>
  expect(parseRequest({ email: 'a@b.co', website: 'x' })).toMatchObject({ kind: 'step1', data: { honeypot: true } }));
test('step1 bad email', () =>
  expect(parseRequest({ email: 'nope' })).toEqual({ kind: 'invalid', error: 'invalid_email' }));
test('step1 utm defaults to empty strings', () =>
  expect(parseRequest({ email: 'a@b.co' })).toMatchObject({ data: { utm: { utm_source: '', utm_medium: '', utm_campaign: '' } } }));
test('step2 accepts known values and skips', () => {
  expect(parseRequest({ step: 2, token: 't', role: 'phd', use_case: 'drafting' }))
    .toEqual({ kind: 'step2', data: { token: 't', role: 'phd', useCase: 'drafting' } });
  expect(parseRequest({ step: 2, token: 't' }))
    .toEqual({ kind: 'step2', data: { token: 't', role: null, useCase: null } });
});
test('step2 rejects unknown role', () =>
  expect(parseRequest({ step: 2, token: 't', role: 'dean' })).toEqual({ kind: 'invalid', error: 'invalid_request' }));

// rateLimit.test.ts
test('allows 5 then blocks, per key, and resets after the window', () => {
  const allow = createRateLimiter({ limit: 5, windowMs: 1000 });
  for (let i = 0; i < 5; i++) expect(allow('1.1.1.1', 0)).toBe(true);
  expect(allow('1.1.1.1', 0)).toBe(false);
  expect(allow('2.2.2.2', 0)).toBe(true);
  expect(allow('1.1.1.1', 1001)).toBe(true);
});
```

- [ ] **Step 2: Run to see them fail**

Run: `cd landing && npx vitest run tests/validate.test.ts tests/rateLimit.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement both modules** to the interfaces above.

- [ ] **Step 4: Run to see them pass**

Run: `cd landing && npx vitest run tests/validate.test.ts tests/rateLimit.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add landing/api/_lib/validate.ts landing/api/_lib/rateLimit.ts landing/tests/validate.test.ts landing/tests/rateLimit.test.ts
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "feat(landing): add request validation and rate limit"
```

---

### Task 5: Kit client

Needs Task 1's `landing/KIT-CHECK.md`. Implement only the mode it recorded.

**Files:**
- Create: `landing/api/_lib/kit.ts`
- Test: `landing/tests/kit.test.ts`

**Interfaces:**
- Consumes: the working calls recorded in `KIT-CHECK.md`.
- Produces:
  - `class KitError extends Error { status: number }`
  - `createKitClient(opts: { apiKey: string; formId: string; fetch?: typeof fetch }): KitClient`
  - `interface KitClient { subscribe(email: string, fields: Record<string, string>, referrer: string): Promise<void>; updateFields(email: string, fields: Record<string, string>): Promise<void>; tag(email: string, tagId: number): Promise<void> }`
  - `subscribe` creates the subscriber unconfirmed and adds them to the form so Kit sends the confirmation email (`"api"` mode), or posts to the form URL then sets fields (`"form"` mode). A 200 "already on the form" counts as success.
  - Any non-2xx response or network failure throws `KitError`. Every request has a 10-second timeout (`AbortSignal.timeout(10_000)`).

- [ ] **Step 1: Write the failing tests** with a fake `fetch` that records calls and returns set responses:
  - `subscribe` sends the `X-Kit-Api-Key` header and the recorded request bodies, in the recorded order, with the `fields` and `referrer` passed in.
  - `subscribe` resolves when the add-to-form call returns 200 (already subscribed).
  - `subscribe` rejects with `KitError` whose `status` is 500 when Kit returns 500, and with `KitError` when `fetch` throws.
  - `updateFields` sends only the given fields for that email.
  - `tag` calls the recorded tag endpoint with the tag ID and email.

- [ ] **Step 2: Run to see them fail**

Run: `cd landing && npx vitest run tests/kit.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `kit.ts`** to the interface above.

- [ ] **Step 4: Run to see them pass**

Run: `cd landing && npx vitest run tests/kit.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add landing/api/_lib/kit.ts landing/tests/kit.test.ts
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "feat(landing): add Kit API client"
```

---

### Task 6: `/api/subscribe` function

**Files:**
- Create: `landing/api/subscribe.ts`
- Test: `landing/tests/subscribe.test.ts`

**Interfaces:**
- Consumes: `parseRequest` (Task 4), `createRateLimiter` (Task 4), `signToken`/`verifyToken` (Task 3), `KitClient` (Task 5).
- Produces:
  - `export const config = { runtime: 'edge' }` and `export async function POST(req: Request): Promise<Response>`, the same style as the app's `api/transcribe.ts`. `POST` builds the real dependencies from env vars and calls `handleSubscribe`.
  - `handleSubscribe(req: Request, deps: { kit: KitClient; secret: string; roleTags: Record<Role, number>; allow: (key: string) => boolean; now: () => number }): Promise<Response>`
  - `KIT_ROLE_TAGS` env var is JSON, for example `{"masters":1,"phd":2,"faculty":3,"staff_researcher":4,"other":5}`.
- Responses (all JSON):
  - Step 1 OK → `200 { ok: true, token }`. Fields sent to Kit: the three UTM values plus `signup_date` as `YYYY-MM-DD`; referrer = `page_url`.
  - Honeypot filled → `200 { ok: true, token: null }`, and Kit is never called.
  - Invalid email → `400 { error: 'invalid_email' }`; other bad input → `400 { error: 'invalid_request' }`; body not JSON → `400 { error: 'invalid_request' }`.
  - Over the rate limit (step 1 only, key = first IP in `x-forwarded-for`) → `429 { error: 'rate_limited' }`.
  - Kit throws → `502 { error: 'upstream' }`, no token.
  - Step 2 bad token → `401 { error: 'invalid_token' }`. Step 2 OK → `200 { ok: true }`; sets `role` and `use_case` fields (only the ones given) and tags by role if a role was given. Step 2 with neither → `200 { ok: true }`, no Kit call.

- [ ] **Step 1: Write the failing tests** with a fake `KitClient` and a fixed `now`, one test per response above, plus:
  - The same email twice gives `200` both times, and `kit.subscribe` gets the normalized email (`'  Ana@Uni.EDU '` → `'ana@uni.edu'`).
  - Kit failure: response is `502` and its body has no `token`.
  - Step 2 with a token signed 61 minutes ago gives `401`.
  - Step 2 `{ role: 'phd' }` calls `kit.updateFields('ana@uni.edu', { role: 'phd' })` and `kit.tag('ana@uni.edu', 2)`.

- [ ] **Step 2: Run to see them fail**

Run: `cd landing && npx vitest run tests/subscribe.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `subscribe.ts`** to the interface above.

- [ ] **Step 4: Run the whole suite**

Run: `cd landing && npm test && npm run typecheck`
Expected: all pass, no type errors.

- [ ] **Step 5: Commit**

```bash
git add landing/api/subscribe.ts landing/tests/subscribe.test.ts
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "feat(landing): add subscribe function"
```

---

### Task 7: Page markup and draft copy

**Files:**
- Modify: `landing/index.html`, `landing/src/styles.css`
- Create: `landing/COPY-OPTIONS.md`

**Interfaces:**
- Produces, for Task 8: the form markup with these exact hooks: `<form data-signup>` containing `<label for="email">`, `<input id="email" name="email" type="email" autocomplete="email" required>`, a honeypot `<input name="website" tabindex="-1" autocomplete="off">` hidden visually and from screen readers, `<button type="submit">`, and `<p data-status role="status" aria-live="polite">`; a hidden `<section data-step2>` with two `<fieldset>`s of radio buttons named `role` and `use_case` (values and labels from Global Constraints), a "Save" button and a "Skip" button. A second, repeated call-to-action form near the bottom uses the same `data-signup` markup.

- [ ] **Step 1: Write `COPY-OPTIONS.md`:** 8 headline options and 3 subheadline options in the brief's voice (brief 5.1 and 5.5), with the brief's starting idea "Stuck on the first draft? Talk it through." as option 1. Use option 1 on the page until Emmanuel picks.

- [ ] **Step 2: Build `index.html`** in the order from brief 5.1 and 5.4 with spec section 3's changes: logo; headline; subheadline; lazy-loaded embed of `https://youtu.be/BzVev97bpjk` (click-to-load thumbnail, `loading="lazy"`); one-line justification; form; three objection bullets in brief 5.2's order (privacy bullet uses the exact app privacy sentence); how it works (3 numbered steps); why talking works (two sentences, linking the mind-to-paper study from the brief's sources); FAQ (price "free during early access", privacy, platforms, "Is this an AI writing tool?"); repeated form; footer with privacy link and contact placeholder `[contact email]`. Add the Open Graph title, description and a placeholder image path.

- [ ] **Step 3: Check the layout**

Run: `cd landing && npm run dev`, open it at 375×667 and at 1440×900.
Expected: at 375×667 the headline, subheadline, email field and button are visible without scrolling; nothing scrolls sideways; spacing uses only the token scale.

- [ ] **Step 4: Commit**

```bash
git add landing/index.html landing/src/styles.css landing/COPY-OPTIONS.md
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "feat(landing): add page markup and draft copy"
```

---

### Task 8: Form behavior

**Files:**
- Create: `landing/src/utm.ts`, `landing/src/form.ts`
- Modify: `landing/src/main.ts`
- Test: `landing/tests/utm.test.ts`, `landing/tests/form.test.ts` (Vitest `environment: 'jsdom'` for this file)

**Interfaces:**
- Consumes: the markup hooks from Task 7; the `/api/subscribe` responses from Task 6.
- Produces:
  - `readUtm(search: string): { utm_source: string; utm_medium: string; utm_campaign: string }` (missing → `''`)
  - `initSignupForm(form: HTMLFormElement, step2: HTMLElement, fetchFn?: typeof fetch): void`
- Messages (exact copy, edit later if Emmanuel wants):
  - success: "Almost done. Check your inbox and click the link to confirm."
  - invalid_email: "That email doesn't look right. Check it and try again."
  - rate_limited: "Too many tries. Wait a few minutes and try again."
  - upstream / network: "Something went wrong. Please try again."
  - step 2 invalid_token: "We couldn't save your answers, but you're still on the list."
  - step 2 saved or skipped: "Thanks. You're on the list."

- [ ] **Step 1: Write the failing tests**
  - `readUtm('?utm_source=reddit&utm_campaign=phd')` returns `{ utm_source: 'reddit', utm_medium: '', utm_campaign: 'phd' }`.
  - Submitting posts `{ email, website, utm_*, page_url }` as JSON to `/api/subscribe` once; a second submit while the first is pending sends nothing, and the button has `disabled` until the response.
  - On `200 { token }`: shows the success message, hides the form, shows `[data-step2]`, moves focus to its first fieldset legend.
  - On `200 { token: null }` (honeypot): shows the same success message and does not show step 2.
  - On `400 invalid_email`, `429`, `502`, and a rejected `fetch`: shows the matching message, keeps the typed email, and re-enables the button.
  - Step 2 "Save" posts `{ step: 2, token, role, use_case }` with only the chosen values; "Skip" sends nothing and shows "Thanks. You're on the list."; a `401` shows the invalid_token message.

- [ ] **Step 2: Run to see them fail**

Run: `cd landing && npx vitest run tests/utm.test.ts tests/form.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `utm.ts` and `form.ts`; in `main.ts` call `initSignupForm` for every `form[data-signup]`.**

- [ ] **Step 4: Run the whole suite**

Run: `cd landing && npm test && npm run typecheck`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add landing/src landing/tests
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "feat(landing): add signup form behavior"
```

---

### Task 9: Confirmed and privacy pages

**Files:**
- Create: `landing/confirmed.html`, `landing/privacy.html`
- Modify: `landing/vite.config.ts` (add both to `build.rollupOptions.input`)

**Interfaces:**
- Produces: `/confirmed` (Kit's after-confirmation redirect target) and `/privacy` (linked from the footer and FAQ). Both use the same tokens, header and footer as `index.html`.

- [ ] **Step 1: Write `confirmed.html`:** a plain "You're in" message that says what happens next (invites go out in groups, updates every few weeks). No form, no step 2 questions.

- [ ] **Step 2: Write `privacy.html`** covering exactly spec section 3's privacy list: run by Emmanuel Maduneme; collected: email, role, main use, traffic source, signup date; why; stored by Kit as the email provider; kept until unsubscribe; never sold; how to unsubscribe; contact `[contact email]`; and the exact app privacy sentence.

- [ ] **Step 3: Verify**

Run: `cd landing && npm run build`
Expected: `dist/index.html`, `dist/confirmed.html`, `dist/privacy.html` all exist.

- [ ] **Step 4: Commit**

```bash
git add landing/confirmed.html landing/privacy.html landing/vite.config.ts
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "feat(landing): add confirmed and privacy pages"
```

---

### Task 10: Analytics, deploy config and README

**Files:**
- Create: `landing/vercel.json`, `landing/README.md`
- Modify: `landing/index.html`, `landing/confirmed.html`, `landing/privacy.html` (analytics snippet)

**Interfaces:**
- Produces: a Vercel project with root directory `landing/`, clean URLs (`/confirmed`, `/privacy`), and analytics that report visitors by UTM source.

- [ ] **Step 1: Pick the analytics tool.** Check that Umami Cloud's free plan reports UTM source, medium and campaign; if it does, use it, otherwise use Vercel Web Analytics if its free tier does. Add the snippet to all three pages.

- [ ] **Step 2: Write `vercel.json`** with `"cleanUrls": true`, and `README.md` covering: what this is (link the spec), local dev (`npm run dev` for the page, `npx vercel dev` to run the function), the four env vars and where each value comes from in Kit, the Kit settings (redirect after confirming → `https://<domain>/confirmed`), the UTM links from brief section 7, the email routine from spec section 5 (weekly welcome broadcast to that week's confirmed signups, updates every 2 to 4 weeks, invites in batches by tag), and the weekly check from spec section 6.

- [ ] **Step 3: Verify**

Run: `cd landing && npm test && npm run build`
Expected: tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add landing
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "chore(landing): add analytics, Vercel config and README"
```

---

### Task 11: Design and accessibility check, then end-to-end test

**Files:**
- Create: `landing/DESIGN-CHECK.md`
- Modify: whatever the checks show needs fixing

- [ ] **Step 1: Screenshot** `/`, the step-2 state, `/confirmed` and `/privacy` at 375×667 and 1440×900 (`npm run preview`, then the built-in browser or Playwright).

- [ ] **Step 2: Go through spec section 3.1 row by row** for every screenshot and record pass or fix in `DESIGN-CHECK.md`. Fix every failure.

- [ ] **Step 3: Run Lighthouse** (accessibility, best practices, performance) on `/` at mobile settings.
Expected: accessibility 100, no contrast failures, performance ≥ 90. Fix anything flagged.

- [ ] **Step 4: Keyboard and screen reader pass:** tab through the whole page and step 2; every control is reachable, has a visible focus outline and a label; the status message is announced.

- [ ] **Step 5: End to end on a Vercel preview deploy with the real Kit env vars** (needs Emmanuel's Kit setup): sign up with a test address from a `?utm_source=e2e-test` link, answer step 2, receive the confirmation email, click it, land on `/confirmed`, check in Kit that the subscriber is confirmed with all six fields and the role tag, then unsubscribe from the email footer and check Kit shows it. Delete the test subscriber.

- [ ] **Step 6: Commit**

```bash
git add landing
git -c user.name="Emmanuel Maduneme" -c user.email="culatemerald@gmail.com" commit -m "fix(landing): design and accessibility pass"
```

---

## Not in this plan (Emmanuel's setup, spec section 7)

Buying the domain, creating the Kit account and form, authenticating the sending domain, writing the confirmation email and footer postal address, supplying the contact email, re-editing the demo video, picking the headline, and going live on the production domain. Tasks 1, 5 and 11 step 5 wait on the Kit setup; everything else can be built before it.
