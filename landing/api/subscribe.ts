import { createKitClient, type KitClient } from './_lib/kit';
import { createRateLimiter } from './_lib/rateLimit';
import { signToken, verifyToken } from './_lib/token';
import { parseRequest, type Role } from './_lib/validate';

export const config = {
    runtime: 'edge',
};

export type SubscribeDeps = {
    kit: KitClient;
    secret: string;
    roleTags: Record<Role, number>;
    allow: (key: string) => boolean;
    now: () => number;
};

// 5 signups per IP per 10 minutes. Lives as long as the edge instance does.
const allowSignup = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

function json(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function clientIp(req: Request): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}

export async function handleSubscribe(req: Request, deps: SubscribeDeps): Promise<Response> {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return json(400, { error: 'invalid_request' });
    }

    const parsed = parseRequest(body);
    if (parsed.kind === 'invalid') return json(400, { error: parsed.error });

    if (parsed.kind === 'step1') {
        const { email, honeypot, utm, pageUrl } = parsed.data;
        // Bots get the same answer as people, so they learn nothing.
        if (honeypot) return json(200, { ok: true, token: null });
        if (!deps.allow(clientIp(req))) return json(429, { error: 'rate_limited' });

        const signupDate = new Date(deps.now()).toISOString().slice(0, 10);
        try {
            await deps.kit.subscribe(email, { ...utm, signup_date: signupDate }, pageUrl);
        } catch (error) {
            console.error('Kit subscribe failed:', error);
            return json(502, { error: 'upstream' });
        }
        return json(200, { ok: true, token: await signToken(email, deps.secret, deps.now()) });
    }

    const { token, role, useCase } = parsed.data;
    const email = await verifyToken(token, deps.secret, deps.now());
    if (!email) return json(401, { error: 'invalid_token' });

    const fields: Record<string, string> = {};
    if (role) fields.role = role;
    if (useCase) fields.use_case = useCase;
    if (Object.keys(fields).length === 0) return json(200, { ok: true });

    try {
        await deps.kit.updateFields(email, fields);
        if (role) await deps.kit.tag(email, deps.roleTags[role]);
    } catch (error) {
        console.error('Kit update failed:', error);
        return json(502, { error: 'upstream' });
    }
    return json(200, { ok: true });
}

// KIT_ROLE_TAGS is JSON mapping each role to its Kit tag ID, e.g. {"masters":1,"phd":2,...}
function parseRoleTags(raw: string | undefined): Record<Role, number> | null {
    try {
        const parsed = JSON.parse(raw || '');
        return typeof parsed === 'object' && parsed !== null ? parsed : null;
    } catch {
        return null;
    }
}

export async function POST(req: Request): Promise<Response> {
    const { KIT_API_KEY, KIT_FORM_ID, KIT_ROLE_TAGS, SIGNUP_TOKEN_SECRET } = process.env;
    const roleTags = parseRoleTags(KIT_ROLE_TAGS);
    if (!KIT_API_KEY || !KIT_FORM_ID || !SIGNUP_TOKEN_SECRET || !roleTags) {
        console.error('Missing or invalid Kit or token environment variables');
        return json(500, { error: 'upstream' });
    }

    return handleSubscribe(req, {
        kit: createKitClient({ apiKey: KIT_API_KEY, formId: KIT_FORM_ID }),
        secret: SIGNUP_TOKEN_SECRET,
        roleTags,
        allow: allowSignup,
        now: Date.now,
    });
}
