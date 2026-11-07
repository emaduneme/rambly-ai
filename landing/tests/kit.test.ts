import { beforeEach, expect, test } from 'vitest';
import { createKitClient, KitError } from '../api/_lib/kit';

type Sent = { method: string; url: string; headers: Record<string, string>; body: unknown; hasSignal: boolean };
let sent: Sent[];
let replies: Array<{ status: number; body?: unknown } | Error>;

const fakeFetch = (async (url: string, init: RequestInit) => {
  sent.push({
    method: String(init.method),
    url,
    headers: init.headers as Record<string, string>,
    body: init.body ? JSON.parse(String(init.body)) : undefined,
    hasSignal: init.signal instanceof AbortSignal,
  });
  const reply = replies.shift() ?? { status: 200, body: {} };
  if (reply instanceof Error) throw reply;
  return new Response(JSON.stringify(reply.body ?? {}), { status: reply.status });
}) as unknown as typeof fetch;

const kit = () => createKitClient({ apiKey: ' kit_abc ', formId: '10085449', fetch: fakeFetch });

beforeEach(() => { sent = []; replies = []; });

test('subscribe creates an unconfirmed subscriber, then adds them to the form', async () => {
  replies.push({ status: 201 }, { status: 201 });
  await kit().subscribe('ana@uni.edu', { utm_source: 'reddit', signup_date: '2026-10-24' }, 'https://rambly.test/?utm_source=reddit');
  expect(sent.map((s) => [s.method, s.url, s.body])).toEqual([
    ['POST', 'https://api.kit.com/v4/subscribers',
      { email_address: 'ana@uni.edu', state: 'inactive', fields: { utm_source: 'reddit', signup_date: '2026-10-24' } }],
    ['POST', 'https://api.kit.com/v4/forms/10085449/subscribers',
      { email_address: 'ana@uni.edu', referrer: 'https://rambly.test/?utm_source=reddit' }],
  ]);
});

test('every call sends the trimmed API key and a timeout signal', async () => {
  await kit().tag('ana@uni.edu', 2);
  expect(sent[0].headers['X-Kit-Api-Key']).toBe('kit_abc');
  expect(sent[0].hasSignal).toBe(true);
});

test('subscribe succeeds when the person is already on the form (200)', async () => {
  replies.push({ status: 200 }, { status: 200 });
  await expect(kit().subscribe('ana@uni.edu', {}, '')).resolves.toBeUndefined();
});

test('subscribe rejects with KitError carrying the status when Kit returns 500', async () => {
  replies.push({ status: 500, body: { errors: ['boom'] } });
  const error = await kit().subscribe('ana@uni.edu', {}, '').catch((e) => e);
  expect(error).toBeInstanceOf(KitError);
  expect(error.status).toBe(500);
  expect(sent).toHaveLength(1);
});

test('a network failure or timeout becomes KitError with status 0', async () => {
  replies.push(new TypeError('fetch failed'));
  const error = await kit().subscribe('ana@uni.edu', {}, '').catch((e) => e);
  expect(error).toBeInstanceOf(KitError);
  expect(error.status).toBe(0);
});

test('updateFields upserts only the given fields', async () => {
  await kit().updateFields('ana@uni.edu', { role: 'phd' });
  expect(sent.map((s) => [s.method, s.url, s.body])).toEqual([
    ['POST', 'https://api.kit.com/v4/subscribers', { email_address: 'ana@uni.edu', fields: { role: 'phd' } }],
  ]);
});

test('tag adds the tag by email', async () => {
  await kit().tag('ana@uni.edu', 24922176);
  expect(sent.map((s) => [s.method, s.url, s.body])).toEqual([
    ['POST', 'https://api.kit.com/v4/tags/24922176/subscribers', { email_address: 'ana@uni.edu' }],
  ]);
});
