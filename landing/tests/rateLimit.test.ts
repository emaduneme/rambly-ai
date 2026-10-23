import { expect, test } from 'vitest';
import { createRateLimiter } from '../api/_lib/rateLimit';

test('allows 5 then blocks, per key, and resets after the window', () => {
  const allow = createRateLimiter({ limit: 5, windowMs: 1000 });
  for (let i = 0; i < 5; i++) expect(allow('1.1.1.1', 0)).toBe(true);
  expect(allow('1.1.1.1', 0)).toBe(false);
  expect(allow('2.2.2.2', 0)).toBe(true);
  expect(allow('1.1.1.1', 1001)).toBe(true);
});
