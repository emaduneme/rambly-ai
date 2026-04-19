# Rambly Chrome Extension Plan

## Context
Build a Chrome extension version of Rambly as a lightweight popup recorder. Users click the extension icon, record voice, and get AI-processed notes — all without leaving their current tab. The extension calls the existing deployed Vercel API endpoints (no API keys bundled). Storage uses `chrome.storage.local` behind an `IStorage` interface so sync can be added later.

## Project Structure

New `extension/` directory in the monorepo:

```
extension/
  public/
    manifest.json
    icons/  (icon16.png, icon48.png, icon128.png)
  src/
    popup/
      index.html, main.tsx, App.tsx, index.css
    components/
      RecorderPanel.tsx, NoteView.tsx, NoteList.tsx,
      ContextPicker.tsx, StatusBar.tsx
    hooks/
      useAudioRecorder.ts  (copied from web app)
    lib/
      types.ts      (Note, IStorage interfaces)
      api.ts        (calls deployed Vercel endpoints)
      storage.ts    (ChromeStorage implements IStorage)
      contexts.ts   (copied from web app)
      utils.ts      (copied from web app)
    background/
      service-worker.ts  (minimal, MV3 requirement)
  package.json, tsconfig.json, vite.config.ts
```

## Implementation Phases

### Phase 1: Foundation
1. Create `extension/package.json` — React 19, Tailwind v4, lucide-react, react-markdown, `@types/chrome` (no framer-motion — use CSS transitions to keep it lightweight)
2. Create `extension/tsconfig.json` and `extension/vite.config.ts` (multi-entry: popup + service-worker)
3. Create `extension/public/manifest.json` (Manifest V3, permissions: `storage`, host_permissions: deployed Vercel URL)
4. Create `extension/src/lib/types.ts` — `Note` and `IStorage` interfaces

### Phase 2: Core Logic
5. Copy `src/lib/contexts.ts` and `src/lib/utils.ts` into extension (pure data, no changes needed)
6. Copy `src/hooks/useAudioRecorder.ts` (works identically in popup context)
7. Create `extension/src/lib/storage.ts` — `ChromeStorage` class using `chrome.storage.local`
8. Create `extension/src/lib/api.ts` — same fetch logic as `src/lib/gemini.ts` but with absolute URLs (`VITE_API_BASE_URL`)
9. Create `extension/src/background/service-worker.ts` (minimal `onInstalled` listener)

### Phase 3: UI (400x600 popup)
10. Create popup HTML shell + CSS + React entry point
11. Create `App.tsx` — 3 views via state: **Home** (mic button + recent notes), **Recording/Processing** (visualizer + streamed output), **Note Display** (markdown + copy/refine)
12. Build components: `RecorderPanel`, `NoteView`, `NoteList`, `ContextPicker`, `StatusBar`

### Phase 4: CORS Update (existing API files)
13. Modify `api/transcribe.ts` — add CORS headers + OPTIONS preflight handler
14. Modify `api/process.ts` — add CORS headers + OPTIONS preflight handler

### Phase 5: Polish
15. Generate extension icons from existing branding
16. Add `extension/dist/` and `extension/node_modules/` to `.gitignore`
17. Create `extension/.env.example`

## Key Reuse

| Source file | Reuse strategy |
|---|---|
| `src/hooks/useAudioRecorder.ts` | Direct copy — MediaRecorder works in popups |
| `src/lib/contexts.ts` | Direct copy — pure data |
| `src/lib/utils.ts` | Direct copy — just `cn()` |
| `src/lib/gemini.ts` | Pattern reuse — same fetch/streaming logic, absolute URLs |
| `src/lib/storage.ts` | Rebuild — same `Note` type, `chrome.storage.local` behind `IStorage` |
| `src/App.tsx` | Pattern reuse — same state machine (record -> transcribe -> process -> save) |

## Popup UI Design (400x600)

### View 1: Home (default)
```
+--------------------------------------+
| [Rambly logo]              [Context] |
|--------------------------------------|
|                                      |
|   What's on your mind?               |
|                                      |
|         [ MIC BUTTON ]               |
|         "Tap to record"              |
|                                      |
|--------------------------------------|
|   RECENT NOTES                       |
|   +--------------------------------+ |
|   | Meeting prep ideas    2h ago   | |
|   +--------------------------------+ |
|   | Habit formation...    2d ago   | |
|   +--------------------------------+ |
+--------------------------------------+
```

### View 2: Recording / Processing
```
+--------------------------------------+
| [Rambly logo]           [X Cancel]   |
|--------------------------------------|
|                                      |
|      ||||||||||||||||||||||||         |
|           02:34                      |
|                                      |
|      [ STOP BUTTON (red) ]           |
|      "Recording — tap to stop"       |
|                                      |
|--------------------------------------|
|      "Organizing your notes..."      |
|   [streamed text appearing here]     |
|                                      |
+--------------------------------------+
```

### View 3: Note Display
```
+--------------------------------------+
| [< Back]                    [Delete] |
|--------------------------------------|
| # Meeting Prep Ideas                 |
| Business Notes . 2h ago              |
|--------------------------------------|
|                                      |
| Scrollable markdown content...       |
|                                      |
|--------------------------------------|
| [Copy]  [Polish further]  [Original] |
+--------------------------------------+
```

## Known Limitations (v1)
- Closing the popup while recording loses the recording (mitigated with UI warning)
- No sync between web app and extension (IStorage interface makes this addable later)

## Verification
1. `cd extension && npm install && npm run build`
2. Load `extension/dist/` as unpacked extension in `chrome://extensions`
3. Click extension icon — popup opens at 400x600
4. Record audio — transcription + processing works via Vercel API
5. Notes persist across popup open/close cycles
6. Notes list displays saved notes correctly
