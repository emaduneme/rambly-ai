import { readFileSync } from 'fs';
import { resolve } from 'path';
import { expect, test } from 'vitest';

const privacy = readFileSync(resolve(__dirname, '../privacy.html'), 'utf8');

test('privacy page discloses the analytics tool', () => expect(privacy).toMatch(/Umami/));
test('privacy page no longer mentions a YouTube embed', () => expect(privacy).not.toMatch(/YouTube/));
