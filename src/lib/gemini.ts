// The Gemini SDK is now safely isolated on the backend in the /api directory.
// This file simply provides the frontend interfaces to interact with our secure Serverless endpoints.

function handleApiError(error: any): never {
  if (error?.name === 'AbortError') {
    throw error;
  }
  console.error('API Error:', error);
  if (error?.status === 429) {
    throw new Error('You have hit your Gemini API rate limit. Please try again later. ⏳');
  }
  if (error?.status === 402 || error?.status === 403) {
    throw new Error('Failed to access the Gemini API. Please verify your API key and billing status. 🔑');
  }
  if (error?.message) {
    throw new Error(`AI Processing Error: ${error.message}`);
  }
  throw new Error('An unexpected error occurred while contacting the AI model. ⚠️');
}

export async function transcribeAudio(audioBase64: string, mimeType: string, signal?: AbortSignal): Promise<string> {
  try {
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audioBase64, mimeType }),
      signal
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw { status: response.status, message: data.error || `Transcription failed (${response.status})` };
    }

    const text = await response.text();
    if (!text) {
      throw new Error('Received an empty response from transcription. Please try recording again.');
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Received an invalid response from transcription. Please try again.');
    }

    return data.transcript || '';
  } catch (error: any) {
    handleApiError(error);
  }
}

// Removed `polishNote` as it's no longer used; unified under `processNoteStream`

import { FidelityLevel, ContextProfile } from './contexts';

// Unified streaming function that handles all fidelity levels and contexts
export async function processNoteStream(
  rawText: string,
  fidelity: FidelityLevel,
  contextProfile: ContextProfile | null,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  try {
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawText, fidelity, contextProfile }),
      signal
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw { status: response.status, message: data.error || 'Failed to process note' };
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported in this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunkText = decoder.decode(value, { stream: true });
      fullText += chunkText;
      onChunk(fullText);
    }

    return fullText;
  } catch (error: any) {
    handleApiError(error);
  }
}

