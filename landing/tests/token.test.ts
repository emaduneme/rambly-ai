import { expect, test } from 'vitest';
import { signToken, verifyToken, TOKEN_TTL_MS } from '../api/_lib/token';

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
