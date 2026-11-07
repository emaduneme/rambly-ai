import { normalizeEmail } from '../api/_lib/validate';
import { readUtm } from './utm';

export const MESSAGES = {
    success: 'Almost done. Check your inbox and click the link to confirm.',
    invalid_email: "That email doesn't look right. Check it and try again.",
    rate_limited: 'Too many tries. Wait a few minutes and try again.',
    upstream: 'Something went wrong. Please try again.',
    invalid_token: "We couldn't save your answers. You're still signed up: check your inbox and click the link to confirm.",
    saved: 'Thanks. Now check your inbox and click the link to confirm your spot.',
} as const;

type Reply = { status: number; body: { token?: string | null; error?: string } };

async function postJson(fetchFn: typeof fetch, body: unknown): Promise<Reply | null> {
    try {
        const res = await fetchFn('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return { status: res.status, body: await res.json().catch(() => ({})) };
    } catch {
        return null;
    }
}

function errorMessage(reply: Reply | null): string {
    if (reply?.body.error === 'invalid_email') return MESSAGES.invalid_email;
    if (reply?.body.error === 'rate_limited') return MESSAGES.rate_limited;
    return MESSAGES.upstream;
}

export function initSignupForm(form: HTMLFormElement, step2: HTMLElement, fetchFn: typeof fetch = fetch): void {
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    const status = form.querySelector<HTMLElement>('[data-status]')!;
    let pending = false;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (pending) return;

        const data = new FormData(form);
        const email = normalizeEmail(data.get('email'));
        if (!email) {
            status.textContent = MESSAGES.invalid_email;
            return;
        }

        pending = true;
        button.disabled = true;
        status.textContent = '';
        const reply = await postJson(fetchFn, {
            email,
            website: String(data.get('website') ?? ''),
            ...readUtm(window.location.search),
            page_url: window.location.href,
        });
        pending = false;
        button.disabled = false;

        if (reply?.status !== 200) {
            status.textContent = errorMessage(reply);
            return;
        }
        if (!reply.body.token) {
            // Honeypot path: look the same as success, but skip step 2.
            status.textContent = MESSAGES.success;
            return;
        }
        form.hidden = true;
        showStep2(step2, reply.body.token, fetchFn);
    });
}

function showStep2(step2: HTMLElement, token: string, fetchFn: typeof fetch): void {
    const status = step2.querySelector<HTMLElement>('[data-step2-status]')!;
    const form = step2.querySelector<HTMLFormElement>('[data-step2-form]')!;
    const save = form.querySelector<HTMLButtonElement>('[data-step2-save]')!;
    const skip = form.querySelector<HTMLButtonElement>('[data-step2-skip]')!;

    step2.dataset.token = token;
    status.textContent = MESSAGES.success;
    step2.hidden = false;
    step2.querySelector<HTMLElement>('legend')?.focus();

    const finish = (message: string) => {
        form.hidden = true;
        status.textContent = message;
    };

    // Both signup forms share this panel; only wire it up once.
    if (step2.dataset.ready) return;
    step2.dataset.ready = 'true';

    skip.addEventListener('click', () => finish(MESSAGES.saved));
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (save.disabled) return;
        const data = new FormData(form);
        const body: Record<string, unknown> = { step: 2, token: step2.dataset.token };
        if (data.get('role')) body.role = data.get('role');
        if (data.get('use_case')) body.use_case = data.get('use_case');

        save.disabled = true;
        const reply = await postJson(fetchFn, body);
        save.disabled = false;

        if (reply?.status === 200) finish(MESSAGES.saved);
        else if (reply?.status === 401) finish(MESSAGES.invalid_token);
        else status.textContent = MESSAGES.upstream;
    });
}
