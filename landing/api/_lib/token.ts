// Short-lived signed token that lets step 2 update only the signup it came from.
// Format: base64url(email).issuedAtMs.base64url(HMAC-SHA256(secret, email + "." + issuedAtMs))

export const TOKEN_TTL_MS = 60 * 60 * 1000;

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array | null {
    if (!/^[A-Za-z0-9_-]*$/.test(text)) return null;
    try {
        const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
        return Uint8Array.from(binary, (c) => c.charCodeAt(0));
    } catch {
        return null;
    }
}

async function hmac(secret: string, message: string): Promise<Uint8Array> {
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(message)));
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
}

export async function signToken(email: string, secret: string, nowMs: number = Date.now()): Promise<string> {
    const issuedAt = String(nowMs);
    const sig = await hmac(secret, `${email}.${issuedAt}`);
    return `${toBase64Url(encoder.encode(email))}.${issuedAt}.${toBase64Url(sig)}`;
}

export async function verifyToken(token: string, secret: string, nowMs: number = Date.now()): Promise<string | null> {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [emailPart, issuedAt, sigPart] = parts;
    if (!/^\d+$/.test(issuedAt)) return null;

    const emailBytes = fromBase64Url(emailPart);
    const sig = fromBase64Url(sigPart);
    if (!emailBytes || !sig || emailBytes.length === 0) return null;

    const age = nowMs - Number(issuedAt);
    if (age < 0 || age > TOKEN_TTL_MS) return null;

    const email = new TextDecoder().decode(emailBytes);
    const expected = await hmac(secret, `${email}.${issuedAt}`);
    return constantTimeEqual(sig, expected) ? email : null;
}
