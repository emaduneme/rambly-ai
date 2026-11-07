// @vitest-environment jsdom
import { expect, test } from 'vitest';
import { CLICKS, FILLER, LOOP, initDemo, stateAt, step } from '../src/demo';

test('the spring starts at 0, settles at 1 and barely overshoots', () => {
  expect(step(0)).toBe(0);
  expect(step(-1)).toBe(0);
  expect(step(3)).toBeCloseTo(1, 4);
  let peak = 0;
  for (let t = 0; t < 2; t += 0.005) peak = Math.max(peak, step(t, 2.6, 0.85));
  expect(peak).toBeLessThan(1.02);
});

test('the last frame matches the first, so the loop has no jump', () => {
  const a = stateAt(0);
  const b = stateAt(LOOP - 0.0001);
  expect(b.shape.w).toBeCloseTo(a.shape.w, 1);
  expect(b.shape.h).toBeCloseTo(a.shape.h, 1);
  expect(b.shape.r).toBeCloseTo(a.shape.r, 1);
  expect(b.shape.color).toBe(a.shape.color);
  expect(b.cursor.x).toBeCloseTo(a.cursor.x, 1);
  expect(b.cursor.y).toBeCloseTo(a.cursor.y, 1);
  for (const k of Object.keys(a.layers) as (keyof typeof a.layers)[]) {
    expect(b.layers[k]).toBeCloseTo(a.layers[k], 2);
  }
});

test('each beat shows the right state', () => {
  const visible = (t: number) => {
    const { layers } = stateAt(t);
    return (Object.keys(layers) as (keyof typeof layers)[]).filter((k) => layers[k] > 0.9);
  };
  expect(visible(0.5)).toEqual(['record']);
  expect(stateAt(0.5).shape.color).toBe('rgb(140, 90, 134)');
  expect(visible(4)).toEqual(['recording']);
  expect(stateAt(5.5).words[FILLER[1]].strike).toBeGreaterThan(0.99);
  expect(visible(7)).toEqual(['loader']);
  expect(stateAt(7).shape.color).toBe('rgb(10, 10, 10)');
  expect(visible(9)).toEqual(['card']);
  expect(stateAt(9).pane.note).toBeCloseTo(1, 2);
  expect(stateAt(11.5).pane.actions).toBeCloseTo(1, 2);
  expect(stateAt(11.5).tick).toBeGreaterThan(0.99);
  expect(stateAt(CLICKS.tick - 0.1).tick).toBe(0);
  expect(visible(13)).toEqual(['toast']);
});

test('the demo has accessible controls and opens paused at #demo=9', () => {
  window.location.hash = '#demo=9';
  const root = document.createElement('div');
  document.body.append(root);
  const demo = initDemo(root);
  const stage = root.querySelector('[role="img"]')!;
  expect(stage.getAttribute('aria-label')).toMatch(/Record/);
  const play = root.querySelector<HTMLButtonElement>('[data-demo-play]')!;
  const scrub = root.querySelector<HTMLInputElement>('input[type="range"]')!;
  expect(scrub.getAttribute('aria-label')).toBe('Demo position');
  expect(demo.playing).toBe(false);
  expect(demo.time).toBeCloseTo(9, 2);
  expect(play.textContent).toBe('Play');
  play.click();
  expect(demo.playing).toBe(true);
  expect(play.textContent).toBe('Pause');
  demo.setPlaying(false);
});
