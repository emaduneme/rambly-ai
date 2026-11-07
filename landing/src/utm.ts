export type Utm = { utm_source: string; utm_medium: string; utm_campaign: string };

export function readUtm(search: string): Utm {
    const params = new URLSearchParams(search);
    return {
        utm_source: params.get('utm_source') ?? '',
        utm_medium: params.get('utm_medium') ?? '',
        utm_campaign: params.get('utm_campaign') ?? '',
    };
}
