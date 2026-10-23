// Fixed-window, in-memory rate limit. On the edge runtime this resets per
// instance, which is enough to slow down a casual flood during the test.

export function createRateLimiter(opts: { limit: number; windowMs: number }) {
    const windows = new Map<string, { start: number; count: number }>();

    return function allow(key: string, nowMs: number = Date.now()): boolean {
        const current = windows.get(key);
        if (!current || nowMs - current.start > opts.windowMs) {
            windows.set(key, { start: nowMs, count: 1 });
            return true;
        }
        if (current.count >= opts.limit) return false;
        current.count++;
        return true;
    };
}
