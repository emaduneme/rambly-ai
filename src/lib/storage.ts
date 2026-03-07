import { ContextProfile } from './contexts';

export interface Note {
    id: string;
    content: string;
    rawContent?: string;
    createdAt: number;
    contextName?: string;
}

const STORAGE_KEY = 'rambly_notes_history_v1';
const HAS_SEEDED_KEY = 'rambly_has_seeded_demo_data';

const SEED_DATA: Note[] = [
    {
        id: 'seed-1',
        content: "Just finished testing the new user onboarding flow. The drop-off rate between step 2 and 3 is still too high. I think we need to simplify the permission request screen or move it later in the funnel. Let's schedule a quick sync with design tomorrow to look at alternative layouts.",
        createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        contextName: 'Business Notes'
    },
    {
        id: 'seed-2',
        content: "The concept of 'collective efficacy' in neighborhood revitalization is fascinating. It's not just about social cohesion (knowing your neighbors), but the shared expectation that residents will intervene for the common good. Need to look up Sampson's 1997 paper on this to cite in the lit review.",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
        contextName: 'Academic Writing'
    },
    {
        id: 'seed-3',
        content: "I've been thinking about why some habits stick and others don't. It really comes down to friction. If the good habit requires 5 steps and the bad habit requires 1, the bad habit wins every time. I need to redesign my environment, not just rely on willpower.",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
        contextName: 'Personal Journal'
    }
];

export const storage = {
    getNotes: (): Note[] => {
        try {
            // Seed data if this is the very first time loading (great for hackathon judges!)
            if (!localStorage.getItem(HAS_SEEDED_KEY)) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
                localStorage.setItem(HAS_SEEDED_KEY, 'true');
                return SEED_DATA;
            }

            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];

            const parsed = JSON.parse(data) as Note[];
            // Sort newest first
            return parsed.sort((a, b) => b.createdAt - a.createdAt);
        } catch (e) {
            console.error('Failed to load notes from local storage', e);
            return [];
        }
    },

    saveNote: (content: string, contextProfile: ContextProfile | null, rawContent?: string): Note => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            content,
            rawContent,
            createdAt: Date.now(),
            contextName: contextProfile?.name || 'Default (Neutral)'
        };

        try {
            const existing = storage.getNotes();
            const updated = [newNote, ...existing];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return newNote;
        } catch (e) {
            console.error('Failed to save note to local storage', e);
            return newNote; // Return anyway so UI can update optimistically if desired
        }
    },

    deleteNote: (id: string): void => {
        try {
            const existing = storage.getNotes();
            const updated = existing.filter(note => note.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to delete note from local storage', e);
        }
    }
};
