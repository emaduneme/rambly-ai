import { expect, test } from 'vitest';
import { readUtm } from '../src/utm';

test('reads utm values and fills missing ones with empty strings', () => {
  expect(readUtm('?utm_source=reddit&utm_campaign=phd'))
    .toEqual({ utm_source: 'reddit', utm_medium: '', utm_campaign: 'phd' });
});

test('empty search gives all empty strings', () => {
  expect(readUtm('')).toEqual({ utm_source: '', utm_medium: '', utm_campaign: '' });
});
