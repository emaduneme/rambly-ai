import { GoogleGenAI } from '@google/genai';

const MODEL_NAME_TEXT = 'gemini-3-flash-preview';
const MAX_RAW_TEXT_CHARS = 20000;
const MAX_CONTEXT_INSTRUCTION_CHARS = 600;
const ALLOWED_FIDELITY = new Set(['raw', 'light', 'standard', 'full']);

export const config = {
    runtime: 'edge', // Use Edge runtime for better streaming performance
};

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { rawText, fidelity, contextProfile } = await req.json();

        if (!rawText || !fidelity) {
            return new Response(JSON.stringify({ error: 'Missing rawText or fidelity' }), { status: 400 });
        }
        if (typeof rawText !== 'string' || typeof fidelity !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid request payload' }), { status: 400 });
        }
        if (!ALLOWED_FIDELITY.has(fidelity)) {
            return new Response(JSON.stringify({ error: 'Invalid fidelity value' }), { status: 400 });
        }
        if (rawText.length > MAX_RAW_TEXT_CHARS) {
            return new Response(JSON.stringify({ error: 'Raw text too large' }), { status: 413 });
        }

        let fidelityInstructions = '';

        switch (fidelity) {
            case 'raw':
                fidelityInstructions = `
Your goal is to make it readable while keeping it almost exactly as dictated.
- Fix obvious typos or misheard words
- Add basic capitalization and punctuation
- Keep all paragraphs and the original flow
- Do NOT summarize or add a TL;DR
- Do NOT remove the original voice or substantive details
- If there are obvious stutters or repeats, you may remove only the completely broken grammar. Keep it clean and simple.
- EVERY output must start with a # Title that summarizes the note.`;
                break;
            case 'light':
                fidelityInstructions = `
Your goal is to perform a light edit, polishing the text while maintaining the original structure.
- Remove ALL filler words (um, uh, like, you know)
- Remove false starts, repetitions, and verbal stammering
- Fix grammar naturally without changing the speaker's voice
- Preserve the original paragraph layout and overall flow
- Do NOT summarize or add a TL;DR
- Do NOT summarize or add a TL;DR
- Maintain all original ideas and nuances.
- EVERY output must start with a # Title that summarizes the note.`;
                break;
            case 'standard':
                fidelityInstructions = `
Your goal is to perform a standard edit, transforming the raw text into a coherent note.
- Remove all filler words, false starts, and repetitions
- Restructure sentences for better clarity and flow if needed
- Structure into clear paragraphs (2-3 sentences max)
- Add markdown headings if the content warrants it
- Maintain all original ideas and meaning — never add new information.
- Do NOT add a TL;DR unless explicitly asked.
- EVERY output must start with a # Title that summarizes the note.`;
                break;
            case 'full':
                fidelityInstructions = `
Your goal is to act as a world-class editor and perform a full rewrite for maximum clarity, impact, and structure.
- Completely rewrite the text for optimal flow and readability while keeping the core message
- Remove all conversational filler, tangents, and redundancies
- Organize into highly structured sections with markdown headings, bullet points, or numbered lists
- Keep paragraphs short and punchy
- Add a brief, bold **TL;DR** at the very top summarizing the key point in one sentence
- Maintain the original meaning but elevate the prose significantly.
- EVERY output must start with a # Title that summarizes the note.`;
                break;
        }

        const contextInstruction = contextProfile?.instruction && typeof contextProfile.instruction === 'string'
            ? contextProfile.instruction.slice(0, MAX_CONTEXT_INSTRUCTION_CHARS)
            : null;

        const contextInstructions = contextInstruction
            ? `\nCONTEXT INSTRUCTION:\n${contextInstruction}\n`
            : `\nCONTEXT INSTRUCTION:\nNo specific context provided. Use a neutral, clear voice.\n`;

        const prompt = `You are a world-class editor and AI assistant. 
Take the following raw voice transcription and process it according to the specified constraints.

FIDELITY CONSTRAINTS:
${fidelityInstructions}
${contextInstructions}

Raw transcription:
${rawText}`;

        const responseStream = await ai.models.generateContentStream({
            model: MODEL_NAME_TEXT,
            contents: {
                parts: [{ text: prompt }]
            }
        });

        // Create a ReadableStream to stream the chunks back to the client
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of responseStream) {
                        const chunkText = chunk.text || '';
                        if (chunkText) {
                            // We send raw text chunks as string encoding isn't needed with direct text streams
                            controller.enqueue(new TextEncoder().encode(chunkText));
                        }
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error: any) {
        console.error('API Error:', error);
        const status = error?.status || 500;
        const message = error?.message || 'Failed to process text stream';
        return new Response(JSON.stringify({ error: message }), { status });
    }
}
