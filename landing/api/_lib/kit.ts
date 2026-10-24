// Kit API v4 client. The calls follow landing/KIT-CHECK.md: creating the subscriber
// as inactive and then adding them to the form makes Kit send the confirmation email.

const BASE_URL = 'https://api.kit.com/v4';
const TIMEOUT_MS = 10_000;

export class KitError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = 'KitError';
    }
}

export interface KitClient {
    subscribe(email: string, fields: Record<string, string>, referrer: string): Promise<void>;
    updateFields(email: string, fields: Record<string, string>): Promise<void>;
    tag(email: string, tagId: number): Promise<void>;
}

export function createKitClient(opts: { apiKey: string; formId: string; fetch?: typeof fetch }): KitClient {
    const fetchFn = opts.fetch ?? fetch;
    const apiKey = opts.apiKey.trim();

    // Any non-2xx reply throws with Kit's status; network errors and timeouts throw with status 0.
    async function post(path: string, body: unknown): Promise<void> {
        let res: Response;
        try {
            res = await fetchFn(BASE_URL + path, {
                method: 'POST',
                headers: { 'X-Kit-Api-Key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(TIMEOUT_MS),
            });
        } catch (error) {
            throw new KitError(`Kit request failed: POST ${path}: ${String(error)}`, 0);
        }
        if (!res.ok) {
            const detail = await res.text().catch(() => '');
            throw new KitError(`Kit returned ${res.status} for POST ${path}: ${detail}`, res.status);
        }
    }

    return {
        async subscribe(email, fields, referrer) {
            await post('/subscribers', { email_address: email, state: 'inactive', fields });
            await post(`/forms/${opts.formId}/subscribers`, { email_address: email, referrer });
        },
        async updateFields(email, fields) {
            await post('/subscribers', { email_address: email, fields });
        },
        async tag(email, tagId) {
            await post(`/tags/${tagId}/subscribers`, { email_address: email });
        },
    };
}
