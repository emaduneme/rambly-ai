# Rambly Mobile UI Redesign — Design Spec

**Date:** 2026-04-21  
**Platform:** Android (Capacitor)  
**Business model:** Paid app, managed backend — no user-facing API key

---

## 1. Problems Being Solved

| # | Issue | Current state |
|---|-------|---------------|
| 1 | Welcome screen not visible | `Landing.tsx` hidden permanently once user clicks "Get Started" (localStorage flag) |
| 2 | Too much text | Subheadline restates headline; empty state is 2 verbose lines |
| 3 | No settings menu | Header has only logo + delete button |
| 4 | No sign-in | Zero authentication UI anywhere |

---

## 2. Welcome Screen

**Style:** Minimal Hero (Option A), light `#FAFAF8` background.

**Layout (top → bottom):**
1. Dynamic island spacer
2. Nav bar — logo + wordmark left, "Sign in" pill right
3. Hero area (vertically centered):
   - Purple gradient mic icon (80×80px, rounded-2xl, shadow)
   - `"Rambly"` — 36px serif (Georgia), bold, `#1A1A2E`
   - `"Record. Transcribe. Polish."` — 14px, `#9ca3af`, letter-spacing
   - `"Get started free"` — full-width purple gradient button, 16px padding, rounded-2xl
   - `"Continue with Google"` — white button, Google logo, border, rounded-2xl
4. Home indicator bar

**Behaviour:**
- "Get started free" → triggers Google Sign-In, then lands on main app
- "Continue with Google" → same flow
- "Sign in" pill in nav → same Google Sign-In flow
- On sign-out, welcome screen reappears (remove `localStorage` permanent flag; use auth state instead)

---

## 3. Main App Header

**Layout:** Three-zone horizontal bar
- **Left:** Hamburger icon (☰) — opens side drawer
- **Center:** Mic icon + "Rambly" wordmark
- **Right:** Empty (no delete button here — delete stays in note view)

---

## 4. Empty State — Text Reduction

**Before:**
> "What's on your mind?"  
> "Click on the mic below to record and we'll polish your thoughts into clean notes."

**After:**
> "What's on your mind?"  
> "Tap the mic to start"

Two lines, no explanation of what the app does — user already signed in, they know.

---

## 5. Side Drawer

Triggered by hamburger (☰) top-left. Slides in from left, dims content behind (overlay `rgba(0,0,0,0.35)`).

**Drawer contents (top → bottom):**
1. **User profile block** — Google avatar, display name, email
2. **Home** (active state: purple bg pill)
3. **Personas** — navigates to persona management screen
4. **Settings** — navigates to settings screen
5. *(flex spacer)*
6. **Sign out** — red label, triggers Google Sign-Out → returns to welcome screen

Drawer closes on: overlay tap, back gesture, nav item tap.

---

## 6. Personas Screen (Settings content)

Accessible from drawer → Personas.

**Features:**
- List of user-created personas (name + description)
- "New persona" button → inline form (name + description fields)
- Swipe-to-delete or long-press to delete
- One persona can be set as default
- Personas map to existing `ContextProfile` type in `src/lib/contexts.ts`

**Storage:** Personas persist in `localStorage` (existing pattern), keyed per user account.

---

## 7. Settings Screen

Accessible from drawer → Settings. Minimal for v1.

**Contents:**
- Account section: avatar, name, email (read-only)
- App section: "Clear all notes" destructive action
- Legal: Privacy policy link, Terms link

No API key field — service is managed.

---

## 8. Authentication

**Method:** Google Sign-In only (Android via Capacitor plugin)  
**Library:** `@codetrix-studio/capacitor-google-auth` (existing Capacitor setup in `android/`)

**Auth state:**
- Replaces `localStorage.getItem('rambly_has_started')` flag
- User object stored in React context (`AuthContext`) wrapping `App.tsx`
- Persists across app restarts via Capacitor plugin session

**Flows:**
- Cold open, not signed in → Welcome screen
- Cold open, signed in → Main app directly
- Sign out → Welcome screen, auth state cleared

---

## 9. Text Reduction Summary

| Location | Before | After |
|----------|--------|-------|
| `Landing.tsx` subheadline | "Rambly takes your rambling voice memos and structures them into perfectly edited text." | Removed — hero icon + tagline carry the message |
| `NoteArea.tsx` empty state body | "Click on the mic below to record and we'll polish your thoughts into clean notes." | "Tap the mic to start" |
| `Landing.tsx` headline | "Turn messy thoughts into polished notes with Rambly." | "Rambly" (serif, 36px) |

---

## 10. Out of Scope (v1)

- Apple Sign-In (Android only for now)
- Push notifications
- Cloud sync / backend storage (notes stay in localStorage)
- Dark mode
- Subscription / paywall UI
