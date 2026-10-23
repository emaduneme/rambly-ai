import { expect, test } from 'vitest';
import { normalizeEmail, parseRequest } from '../api/_lib/validate';

test('normalizes email', () => expect(normalizeEmail('  Ana@Uni.EDU ')).toBe('ana@uni.edu'));

test.each(['ana@', '@uni.edu', 'ana uni.edu', '', 42, null])('rejects %j', (v) =>
  expect(normalizeEmail(v)).toBeNull());

test('rejects emails over 254 characters', () =>
  expect(normalizeEmail(`${'a'.repeat(250)}@b.co`)).toBeNull());

test('step1 with honeypot flags bot', () =>
  expect(parseRequest({ email: 'a@b.co', website: 'x' })).toMatchObject({ kind: 'step1', data: { honeypot: true } }));

test('step1 bad email', () =>
  expect(parseRequest({ email: 'nope' })).toEqual({ kind: 'invalid', error: 'invalid_email' }));

test('step1 utm defaults to empty strings', () =>
  expect(parseRequest({ email: 'a@b.co' })).toMatchObject({ data: { utm: { utm_source: '', utm_medium: '', utm_campaign: '' } } }));

test('step1 trims utm values and cuts them to 100 characters', () =>
  expect(parseRequest({ email: 'a@b.co', utm_source: ' reddit ', utm_campaign: 'x'.repeat(150) }))
    .toMatchObject({ data: { utm: { utm_source: 'reddit', utm_campaign: 'x'.repeat(100) } } }));

test('step1 keeps page url', () =>
  expect(parseRequest({ email: 'a@b.co', page_url: 'https://rambly.app/?utm_source=x' }))
    .toMatchObject({ data: { pageUrl: 'https://rambly.app/?utm_source=x', honeypot: false } }));

test('step2 accepts known values and skips', () => {
  expect(parseRequest({ step: 2, token: 't', role: 'phd', use_case: 'drafting' }))
    .toEqual({ kind: 'step2', data: { token: 't', role: 'phd', useCase: 'drafting' } });
  expect(parseRequest({ step: 2, token: 't' }))
    .toEqual({ kind: 'step2', data: { token: 't', role: null, useCase: null } });
});

test('step2 rejects unknown role', () =>
  expect(parseRequest({ step: 2, token: 't', role: 'dean' })).toEqual({ kind: 'invalid', error: 'invalid_request' }));

test('step2 rejects missing token', () =>
  expect(parseRequest({ step: 2, role: 'phd' })).toEqual({ kind: 'invalid', error: 'invalid_request' }));

test.each([null, 'text', 42, []])('rejects non-object body %j', (b) =>
  expect(parseRequest(b)).toEqual({ kind: 'invalid', error: 'invalid_request' }));
