# The interactive demo

File: `src/demo.ts`. Styles: the `.demo-*` block at the end of `src/styles.css`. Tests: `tests/demo.test.ts`. Mount point: `<div data-demo></div>` in `index.html`, started from `src/main.ts`.

It replaced the YouTube demo video. It runs live in the page, so there is nothing to download and it starts at once.

## Where the idea comes from

The "one shape, never cut" UI-motion prompt in [emaduneme/awesome-opus5-5-videos](https://github.com/emaduneme/awesome-opus5-5-videos) (entry `twoclipping-402193`). Rules taken from it:

- One shape, never cut. A single element morphs size, radius and colour between states. Content inside swaps with a short fade and blur.
- A cursor drives every change with real clicks.
- Black and white UI, one accent, Geist.
- Springs everywhere, a tiny overshoot at most. No bouncy easing, glows, particles or gradients.
- Every style is a pure function of time: `seek(t)`. No CSS transitions, no timers, no state carried between frames.
- A value that changes target many times is the sum of one closed-form spring per change.
- The tab indicator's two edges ride different springs, so the leading edge stretches ahead.
- The last frame equals the first, so it loops without a jump.

Rules dropped: music, beat grid, Playwright/ffmpeg rendering. This is a live page element, not a video file.

## Timeline (15 s loop)

| Time (s) | Shape | What happens |
|---|---|---|
| 0.0 | Mauve pill, 184×56 | "Record" button. Cursor moves in. |
| 1.2 | | Click on Record |
| 1.4 | White card, 560×340 | Recording: live waveform, timer, transcript words appear |
| ~2 to 5.6 | | Filler words ("so um", "like", "uh", "yeah") get a Mauve strike-through |
| 6.0 | | Click on Organize |
| 6.4 | Black circle, 72×72 | Loader spins |
| 7.6 | White card, 560×340 | Note tab. Grey skeleton lines settle into the organized text |
| 9.6 | | Click on the Actions tab. Underline stretches across |
| 10.7 | | Click ticks "Email my co-author about the data" |
| 11.9 | | Click on Copy to draft |
| 12.2 | Black pill, 300×56 | Toast: "Copied to your draft" |
| 13.8 | Mauve pill, 184×56 | Back to Record. Cursor returns to its start point |

All times live in the constants `SHAPE`, `CLICKS`, `CURSOR` and the `windows(...)` calls inside `seek()`.

## How to change it

- **Text.** `WORDS` (the ramble), `FILLER` (word indices to strike), the note and action HTML strings, `TABS` (labels, x positions and widths in px).
- **Timing.** Move a beat by changing its time in all the places it appears (shape key, layer window, click, cursor key). Keep the last shape key at least 1 s before `LOOP` so the springs settle and the loop stays seamless.
- **Stage size.** Logical 640×440. The stage scales to fit its frame with a CSS transform.
- **Feel.** `step(dt, hz, zeta)`. Higher `hz` is faster. `zeta` below 1 allows a little overshoot. Keep `zeta` at 0.8 or above.

After any change, run `npm test` (the loop test fails if the end no longer matches the start) and look at a few frames with `/#demo=<seconds>`.

## Controls and accessibility

- Play/Pause button and a scrubber (range input, labelled "Demo position"). Clicking the stage also toggles play.
- The stage is `role="img"` with a one-sentence `aria-label` describing the flow.
- `prefers-reduced-motion`: starts paused on the organized note (t = 8.8).
- Pauses when scrolled off screen (IntersectionObserver).
- `#demo=9` in the URL opens the demo paused at second 9.

## Known limits

- On phones the stage scales to about 0.56, so text inside the demo renders near 9px. It reads as a picture of the app. If testers find it hard to read, raise the font sizes in the `.demo-*` rules or use a taller mobile layout.
- The demo shows a scripted example, not a real recording.
