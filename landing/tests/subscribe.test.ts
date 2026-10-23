import { beforeEach, expect, test } from 'vitest';
import { handleSubscribe, parseRoleTags } from '../api/subscribe';
import { KitError, type KitClient } from '../api/_lib/kit';
import { signToken } from '../api/_lib/token';

const SECRET = 'test-secret';
const NOW = Date.UTC(2026, 9, 22, 15, 0, 0);
const ROLE_TAGS = { masters: 1, phd: 2, faculty: 3, staff_researcher: 4, other: 5 };

type Call = [string, ...unknown[]];
let calls: Call[];
let failWith: Error | null;
let allowed: boolean;

const kit: KitClient = {
  async subscribe(...args) { calls.push(['subscribe', ...args]); if (failWith) throw failWith; },
  async updateFields(...args) { calls.push(['updateFields', ...args]); if (failWith) throw failWith; },
  async tag(...args) { calls.push(['tag', ...args]); if (failWith) throw failWith; },
};

beforeEach(() => { calls = []; failWith = null; allowed = true; });

function deps() {
  return { kit, secret: SECRET, roleTags: ROLE_TAGS, allow: () => allowed, now: () => NOW };
}

function post(body: unknown, ip = '1.2.3.4') {
  return new Request('https://rambly.test/api/subscribe', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': `${ip}, 10.0.0.1` },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

async function send(body: unknown) {
  const res = await handleSubscribe(post(body), deps());
  return { status: res.status, body: await res.json() };
}

test('step 1 subscribes with utm fields, signup date and referrer, and returns a token', async () => {
  const r = await send({ email: 'ana@uni.edu', website: '', utm_source: 'reddit', utm_medium: 'post', utm_campaign: 'phd', page_url: 'https://rambly.test/?utm_source=reddit' });
  expect(r.status).toBe(200);
  expect(r.body.ok).toBe(true);
  expect(typeof r.body.token).toBe('string');
  expect(calls).toEqual([['subscribe', 'ana@uni.edu',
    { utm_source: 'reddit', utm_medium: 'post', utm_campaign: 'phd', signup_date: '2026-10-22' },
    'https://rambly.test/?utm_source=reddit']]);
});

test('step 1 normalizes the email before Kit sees it', async () => {
  await send({ email: '  Ana@Uni.EDU ' });
  expect(calls[0][1]).toBe('ana@uni.edu');
});

test('same email twice succeeds both times', async () => {
  expect((await send({ email: 'ana@uni.edu' })).status).toBe(200);
  expect((await send({ email: 'ana@uni.edu' })).status).toBe(200);
});

test('honeypot returns fake success without calling Kit', async () => {
  const r = await send({ email: 'bot@spam.co', website: 'http://spam' });
  expect(r).toEqual({ status: 200, body: { ok: true, token: null } });
  expect(calls).toEqual([]);
});

test('invalid email is 400 invalid_email', async () => {
  expect(await send({ email: 'ana@' })).toEqual({ status: 400, body: { error: 'invalid_email' } });
  expect(calls).toEqual([]);
});

test('body that is not JSON is 400 invalid_request', async () => {
  expect(await send('{not json')).toEqual({ status: 400, body: { error: 'invalid_request' } });
});

test('step 1 over the rate limit is 429', async () => {
  allowed = false;
  expect(await send({ email: 'ana@uni.edu' })).toEqual({ status: 429, body: { error: 'rate_limited' } });
  expect(calls).toEqual([]);
});

test('rate limit is keyed on the first forwarded IP', async () => {
  const seen: string[] = [];
  await handleSubscribe(post({ email: 'ana@uni.edu' }, '9.9.9.9'), { ...deps(), allow: (k: string) => { seen.push(k); return true; } });
  expect(seen).toEqual(['9.9.9.9']);
});

test('Kit failure is 502 with no token', async () => {
  failWith = new KitError('down', 500);
  const r = await send({ email: 'ana@uni.edu' });
  expect(r).toEqual({ status: 502, body: { error: 'upstream' } });
});

test('network failure is 502', async () => {
  failWith = new TypeError('fetch failed');
  expect((await send({ email: 'ana@uni.edu' })).status).toBe(502);
});

test('step 2 updates fields and tags by role', async () => {
  const token = await signToken('ana@uni.edu', SECRET, NOW);
  const r = await send({ step: 2, token, role: 'phd', use_case: 'drafting' });
  expect(r).toEqual({ status: 200, body: { ok: true } });
  expect(calls).toEqual([
    ['updateFields', 'ana@uni.edu', { role: 'phd', use_case: 'drafting' }],
    ['tag', 'ana@uni.edu', 2],
  ]);
});

test('step 2 with only a role sends only the role', async () => {
  const token = await signToken('ana@uni.edu', SECRET, NOW);
  await send({ step: 2, token, role: 'phd' });
  expect(calls).toEqual([['updateFields', 'ana@uni.edu', { role: 'phd' }], ['tag', 'ana@uni.edu', 2]]);
});

test('step 2 with only a use does not tag', async () => {
  const token = await signToken('ana@uni.edu', SECRET, NOW);
  await send({ step: 2, token, use_case: 'ideas' });
  expect(calls).toEqual([['updateFields', 'ana@uni.edu', { use_case: 'ideas' }]]);
});

test('step 2 with nothing chosen is ok and calls nothing', async () => {
  const token = await signToken('ana@uni.edu', SECRET, NOW);
  expect(await send({ step: 2, token })).toEqual({ status: 200, body: { ok: true } });
  expect(calls).toEqual([]);
});

test('step 2 with a token signed 61 minutes ago is 401', async () => {
  const token = await signToken('ana@uni.edu', SECRET, NOW - 61 * 60 * 1000);
  expect(await send({ step: 2, token, role: 'phd' })).toEqual({ status: 401, body: { error: 'invalid_token' } });
  expect(calls).toEqual([]);
});

test('step 2 with a forged token is 401', async () => {
  const token = await signToken('ana@uni.edu', 'wrong-secret', NOW);
  expect((await send({ step: 2, token, role: 'phd' })).status).toBe(401);
});

test('step 2 Kit failure is 502', async () => {
  const token = await signToken('ana@uni.edu', SECRET, NOW);
  failWith = new KitError('down', 500);
  expect((await send({ step: 2, token, role: 'phd' })).status).toBe(502);
});

test('parseRoleTags accepts a map with a number for every role', () => {
  expect(parseRoleTags(JSON.stringify(ROLE_TAGS))).toEqual(ROLE_TAGS);
});

test.each([
  '', 'not json', '[]', '{"masters":1,"phd":2,"faculty":3,"staff_researcher":4}',
  '{"masters":1,"phd":"2","faculty":3,"staff_researcher":4,"other":5}',
])('parseRoleTags rejects %j', (raw) => {
  expect(parseRoleTags(raw)).toBeNull();
});
