// @vitest-environment jsdom
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { beforeEach, expect, test, vi } from 'vitest';
import { initSignupForm, MESSAGES } from '../src/form';
import { initVideo } from '../src/video';

const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
const bodyHtml = html.slice(html.indexOf('<body'), html.indexOf('</body>'));

type Reply = { status: number; body: unknown } | Error;
let replies: Reply[];
let requests: { url: string; body: any }[];
let release: (() => void) | null;

function fakeFetch(): typeof fetch {
  return (async (url: string, init: RequestInit) => {
    requests.push({ url, body: JSON.parse(String(init.body)) });
    if (release === null) await new Promise<void>((r) => { release = r; });
    const reply = replies.shift()!;
    if (reply instanceof Error) throw reply;
    return new Response(JSON.stringify(reply.body), { status: reply.status });
  }) as unknown as typeof fetch;
}

const $ = <T extends Element>(sel: string) => document.querySelector<T>(sel)!;
const topForm = () => $<HTMLFormElement>('form[data-signup]');
const step2 = () => $<HTMLElement>('[data-step2]');
const status = () => topForm().querySelector('[data-status]')!.textContent;
const settle = () => new Promise((r) => setTimeout(r, 0));

async function submitEmail(email: string) {
  $<HTMLInputElement>('#email').value = email;
  topForm().dispatchEvent(new Event('submit', { cancelable: true }));
  await settle();
}

beforeEach(() => {
  document.body.outerHTML = bodyHtml;
  window.history.replaceState(null, '', '/?utm_source=reddit&utm_medium=post&utm_campaign=phd');
  replies = [];
  requests = [];
  release = () => {};
  initSignupForm(topForm(), step2(), fakeFetch());
});

test('posts email, honeypot, utm and page url to /api/subscribe once', async () => {
  replies.push({ status: 200, body: { ok: true, token: 'tok' } });
  await submitEmail('ana@uni.edu');
  expect(requests).toEqual([{ url: '/api/subscribe', body: {
    email: 'ana@uni.edu', website: '', utm_source: 'reddit', utm_medium: 'post', utm_campaign: 'phd',
    page_url: 'http://localhost:3000/?utm_source=reddit&utm_medium=post&utm_campaign=phd',
  } }]);
});

test('a second submit while waiting sends nothing and the button stays disabled', async () => {
  release = null;
  replies.push({ status: 200, body: { ok: true, token: 'tok' } });
  await submitEmail('ana@uni.edu');
  expect(topForm().querySelector('button')!.disabled).toBe(true);
  topForm().dispatchEvent(new Event('submit', { cancelable: true }));
  await settle();
  expect(requests).toHaveLength(1);
  release!();
  await settle();
  expect(topForm().querySelector('button')!.disabled).toBe(false);
});

test('success shows the message, hides the form, shows step 2 and focuses it', async () => {
  replies.push({ status: 200, body: { ok: true, token: 'tok' } });
  await submitEmail('ana@uni.edu');
  expect(step2().hidden).toBe(false);
  expect(topForm().hidden).toBe(true);
  expect(step2().querySelector('[data-step2-status]')!.textContent).toBe(MESSAGES.success);
  expect(document.activeElement).toBe(step2().querySelector('legend'));
});

test('honeypot success shows the message without step 2', async () => {
  replies.push({ status: 200, body: { ok: true, token: null } });
  await submitEmail('bot@spam.co');
  expect(status()).toBe(MESSAGES.success);
  expect(step2().hidden).toBe(true);
});

test.each([
  [{ status: 400, body: { error: 'invalid_email' } }, MESSAGES.invalid_email],
  [{ status: 429, body: { error: 'rate_limited' } }, MESSAGES.rate_limited],
  [{ status: 502, body: { error: 'upstream' } }, MESSAGES.upstream],
  [new TypeError('offline'), MESSAGES.upstream],
])('error %# shows its message, keeps the email and re-enables the button', async (reply, message) => {
  replies.push(reply as Reply);
  await submitEmail('ana@uni.edu');
  expect(status()).toBe(message);
  expect($<HTMLInputElement>('#email').value).toBe('ana@uni.edu');
  expect(topForm().querySelector('button')!.disabled).toBe(false);
  expect(topForm().hidden).toBe(false);
});

test('an obviously invalid email is caught before sending', async () => {
  await submitEmail('ana@');
  expect(requests).toHaveLength(0);
  expect(status()).toBe(MESSAGES.invalid_email);
});

async function reachStep2() {
  replies.push({ status: 200, body: { ok: true, token: 'tok' } });
  await submitEmail('ana@uni.edu');
}

function choose(name: string, value: string) {
  $<HTMLInputElement>(`input[name="${name}"][value="${value}"]`).checked = true;
}

test('step 2 save posts only the chosen values with the token', async () => {
  await reachStep2();
  replies.push({ status: 200, body: { ok: true } });
  choose('role', 'phd');
  $('[data-step2-form]').dispatchEvent(new Event('submit', { cancelable: true }));
  await settle();
  expect(requests[1].body).toEqual({ step: 2, token: 'tok', role: 'phd' });
  expect(step2().querySelector('[data-step2-status]')!.textContent).toBe(MESSAGES.saved);
});

test('step 2 skip sends nothing and thanks them', async () => {
  await reachStep2();
  $<HTMLButtonElement>('[data-step2-skip]').click();
  await settle();
  expect(requests).toHaveLength(1);
  expect(step2().querySelector('[data-step2-status]')!.textContent).toBe(MESSAGES.saved);
});

test('step 2 with an expired token says the answers did not save', async () => {
  await reachStep2();
  replies.push({ status: 401, body: { error: 'invalid_token' } });
  choose('use_case', 'ideas');
  $('[data-step2-form]').dispatchEvent(new Event('submit', { cancelable: true }));
  await settle();
  expect(step2().querySelector('[data-step2-status]')!.textContent).toBe(MESSAGES.invalid_token);
});

test('the video button swaps in a privacy-friendly YouTube player on click', () => {
  const button = $<HTMLButtonElement>('[data-video]');
  initVideo(button);
  button.click();
  const iframe = document.querySelector('iframe')!;
  expect(iframe.src).toBe('https://www.youtube-nocookie.com/embed/BzVev97bpjk?autoplay=1');
  expect(iframe.title).toBe('Rambly demo video');
  expect(document.querySelector('[data-video]')).toBeNull();
});
