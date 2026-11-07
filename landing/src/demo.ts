// The interactive product demo. One shape morphs between states and a cursor
// drives every change. Every style is a pure function of time: stateAt(t).
// Spec and timeline: landing/DEMO.md.

export const LOOP = 15;
export const STAGE = { w: 640, h: 440 };
const CARD = { x: 40, y: 50, w: 560, h: 340 };

type RGB = [number, number, number];
const ACCENT: RGB = [140, 90, 134];
const WHITE: RGB = [255, 255, 255];
const INK: RGB = [10, 10, 10];

/** Closed-form spring step response: 0 at dt <= 0, settles at 1. zeta >= 0.8 keeps overshoot tiny. */
export function step(dt: number, hz = 2.6, zeta = 0.85): number {
  if (dt <= 0) return 0;
  const w = 2 * Math.PI * hz;
  if (zeta >= 1) return 1 - Math.exp(-w * dt) * (1 + w * dt);
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * dt) * (Math.cos(wd * dt) + ((zeta * w) / wd) * Math.sin(wd * dt));
}

type Key<V> = [number, V];

/** A value that changes target many times: the sum of one spring per change. */
function track(keys: Key<number>[], t: number, hz?: number, zeta?: number): number {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) v += (keys[i][1] - keys[i - 1][1]) * step(t - keys[i][0], hz, zeta);
  return v;
}

function trackRGB(keys: Key<RGB>[], t: number): RGB {
  return [0, 1, 2].map((c) => track(keys.map(([k, v]) => [k, v[c]]), t)) as RGB;
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const smooth = (v: number) => { const x = clamp(v); return x * x * (3 - 2 * x); };

/** Opacity of a layer that is shown inside any of the given [start, end] windows. */
function windows(t: number, spans: [number, number][], fadeIn = 0.25, fadeOut = 0.2): number {
  return Math.max(0, ...spans.map(([a, b]) => smooth((t - a) / fadeIn) * smooth((b - t) / fadeOut)));
}

/** A short press bump after a click: 0 → 1 → 0 over 0.25 s. */
const press = (dt: number) => (dt > 0 && dt < 0.25 ? Math.sin((Math.PI * dt) / 0.25) : 0);

// Shape keys: [time, width, height, radius, colour].
export const SHAPE: [number, number, number, number, RGB][] = [
  [0, 184, 56, 28, ACCENT],
  [1.4, 560, 340, 20, WHITE],
  [6.4, 72, 72, 36, INK],
  [7.6, 560, 340, 20, WHITE],
  [12.2, 300, 56, 28, INK],
  [13.8, 184, 56, 28, ACCENT],
];

export const CLICKS = { record: 1.2, organize: 6.0, actions: 9.6, tick: 10.7, copy: 11.9 };

// Card-relative tab boxes (px).
export const TABS = [
  { label: 'Note', x: 24, w: 40 },
  { label: 'Actions', x: 80, w: 56 },
  { label: 'Calendar', x: 152, w: 64 },
  { label: 'Transcript', x: 232, w: 76 },
];

const at = (cx: number, cy: number): [number, number] => [CARD.x + cx, CARD.y + cy];
const ORGANIZE = at(CARD.w - 20 - 43, CARD.h - 20 - 17);
const COPY = at(CARD.w - 20 - 50, CARD.h - 20 - 17);
const REST: [number, number] = [430, 330];

// Cursor keys: [time, [x, y]] in stage px. Ends where it starts.
export const CURSOR: Key<[number, number]>[] = [
  [0, REST],
  [0.2, [324, 224]],
  [1.6, [440, 300]],
  [5.0, ORGANIZE],
  [6.5, REST],
  [7.8, [COPY[0] + 6, COPY[1] + 8]],
  [8.8, at(TABS[1].x + TABS[1].w / 2, 36)],
  [10.0, at(27, 88)],
  [11.1, COPY],
  [12.6, REST],
];

export const WORDS = 'so um the intro needs to like start with the gap uh nobody has measured how solutions stories make readers feel and then yeah the method comes after and I need to email my co-author about the data by Friday'.split(' ');
export const FILLER = [0, 1, 6, 11, 23];
const WORD_START = 1.6;
const WORD_GAP = 0.1;

export interface DemoState {
  shape: { w: number; h: number; r: number; color: string };
  layers: { record: number; recording: number; loader: number; card: number; toast: number };
  cursor: { x: number; y: number; scale: number };
  timer: string;
  words: { opacity: number; strike: number }[];
  bars: number[];
  spin: number;
  skeleton: number;
  note: number;
  pane: { note: number; actions: number };
  indicator: { left: number; right: number };
  tick: number;
  press: { record: number; organize: number; copy: number };
}

export function stateAt(time: number): DemoState {
  const t = ((time % LOOP) + LOOP) % LOOP;
  const rgb = trackRGB(SHAPE.map(([k, , , , c]) => [k, c]), t).map((c) => Math.round(clamp(c, 0, 255)));

  const clickPress = Object.values(CLICKS).reduce((s, c) => s + press(t - c), 0);
  const recordingSince = clamp(t - SHAPE[1][0], 0, 9);

  // The tab indicator: two edges on different springs so the leading edge stretches ahead.
  const tabKeys = (edge: (i: number) => number): Key<number>[] => [[0, edge(0)], [CLICKS.actions, edge(1)], [13.0, edge(0)]];
  const left = track(tabKeys((i) => TABS[i].x), t, 2.2, 0.9);
  const right = track(tabKeys((i) => TABS[i].x + TABS[i].w), t, 3.6, 0.85);
  const toActions = step(t - CLICKS.actions - 0.05, 3.2, 1) * (1 - step(t - 13.0, 4, 1));

  return {
    shape: {
      w: track(SHAPE.map(([k, w]) => [k, w]), t),
      h: track(SHAPE.map(([k, , h]) => [k, h]), t),
      r: track(SHAPE.map(([k, , , r]) => [k, r]), t),
      color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
    },
    layers: {
      record: windows(t, [[-1, 1.35], [13.9, LOOP + 1]]),
      recording: windows(t, [[1.5, 6.3]]),
      loader: windows(t, [[6.5, 7.5]]),
      card: windows(t, [[7.7, 12.1]]),
      toast: windows(t, [[12.35, 13.7]]),
    },
    cursor: {
      x: track(CURSOR.map(([k, p]) => [k, p[0]]), t, 1.6, 0.9),
      y: track(CURSOR.map(([k, p]) => [k, p[1]]), t, 1.6, 0.9),
      scale: 1 - 0.18 * clickPress,
    },
    timer: `0:${String(Math.floor(recordingSince)).padStart(2, '0')}`,
    words: WORDS.map((_, i) => {
      const shown = WORD_START + i * WORD_GAP;
      return { opacity: step(t - shown, 4, 1), strike: FILLER.includes(i) ? step(t - shown - 0.35, 3, 0.9) : 0 };
    }),
    bars: Array.from({ length: 44 }, (_, i) =>
      4 + 22 * Math.abs(Math.sin(i * 1.7 + t * 9) * Math.sin(i * 0.6 - t * 5)) * smooth((5.9 - t) / 0.4)),
    spin: (t * 420) % 360,
    skeleton: 1 - smooth((t - 8.2) / 0.3),
    note: smooth((t - 8.35) / 0.35),
    pane: { note: 1 - toActions, actions: toActions },
    indicator: { left, right },
    tick: step(t - CLICKS.tick - 0.05, 4, 0.9) * (1 - step(t - 13.0, 4, 1)),
    press: { record: press(t - CLICKS.record), organize: press(t - CLICKS.organize), copy: press(t - CLICKS.copy) },
  };
}

const NOTE_HTML = `
  <p class="demo-title">Paper intro</p>
  <p class="demo-line">Open with the gap: nobody has measured how solutions stories make readers feel.</p>
  <p class="demo-line">Then walk through the method.</p>`;

const ACTIONS = [
  { text: 'Email my co-author about the data', due: 'Fri' },
  { text: 'Draft the intro', due: 'Today' },
];

const CHECK = '<svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>';

function build(root: HTMLElement) {
  root.innerHTML = `
    <div class="demo-frame">
      <div class="demo-stage" role="img" aria-label="A short demo: someone presses Record and talks, Rambly crosses out the filler words, turns the ramble into a note and a to-do list, and copies it to a draft.">
        <div class="demo-shape">
          <div class="demo-layer demo-record"><span class="demo-dot"></span>Record</div>
          <div class="demo-layer demo-card demo-recording">
            <div class="demo-row"><span class="demo-rec"><span class="demo-dot demo-dot-accent"></span>Recording</span><span class="demo-timer"></span></div>
            <div class="demo-wave">${'<i></i>'.repeat(44)}</div>
            <p class="demo-words">${WORDS.map((w) => `<span>${w}</span>`).join(' ')}</p>
            <span class="demo-btn demo-btn-accent demo-organize">Organize</span>
          </div>
          <div class="demo-layer demo-loader"><span class="demo-spinner"></span></div>
          <div class="demo-layer demo-card demo-result">
            <div class="demo-tabs">${TABS.map((tab) => `<span style="left:${tab.x}px;width:${tab.w}px">${tab.label}</span>`).join('')}<b class="demo-indicator"></b></div>
            <div class="demo-pane demo-pane-note">
              <div class="demo-skeleton"><i style="width:36%"></i><i></i><i style="width:84%"></i><i style="width:55%"></i></div>
              <div class="demo-note">${NOTE_HTML}</div>
            </div>
            <div class="demo-pane demo-pane-actions">
              ${ACTIONS.map((a) => `<div class="demo-action"><span class="demo-box">${CHECK}</span><span class="demo-action-text">${a.text}</span><span class="demo-due">${a.due}</span></div>`).join('')}
            </div>
            <span class="demo-btn demo-btn-ink demo-copy">Copy to draft</span>
          </div>
          <div class="demo-layer demo-toast">${CHECK.replace('width="10" height="10"', 'width="12" height="12"')}Copied to your draft</div>
        </div>
        <svg class="demo-cursor" width="18" height="22" viewBox="0 0 18 22" aria-hidden="true"><path d="M1.5 1.5v16l4.2-4 2.9 6.6 2.6-1.1-2.9-6.5h6z" fill="#0A0A0A" stroke="white" stroke-width="1.4" stroke-linejoin="round"/></svg>
      </div>
    </div>
    <div class="demo-controls">
      <button type="button" class="demo-play" data-demo-play>Pause</button>
      <input type="range" class="demo-scrub" data-demo-scrub min="0" max="${LOOP}" step="0.01" value="0" aria-label="Demo position" />
    </div>`;
}

function layer(el: HTMLElement, opacity: number) {
  el.style.opacity = opacity.toFixed(3);
  el.style.filter = opacity > 0.99 ? '' : `blur(${((1 - opacity) * 6).toFixed(2)}px)`;
  el.style.visibility = opacity < 0.005 ? 'hidden' : 'visible';
}

/** Mounts the demo and returns controls (used by tests). */
export function initDemo(root: HTMLElement, win: Window = window) {
  build(root);
  const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector(sel) as unknown as T;
  const frame = q('.demo-frame');
  const stage = q('.demo-stage');
  const shape = q('.demo-shape');
  const cursor = q<SVGElement>('.demo-cursor');
  const playBtn = q<HTMLButtonElement>('[data-demo-play]');
  const scrub = q<HTMLInputElement>('[data-demo-scrub]');
  const L = {
    record: q('.demo-record'), recording: q('.demo-recording'), loader: q('.demo-loader'),
    card: q('.demo-result'), toast: q('.demo-toast'),
  };
  const timer = q('.demo-timer');
  const bars = Array.from(root.querySelectorAll<HTMLElement>('.demo-wave i'));
  const words = Array.from(root.querySelectorAll<HTMLElement>('.demo-words span'));
  const spinner = q('.demo-spinner');
  const skeleton = q('.demo-skeleton');
  const note = q('.demo-note');
  const paneNote = q('.demo-pane-note');
  const paneActions = q('.demo-pane-actions');
  const indicator = q('.demo-indicator');
  const tabs = Array.from(root.querySelectorAll<HTMLElement>('.demo-tabs span'));
  const firstAction = q('.demo-action');
  const organize = q('.demo-organize');
  const copy = q('.demo-copy');

  let time = 0;
  let playing = true;
  let visible = true;
  let last: number | null = null;
  let raf = 0;

  function seek(t: number) {
    time = ((t % LOOP) + LOOP) % LOOP;
    const s = stateAt(time);
    shape.style.width = `${s.shape.w}px`;
    shape.style.height = `${s.shape.h}px`;
    shape.style.borderRadius = `${s.shape.r}px`;
    shape.style.backgroundColor = s.shape.color;
    shape.style.transform = `translate(-50%, -50%) scale(${1 - 0.05 * s.press.record})`;
    (Object.keys(L) as (keyof typeof L)[]).forEach((k) => layer(L[k], s.layers[k]));
    cursor.style.transform = `translate(${s.cursor.x}px, ${s.cursor.y}px) scale(${s.cursor.scale})`;
    timer.textContent = s.timer;
    bars.forEach((b, i) => { b.style.height = `${s.bars[i].toFixed(1)}px`; });
    words.forEach((w, i) => {
      w.style.opacity = s.words[i].opacity.toFixed(3);
      w.style.setProperty('--strike', s.words[i].strike.toFixed(3));
      w.classList.toggle('is-filler', s.words[i].strike > 0.5);
    });
    spinner.style.transform = `rotate(${s.spin}deg)`;
    skeleton.style.opacity = s.skeleton.toFixed(3);
    note.style.opacity = s.note.toFixed(3);
    note.style.transform = `translateY(${((1 - s.note) * 6).toFixed(2)}px)`;
    layer(paneNote, s.pane.note);
    layer(paneActions, s.pane.actions);
    indicator.style.left = `${s.indicator.left}px`;
    indicator.style.width = `${s.indicator.right - s.indicator.left}px`;
    tabs.forEach((tab, i) => tab.classList.toggle('is-active', i === (s.pane.actions > 0.5 ? 1 : 0)));
    firstAction.style.setProperty('--tick', s.tick.toFixed(3));
    firstAction.classList.toggle('is-done', s.tick > 0.5);
    organize.style.transform = `scale(${1 - 0.06 * s.press.organize})`;
    copy.style.transform = `scale(${1 - 0.06 * s.press.copy})`;
    scrub.value = time.toFixed(2);
  }

  function frameLoop(now: number) {
    if (last !== null) seek(time + Math.min(0.1, (now - last) / 1000));
    last = now;
    raf = win.requestAnimationFrame(frameLoop);
  }

  function update() {
    const run = playing && visible;
    playBtn.textContent = playing ? 'Pause' : 'Play';
    playBtn.setAttribute('aria-pressed', String(!playing));
    if (run && !raf) { last = null; raf = win.requestAnimationFrame(frameLoop); }
    if (!run && raf) { win.cancelAnimationFrame(raf); raf = 0; }
  }

  function setPlaying(p: boolean) { playing = p; update(); }

  playBtn.addEventListener('click', () => setPlaying(!playing));
  stage.addEventListener('click', () => setPlaying(!playing));
  scrub.addEventListener('input', () => { setPlaying(false); seek(Number(scrub.value)); });

  // Scale the 640×440 stage to fit its frame.
  const fit = () => {
    const scale = frame.clientWidth / STAGE.w || 1;
    stage.style.transform = `scale(${scale})`;
    frame.style.height = `${STAGE.h * scale}px`;
  };
  fit();
  if ('ResizeObserver' in win) new (win as any).ResizeObserver(fit).observe(frame);

  if ('IntersectionObserver' in win) {
    new (win as any).IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      visible = entries[0]?.isIntersecting ?? true;
      update();
    }).observe(frame);
  }

  // #demo=9 opens paused at second 9. Reduced motion starts paused on the organized note.
  const hash = /demo=([\d.]+)/.exec(win.location.hash);
  const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (hash) { seek(Number(hash[1])); setPlaying(false); }
  else if (reduced) { seek(8.8); setPlaying(false); }
  else { seek(0); setPlaying(true); }

  return { seek, setPlaying, get time() { return time; }, get playing() { return playing; } };
}
