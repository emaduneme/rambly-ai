import { GoogleGenAI } from '@google/genai';

const MODEL_NAME_AUDIO = 'gemini-2.5-flash';

export const config = {
    runtime: 'edge',
};

// Initialize on the server
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY || '',
});

export async function POST(req: Request) {
    try {
        const { audioBase64, mimeType } = await req.json();

        if (!audioBase64 || !mimeType) {
            return new Response(JSON.stringify({ error: 'Missing audio data or mimeType' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME_AUDIO,
            contents: {
                parts: [
                    { text: 'Generate a complete, detailed transcript of this audio. Preserve the speaker\'s intent and all substantive content. Do not add commentary — just transcribe.' },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: audioBase64,
                        },
                    },
                ],
            },
        });

        return new Response(JSON.stringify({ transcript: response.text || '' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('API Error:', error);
        const status = error?.status || 500;
        const message = error?.message || 'Failed to process audio';
        return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
