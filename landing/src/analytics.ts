// Umami Cloud (free Hobby plan, reports visitors by UTM source). Loads only when
// VITE_UMAMI_WEBSITE_ID is set, so local dev and previews send nothing.
export function loadAnalytics(websiteId: string | undefined): void {
    if (!websiteId) return;
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://cloud.umami.is/script.js';
    script.dataset.websiteId = websiteId;
    document.head.appendChild(script);
}
