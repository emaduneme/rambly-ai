// @vitest-environment jsdom
import { beforeEach, expect, test } from 'vitest';
import { loadAnalytics } from '../src/analytics';

beforeEach(() => { document.head.innerHTML = ''; });

test('adds the Umami script with the website id', () => {
  loadAnalytics('abc-123');
  const script = document.head.querySelector('script')!;
  expect(script.src).toBe('https://cloud.umami.is/script.js');
  expect(script.dataset.websiteId).toBe('abc-123');
  expect(script.defer).toBe(true);
});

test('does nothing without a website id', () => {
  loadAnalytics(undefined);
  loadAnalytics('');
  expect(document.head.querySelector('script')).toBeNull();
});
