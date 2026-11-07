// Parses and validates the JSON body sent to /api/subscribe.

export const ROLES = ['masters', 'phd', 'faculty', 'staff_researcher', 'other'] as const;
export const USES = ['drafting', 'ideas', 'teaching', 'personal', 'other'] as const;
export type Role = (typeof ROLES)[number];
export type Use = (typeof USES)[number];

export type Utm = { utm_source: string; utm_medium: string; utm_campaign: string };
export type Step1 = { email: string; honeypot: boolean; utm: Utm; pageUrl: string };
export type Step2 = { token: string; role: Role | null; useCase: Use | null };

export type ParsedRequest =
    | { kind: 'step1'; data: Step1 }
    | { kind: 'step2'; data: Step2 }
    | { kind: 'invalid'; error: 'invalid_email' | 'invalid_request' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_UTM_LENGTH = 100;
const MAX_URL_LENGTH = 2000;

const INVALID_REQUEST: ParsedRequest = { kind: 'invalid', error: 'invalid_request' };

export function normalizeEmail(raw: unknown): string | null {
    if (typeof raw !== 'string') return null;
    const email = raw.trim().toLowerCase();
    if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) return null;
    return email;
}

function cleanText(raw: unknown, maxLength: number): string {
    return typeof raw === 'string' ? raw.trim().slice(0, maxLength) : '';
}

function pickOne<T extends string>(raw: unknown, allowed: readonly T[]): T | null | undefined {
    if (raw === undefined || raw === null || raw === '') return null;
    return allowed.includes(raw as T) ? (raw as T) : undefined;
}

export function parseRequest(body: unknown): ParsedRequest {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) return INVALID_REQUEST;
    const b = body as Record<string, unknown>;

    if (b.step === 2) {
        if (typeof b.token !== 'string' || b.token === '') return INVALID_REQUEST;
        const role = pickOne(b.role, ROLES);
        const useCase = pickOne(b.use_case, USES);
        if (role === undefined || useCase === undefined) return INVALID_REQUEST;
        return { kind: 'step2', data: { token: b.token, role, useCase } };
    }

    const email = normalizeEmail(b.email);
    if (!email) return { kind: 'invalid', error: 'invalid_email' };

    return {
        kind: 'step1',
        data: {
            email,
            honeypot: typeof b.website === 'string' && b.website.trim() !== '',
            utm: {
                utm_source: cleanText(b.utm_source, MAX_UTM_LENGTH),
                utm_medium: cleanText(b.utm_medium, MAX_UTM_LENGTH),
                utm_campaign: cleanText(b.utm_campaign, MAX_UTM_LENGTH),
            },
            pageUrl: cleanText(b.page_url, MAX_URL_LENGTH),
        },
    };
}
