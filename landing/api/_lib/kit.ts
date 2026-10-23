// Kit API v4 client. The calls are filled in by plan Task 5, after the Task 1
// check confirms how Kit sends the double opt-in email (landing/KIT-CHECK.md).

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

export function createKitClient(_opts: { apiKey: string; formId: string; fetch?: typeof fetch }): KitClient {
    const notReady = async (): Promise<never> => {
        throw new KitError('Kit client not implemented until the Kit API check (plan Task 1) is done', 503);
    };
    return { subscribe: notReady, updateFields: notReady, tag: notReady };
}
