export type FidelityLevel = 'raw' | 'light' | 'standard' | 'full';

export const FIDELITY_LEVELS: Record<FidelityLevel, { label: string; description: string }> = {
    raw: { label: 'Raw', description: 'Clean transcript only, no restructuring.' },
    light: { label: 'Light', description: 'Fix grammar/fillers, preserve original flow.' },
    standard: { label: 'Standard', description: 'Restructure, add paragraphs, light editing.' },
    full: { label: 'Full', description: 'Full rewrite for clarity, add TL;DR.' }
};

export type ContextProfile = {
    id: string;
    name: string;
    instruction: string;
};

export const DEFAULT_CONTEXTS: ContextProfile[] = [
    {
        id: 'journal',
        name: 'Personal Journal',
        instruction: 'The user is journaling. Maintain a private, reflective, and conversational tone. Do not sound corporate or robotic.'
    },
    {
        id: 'academic',
        name: 'Academic Writing',
        instruction: 'The user is writing an academic piece or research memo. Preserve precise claims, use a formal tone, and ensure strong logical structure.'
    },
    {
        id: 'creator',
        name: 'Content Creator',
        instruction: 'The user is drafting content for an audience. Make it engaging, punchy, and highly readable while preserving their unique voice.'
    },
    {
        id: 'business',
        name: 'Business Notes',
        instruction: 'The user is making professional notes or memos. Output should be extremely concise, professional, and action-oriented.'
    }
];
