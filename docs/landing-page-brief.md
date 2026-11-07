# Rambly Landing Page Brief

**Purpose:** Everything needed to build the Rambly waitlist page in Claude Code: the decisions already made, the research behind them, the Hormozi-style page structure, the tools, and the build checklist.

**Status:** Brief only. The final copy is not written yet. Each section below says what the copy must do, not the exact words.

**Date:** October 2026

---

## 1. The goal

Find out whether people want Rambly before building more of it.

**The test:**
- Put up one landing page with a waitlist form.
- Drive traffic to it from Reddit, Facebook, academic networks, the YouTube video, and an in-person pilot at Southeast Missouri State University (SEMO).
- Collect emails into a real email list so we can contact people later.

**The decision rule:**

| Signal | Build it | Rethink |
|---|---|---|
| Signups | 100 or more | Under 100 after all channels are used |
| Visitor to signup rate | 10% or higher is strong. 5 to 10% is okay. | Under 5% |
| Who signed up | Most are grad students or faculty | Mostly other roles (switch audience, don't quit) |

The conversion thresholds are a rule of thumb, not a sourced benchmark. The raw count alone is not enough: 100 signups from 1,000 visitors is a strong signal, 100 from 10,000 is weak.

---

## 2. Decisions already made

| Decision | Choice | Why |
|---|---|---|
| Audience | Grad students who get stuck starting to write (thesis, dissertation, papers). Faculty are secondary. | Real pain, people already recommend "talk it out" by hand, no tool clearly owns this spot. See section 3. |
| Geography | Online and national, plus a local pilot at SEMO in Cape Girardeau | Software competition is about the category, not the location. The waitlist itself controls capacity. SEMO keeps a small local start. |
| Email list | Listmonk (open source, self-hosted) | You want to email people later, so this needs to be a real list with double opt-in and unsubscribe. |
| AI models | Not part of this test | The page does not need a working app. Model changes happen only if the test passes (section 11). |

**Positioning rule (most important line in this brief):**
Rambly is "talk through your ideas, get your own words back, organized." It is never "AI writes your paper for you."

---

## 3. Research summary

### 3.1 Desk research

**The method is studied and works.**
- Medical researchers have studied "mind-to-paper" dictation since 2013. You outline first, then speak your first draft. In their study, even junior researchers produced good first drafts on their first try.
- A 2026 review of that work says dictation can reduce writer's block and perfectionism, and some writers report a feeling of flow.
- Google and UC Berkeley built a research prototype called **Rambler** (CHI 2024) that cleans up rambling speech into text with an LLM. A 2025 follow-up tested it with academic and creative writers for ten days. It is a prototype, not a product.
- **Name watch:** "Rambler" and "Rambly" are very close. Not a blocker, but worth knowing if someone mentions it.

**The competition splits into two groups. Neither owns Rambly's spot.**

| Group | Examples | What they do | Gap |
|---|---|---|---|
| Dictation tools | Dragon, Voibe, Speechify, Wispr Flow | Type what you say into Word or Overleaf | Don't organize messy thinking |
| Voice-notes apps | AudioPen, Voicenotes | Organize spoken thoughts | Built for everyone, not for academic writing |
| Interview and lecture transcription | Otter, Teams, Zoom, Panopto, Whisper | Transcribe conversations | A different job, crowded, often free through universities |

Reference prices: Wispr Flow about $12 to $15 a month. AudioPen about $99 a year. Dragon Professional about $700.

**The audience is big enough.** About 3.1 million US grad students, including about 624,000 doctoral students (2025 estimates, from secondhand reports of National Student Clearinghouse data).

**Other audiences were worse.** ADHD "brain dump" voice apps are crowded (Ordisio, Recordo, Offload, dump, Jot). Content creators already have AudioPen and similar apps.

### 3.2 Reddit research (October 2026)

**Method:** Apify actor `khadinakbar/reddit-posts-comments-scraper`. It searched r/PhD, r/GradSchool, r/academia, r/AskAcademia, and r/Professors for dictation, voice-memo, speech-to-text, and tool-name keywords in posts since October 2024. That produced about 740 records for about $2.25, and roughly 30% were on topic.

**Finding 1: The pain is real, and people already describe Rambly's method.**
The strongest thread was r/GradSchool, "ADHD-friendly strategies to ease difficulty of initiating writing a paper" (25 upvotes, 28 comments). Top advice:
- "Aim for a shitty first draft."
- "Writing out stream of consciousness style."
- "Imagine yourself talking to someone who has no idea about your topic." (r/PhD)
- "I use the dictation function in Word so that it types what I'm saying, then go in and add/edit." (r/PhD)

Nobody named a tool for this. **Implication:** the page has to show the method, not just name the product.

**Finding 2: Academics reject AI that writes for them.**
In "Is everyone using AI to write papers?" every top reply was a hard no: "I take pride in my craft." "Research and writing are exercises in thought and honesty."
**Implication:** lead with keeping the user's own words. Show the Light mode, not the Full rewrite with TL;DR.

**Finding 3: Self-promotion gets called out fast.**
In r/Professors, a post selling a tool was mocked: "the post stinks of AI," and a commenter named a competing dictation company as a known spammer. A commenter pointed to r/PhDproductivity as the place where tool posts go.
**Implication:** do not drop links in r/Professors or r/academia. See section 8.

**Finding 4: Privacy matters.**
The most upvoted replies in transcription threads were about ethics boards, data privacy, and running Whisper locally. One said: "otter.ai def feels icky."
**Implication:** say plainly on the page where recordings go and that they are not used to train AI. Only claim what is true.

**Finding 5: Voice tools in academia today mean accessibility or transcription.**
Injured, disabled, and blind students use Dragon, often paid for by a disability office or a grant. One complaint: "I've got to shout at it like a high school football coach."
**Implication:** accessibility is a possible second audience. Accuracy and "it just understands me" are selling points.

**Finding 6: People expect to pay little.** Most use free tools their university provides.
**Implication:** plan for a free tier or a low price. Don't put a price on the waitlist page.

**Limits:** Reddit search is loose. The scraper did not return post bodies, only titles and comments. Reddit is the loudest slice of academia. This shows the shape of the problem, not its size.

---

## 4. Hormozi's landing page approach

**Source note:** Hormozi has not published an official landing page template. Everything below comes from secondhand summaries of his workshop, videos, and books. Treat it as a strong guide, not scripture.

### 4.1 The 80/20 rule for landing pages

Put **80% of the effort into what shows above the fold**, on both mobile and desktop. A visitor should understand the value and be able to act without scrolling.

### 4.2 His three standard layouts

1. Headline, subheadline, form, submit button.
2. The same, plus an image.
3. The same, plus an image and three bullets.

**For Rambly, use layout 3** with a short demo video in place of the image.

### 4.3 The rules

| Element | Rule |
|---|---|
| Headline | Stop them in their tracks and promise a clear outcome. Make the benefit obvious. Don't overcomplicate it. A question-based headline is an option to test. |
| Subheadline | Clarify the promise and explain some of the "how." |
| Call to action | State what they get and how they get it. Nothing else. |
| One-line description | Answers "Why should I give you my email?" It's the justification. |
| Three bullets | The three biggest objections, most common first. |
| Form | Ask only what you need to qualify a lead. A two-step form lowers the first hurdle. |
| Section order below the fold | Headline, then video or image, then testimonials. |
| Overall feel | Mirror a real sales conversation. Answer objections before the visitor has to scroll back up. |
| Testing | Test several names and headlines, then keep the winner. |

### 4.4 The value equation as a copy checklist

Hormozi's value equation: **Value = (Dream outcome x Perceived likelihood) / (Time delay x Effort and sacrifice).**

| Lever | What the copy must show for Rambly |
|---|---|
| Dream outcome (raise) | A first draft that exists, in your own voice, without fighting a blank page |
| Perceived likelihood (raise) | Demo video, the mind-to-paper research, then beta-user quotes once you have them |
| Time delay (lower) | Seconds from talking to an organized draft |
| Effort and sacrifice (lower) | Just talk. No outline needed, no training the software, no typing. |

### 4.5 The lead magnet idea (optional, for testing)

Hormozi frames a lead magnet as a small, real problem solved for free, pointing toward the bigger problem the product solves. A natural fit for Rambly:

- **"The Talk-It-Out First Draft Method"**: a one-page guide to the outline, speak, then revise approach, with the mind-to-paper research behind it.
- Test it against a plain "Get early access" call to action. Keep whichever converts better.

---

## 5. The page, section by section

These are directions, not final copy. Use the research quotes in section 3 as raw material.

### 5.1 Above the fold (80% of the effort goes here)

| Slot | What it must do | Direction |
|---|---|---|
| Headline | Promise the outcome to someone stuck on a draft | Starting idea from our discussion: "Stuck on the first draft? Talk it through." Write 5 to 10 variants and test. |
| Subheadline | Explain the how in one line, and stress "your own words" | Something like "Rambly turns your rambling into your own words, organized." |
| Demo video | Show the mechanism in 30 to 60 seconds | Messy spoken ramble on the left, clean organized note on the right. Use Light mode so it's clearly the speaker's words. |
| One-line justification | Why give an email | Early access, plus a founding-member perk if you want one |
| Form step 1 | Email only | One field and one button |
| Button | What they get and how | "Get early access" style. Never "Submit." |
| Three objection bullets | Answer the top three objections from the research | See 5.2 |

### 5.2 The three objections, in order

From the Reddit research, most common first:

1. **"Is this AI writing my paper for me?"** Answer: No. It keeps your words and your ideas. It removes the ums, fixes the flow, and organizes what you said. You control how much it edits.
2. **"Where does my audio go?"** Answer with a short, true privacy statement. Decide the real policy before writing this line.
3. **"Will it understand me and my field?"** Answer: no training required, and it handles natural speech. Show it in the demo. Only claim what the app actually does.

### 5.3 Two-step form

**Step 1 (on the page):** email only.

**Step 2 (right after submitting, on the thank-you screen):** two quick questions. Both are optional, so the signup counts even if they skip.
- **Role:** Grad student (master's), Grad student (PhD), Faculty, Staff or researcher, Other.
- **What would you use it for?** Drafting papers or thesis chapters, Capturing research ideas, Teaching or lecture prep, Personal notes, Other.

Hidden fields captured automatically: `utm_source`, `utm_medium`, `utm_campaign`, and the referrer.

### 5.4 Below the fold (short)

1. **How it works**, in three steps: Talk, Rambly organizes, Edit and use.
2. **Why talking works**, in two sentences on the mind-to-paper research, with a link to the study.
3. **Testimonials:** none yet. Leave this out at launch. Add beta-user quotes later. Never invent them.
4. **FAQ** with 3 to 4 items: price ("free during early access"), privacy, platforms, and "Is this an AI writing tool?"
5. **A repeat of the call to action.**
6. **Footer:** privacy policy link and contact.

### 5.5 Copy rules

**Do:**
- Use "your words," "your ideas," "first draft," "talk it through," "organized."
- Use short sentences, written so a tired grad student can read it at a glance.

**Avoid:**
- "AI writes for you," "generate your paper," "polish to perfection," "10x."
- Any claim you can't back up, such as accuracy numbers or privacy promises you haven't built.
- Copy that sounds AI-written. This audience spots it and mocks it.

### 5.6 The thank-you and confirmation flow

1. Thank-you screen with the step 2 questions.
2. A double opt-in confirmation email from Listmonk.
3. After they confirm: a short welcome email that says what happens next and roughly when invites go out. Optionally, a link to the lead magnet.

---

## 6. Tools and tech stack

### 6.1 Overview

| Job | Tool | Cost | Notes |
|---|---|---|---|
| Landing page | Static page (plain HTML with Tailwind, or a small Vite build) | Free | Keep it separate from the app (see 6.2) |
| Hosting | Vercel (already in use) | Free tier | Its own Vercel project and domain |
| Email list | **Listmonk** (open source) | Hosting cost only | Double opt-in, unsubscribe, lists, custom fields |
| Listmonk hosting | PikaPods (managed) or a small VPS | Roughly a few dollars a month | PikaPods quotes roughly $1 to $3 a month for small apps. Check the current price for Listmonk. |
| Email sending (SMTP) | Amazon SES or Resend | SES about $0.10 per 1,000 emails. Resend free plan: 3,000 a month, 100 a day. | Listmonk does not send email itself |
| Form to Listmonk | A Vercel serverless function | Free | Keeps Listmonk credentials off the page |
| Spam protection | Honeypot field plus Cloudflare Turnstile | Free | Public signup forms attract bots |
| Analytics | Vercel Web Analytics, Umami, or Plausible | Free tier or about $9 a month | You need visitors per channel to compute conversion |
| Video | YouTube embed of a re-edited demo | Free | Lazy-load it so the page stays fast |
| Domain and DNS | Any registrar | About $10 to $15 a year | Needed for SPF, DKIM, and DMARC so emails don't land in spam |

### 6.2 Keep the landing page separate from the app

The current app's API (`/api/transcribe`, `/api/process`) has no authentication and no rate limiting. Anyone who finds it can spend your AI credits.

- Deploy the landing page as its own Vercel project.
- Don't link to the live app from the landing page during the test.

### 6.3 Listmonk setup

1. Deploy Listmonk (PikaPods one-click, or Docker on a VPS). It needs Postgres, and PikaPods includes it.
2. Create a list named "Rambly Waitlist." Set it to **Public** with **Double opt-in**.
3. Configure SMTP under Settings, then SMTP, using SES or Resend credentials. Port 587 with STARTTLS is common.
4. Set up SPF, DKIM, and DMARC on your sending domain.
5. Edit the opt-in confirmation email template so it sounds like you.
6. Add your **physical mailing address** to the email footer. CAN-SPAM requires a postal address in commercial email. Listmonk adds unsubscribe links.

### 6.4 Form to Listmonk wiring

**Recommended:** the page posts to `/api/subscribe` on the landing page's Vercel project. That function:
1. Rejects the request if the honeypot field is filled or the Turnstile check fails.
2. Applies a simple rate limit per IP address.
3. Creates the subscriber in Listmonk with the email, list ID, status that triggers double opt-in, and `attribs` (role, use case, UTM fields, signup date).
4. On step 2, updates the same subscriber's `attribs` with the role and use case.

**Verify in the official Listmonk docs before building:**
- The exact endpoint and payload for creating a subscriber with attributes and double opt-in. Listmonk has both a public subscription endpoint (`/api/public/subscription`) and an authenticated admin API. The admin API is more likely to accept custom attributes. I could not confirm the payload details.
- How to trigger the opt-in email when creating a subscriber through the API.

Store `LISTMONK_URL`, `LISTMONK_API_USER`, `LISTMONK_API_TOKEN`, `LISTMONK_LIST_ID`, and `TURNSTILE_SECRET` as Vercel environment variables. Never put them in the page.

### 6.5 Claude Code tools on your computer

| Tool | Use it for |
|---|---|
| Apify MCP (already connected) | More Reddit or competitor research. The actor `khadinakbar/reddit-posts-comments-scraper` works. Add r/PhDproductivity and r/dissertation if you rerun. |
| Superpowers | The brainstorming and planning skills, to turn this brief into a build plan before coding |
| Playwright or Chromium | Screenshot the page at phone and desktop widths to check what is above the fold |
| Vercel CLI (already a dev dependency) | Deploy and set environment variables |

---

## 7. Measurement

**Track per channel:** visitors, signups, conversion rate, and role mix.

**UTM links.** Give every channel its own link:

| Channel | Example link |
|---|---|
| Reddit r/GradSchool | `?utm_source=reddit&utm_medium=post&utm_campaign=gradschool` |
| Reddit r/PhD | `?utm_source=reddit&utm_medium=post&utm_campaign=phd` |
| Facebook groups | `?utm_source=facebook&utm_medium=group&utm_campaign=<group>` |
| YouTube video | `?utm_source=youtube&utm_medium=video&utm_campaign=demo` |
| SEMO flyers | `?utm_source=semo&utm_medium=flyer&utm_campaign=<location>` |
| Personal network | `?utm_source=network&utm_medium=<platform>` |

**Weekly check:** export subscribers from Listmonk as CSV, then count by role, use case, and source. Compare with visitors from analytics.

**Count only confirmed subscribers.** Unconfirmed double opt-in signups don't count toward 100.

---

## 8. Distribution plan

**Rules from the research:**
- Lead with the method and your story, not the link. Share "talk it out, then edit" as advice that helps. Mention Rambly only where a sub's rules allow it.
- Read each subreddit's self-promotion rules before posting.
- Never post copy that reads as AI-written.

| Channel | Approach | Priority |
|---|---|---|
| r/GradSchool, r/PhD | Take part as a real member. Share the method. Link only if the rules allow it. | High |
| r/PhDproductivity | Reportedly where tool posts go. Check the rules. | High |
| YouTube video | Re-edit as the demo (section 9). Put the link in the description and a pinned comment. | High |
| Your academic network | LinkedIn, Bluesky, department contacts, colleagues | High |
| SEMO pilot | Graduate school office, writing center, flyers with a QR code and UTM link, a short demo in a grad seminar if possible | Medium |
| University writing centers elsewhere | Email a short note offering early access for their students | Medium |
| Facebook groups | PhD and grad-student support groups. Same method-first approach. | Medium |
| r/Professors, r/academia | **Don't promote here.** | Skip |
| Nextdoor | Weak fit for software | Skip |

---

## 9. YouTube video changes

- **Length:** 30 to 60 seconds for the page embed. A longer version can stay on YouTube.
- **Open with the pain:** a blinking cursor on a blank thesis chapter.
- **Show the mechanism:** the person talks naturally for about 20 seconds, then Rambly shows an organized draft in **their own words**.
- **Show the fidelity control** (Raw, Light, Standard). This answers the "is AI writing it?" objection without saying a word.
- **Skip** the Full rewrite with TL;DR in this cut.
- **End with:** "Join the waitlist" and the link.
- **Burn in captions.** Many people watch with the sound off.

---

## 10. Build checklist

1. [ ] Decide the real privacy policy (storage, retention, no AI training), then write the privacy page.
2. [ ] Buy or choose the domain. Set up the separate Vercel project.
3. [ ] Deploy Listmonk. Create the public double opt-in list. Configure SMTP. Set SPF, DKIM, and DMARC. Edit the opt-in template and add your postal address.
4. [ ] Confirm the Listmonk API payload for subscriber creation with attributes and double opt-in (section 6.4).
5. [ ] Build `/api/subscribe` with a honeypot, Turnstile, a rate limit, and step 2 attribute updates.
6. [ ] Write the copy: 5 to 10 headlines, a subheadline, three objection bullets, the FAQ, and the thank-you screen.
7. [ ] Build the page. Check at 375px width that the headline, subheadline, email field, and button all fit above the fold.
8. [ ] Re-edit and embed the demo video.
9. [ ] Add analytics. Create all UTM links.
10. [ ] Test end to end: sign up, step 2, confirmation email, confirm, check Listmonk shows the attributes, unsubscribe works.
11. [ ] Optional: build the "Talk-It-Out First Draft Method" lead magnet.
12. [ ] Launch. Start with the YouTube video and your network, then Reddit and SEMO.
13. [ ] Weekly: check numbers against the decision rule in section 1.

---

## 11. Out of scope until the test passes

Found during the code review. Fix these only if the waitlist hits its target:

- **Swap the AI models.** Gemini 2.5 Flash becomes Groq Whisper Large v3 Turbo for transcription, about $0.04 per hour of audio. Gemma 3 27B becomes `gpt-oss-20b` for cleanup, about $0.02 to $0.03 per million input tokens. Test Full mode quality and step up to `gpt-oss-120b` if needed. Recheck prices at build time.
- **Add auth and rate limiting** to `/api/transcribe` and `/api/process`. Required before any waitlist user gets access.
- **Fix the large-upload problem.** Audio is sent as base64 JSON with an 8MB allowance, but Vercel functions cap request bodies at about 4.5MB. Upload directly to storage instead.
- **Fix the API key fallback** in `api/process.ts`, which still sends `GEMINI_API_KEY` to OpenRouter.
- **Remove leftovers:** `test_models.js`, the "hackathon judges" seed-data comment, and the Gemini mentions in the README and error messages. Add the missing `.env.example`.
- **Revisit the default fidelity.** This audience prefers Light over Full rewrite.

---

## 12. Open questions

- What is the founding-member perk, if any? Free months, a lifetime discount, or none?
- What is the real privacy policy for recordings?
- PikaPods or a VPS for Listmonk? Check current pricing.
- SES or Resend for sending? SES is cheaper. Resend is simpler to start with.
- Plain HTML or a small Vite build for the page?

---

## 13. Sources

**Academic research**
- [Rambler in the Wild: A Diary Study of LLM-Assisted Writing With Speech](https://arxiv.org/pdf/2502.05612) (Yang et al., 2025, CHI Extended Abstracts)
- [Rambler: Supporting Writing With Speech via LLM-Assisted Gist Manipulation](https://research.google/pubs/rambler-supporting-writing-with-speech-via-llm-assisted-gist-manipulation/) (CHI 2024)
- [Dictation as a Strategy for Scientific Writing: A Review of the Mind-to-paper Approach](https://consensus.app/papers/details/8e825f583a315cef8a5c3ac3bf0c7d03/) (Rosenberg, 2026)
- [Mind-to-paper is an effective method for scientific writing](https://research.regionh.dk/en/publications/mind-to-paper-is-an-effective-method-for-scientific-writing/)
- [Sounds Good: Dictation Software, Translingualism, and Multimodal Productivity](https://consensus.app/papers/details/8070490ca3b7513da3f927601b0911db/) (Martin, 2025)
- [Engineering graduate student writing study (NSF)](https://par.nsf.gov/biblio/10094076)

**Market and competitors**
- [Best Dictation Apps for Academic Writing 2026 (Voibe)](https://www.getvoibe.com/resources/best-dictation-apps-for-academic-writing/)
- [Wispr Flow Pricing 2026](https://usevoicy.com/blog/wispr-flow-pricing/)
- [Wispr Flow Alternatives (AudioPen)](https://www.audiopen.ai/wispr-flow-alternatives)
- [VoiceToNotes.ai Alternatives (VoiceDash)](https://voicedash.ai/voicetonotes-ai-alternatives/)
- [Best ADHD Apps for Adults 2026](https://www.audionotes.app/blog/best-adhd-apps-for-adults)
- [College Enrollment Statistics (BestColleges)](https://www.bestcolleges.com/research/college-enrollment-statistics/)

**Reddit threads**
- [r/GradSchool: ADHD-friendly strategies to ease difficulty of initiating writing a paper](https://www.reddit.com/r/GradSchool/comments/1szh110/)
- [r/PhD: I am stuck to write introduction](https://www.reddit.com/r/PhD/comments/1jgluhe/)
- [r/PhD: Writing without typing](https://www.reddit.com/r/PhD/comments/1qqbuh4/)
- [r/GradSchool: Completing a Political Science PhD using mostly speech to text](https://www.reddit.com/r/GradSchool/comments/1ofznt7/)
- [r/AskAcademia: Is everyone using AI to write papers but not declaring it?](https://www.reddit.com/r/AskAcademia/comments/1rbbm34/)
- [r/AskAcademia: Atlas.ti Auto Transcription Experiences](https://www.reddit.com/r/AskAcademia/comments/1m0bxxk/)
- [r/academia: Non-AI Transcription Software for Interviews](https://www.reddit.com/r/academia/comments/1pcpwu5/)
- [r/Professors: I spent more time grading than on research](https://www.reddit.com/r/Professors/comments/1s0fz88/)

**Hormozi landing page advice (secondhand)**
- [Alex Hormozi's $100M Landing Page Advice (HUEMOR)](https://huemor.rocks/blog/alex-hormozis-100m-landing-page-advice/)
- [I Invested $45,000 In Alex Hormozi's Workshop (Dickie Bush)](https://dickiebush.substack.com/p/i-invested-45000-in-alex-hormozis)
- [What Makes a Landing Page Convert? (Hormozi lessons)](https://www.shedevelops.online/blog/landing-page-lessons-hormozi-webflow)
- [12 Best Landing Page Examples for Creators of 2026 (Swipe Pages)](https://swipepages.com/blog/12-best-landing-page-examples-for-creators-of-2026/)
- [The Game w/ Alex Hormozi, Ep 969: Generate 1000s of Leads (Shortform summary)](https://shortform.com/podcast/episode/the-game-w-alex-hormozi-2025-11-18-episode-summary-generate-1000s-of-leads-in-any-niche-ep-969)
- [$100M Offers summary (SuperSummary)](https://www.supersummary.com/100m-offers/section-3-summary/)
- [The UX of value perception (UX Collective)](https://uxdesign.cc/the-ux-of-value-perception-7aada3a5a46f)

**Tools**
- [Listmonk](https://www.listmonk.app)
- [Listmonk Basics (PikaPods docs)](https://docs.pikapods.com/tutorials/email/listmonk-1-basics/)
- [PikaPods FAQ](https://docs.pikapods.com/faq)
- [Send a newsletter with Listmonk (Lettermint)](https://lettermint.co/knowledge-base/guides/send-newsletter-with-listmonk)
- [Amazon SES vs Resend Pricing (CostBench)](https://costbench.com/compare/amazon-ses-vs-resend/)
- [Resend review (WP Mail SMTP)](https://wpmailsmtp.com/resend-review/)
- [Speech-to-Text API Pricing 2026](https://convertaudiototext.com/blog/speech-to-text-api-pricing-2026)
- [gpt-oss-20b on OpenRouter (ComputePrices)](https://computeprices.com/providers/openrouter/models/gpt-oss-20b)
