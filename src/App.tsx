import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { NoteArea } from './components/NoteArea';
import { Footer } from './components/Footer';
import { Library } from './components/Library';
import { Landing } from './components/Landing';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { processNoteStream } from './lib/gemini';
import { storage, Note } from './lib/storage';
import { ContextProfile, FidelityLevel } from './lib/contexts';
import { motion, AnimatePresence } from 'framer-motion';

// Auto-dismiss errors after 5 seconds
const AUTO_DISMISS_MS = 5000;

export default function App() {
  const [hasStarted, setHasStarted] = useState(() => localStorage.getItem('rambly_has_started') === 'true');
  const [activeContext, setActiveContext] = useState<ContextProfile | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Store the processed text and its refinement state
  const [content, setContent] = useState<string>('');
  const [isRefined, setIsRefined] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<'idle' | 'transcribing' | 'polishing' | 'cleaning'>('idle');
  const [copied, setCopied] = useState(false);
  const [refreshLibraryTrigger, setRefreshLibraryTrigger] = useState(0);
  const [apiError, setApiError] = useState<string | null>(null);

  // Auto-dismiss API errors after 5 seconds
  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => setApiError(null), AUTO_DISMISS_MS);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  const processedAudioRef = useRef<Blob | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const rawTranscriptRef = useRef<string | null>(null);

  const {
    isRecording,
    recordingTime,
    audioBlob,
    analyser,
    error,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  // Auto-transcribe when recording stops and audioBlob is available
  const handleTranscribe = useCallback(async (blob: Blob) => {
    setApiError(null);
    setIsProcessing(true);
    setProcessingStage('transcribing');

    const currentAbortController = new AbortController();
    abortControllerRef.current = currentAbortController;

    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string;
          const base64Audio = base64data.split(',')[1];
          const mimeType = blob.type || 'audio/webm';

          // 1. Get base transcript (We treat this as the foundation)
          const { transcribeAudio } = await import('./lib/gemini');
          const transcription = await transcribeAudio(base64Audio, mimeType, currentAbortController.signal);
          rawTranscriptRef.current = transcription;

          // 2. Process with current context layout
          setProcessingStage('cleaning');
          setIsRefined(false);

          const finalContent = await processNoteStream(
            transcription,
            'raw',
            activeContext,
            (streamedText) => {
              setContent(streamedText);
            },
            currentAbortController.signal
          );

          // Save to Library history once generated
          const savedNote = storage.saveNote(finalContent, activeContext, rawTranscriptRef.current || undefined);
          setSelectedNote(savedNote);
          setRefreshLibraryTrigger(prev => prev + 1);

          setIsProcessing(false);
          setProcessingStage('idle');
          abortControllerRef.current = null;
        } catch (innerErr: any) {
          if (innerErr.name === 'AbortError') return;
          console.error('Inner processing failed', innerErr);
          setApiError(innerErr.message || 'An error occurred during processing.');
          setIsProcessing(false);
          setProcessingStage('idle');
          abortControllerRef.current = null;
        }
      };
    } catch (err: any) {
      console.error('Processing failed', err);
      setApiError(err.message || 'Failed to initialize processing.');
      setIsProcessing(false);
      setProcessingStage('idle');
      abortControllerRef.current = null;
    }
  }, [activeContext]);

  // Triggers when user clicks Refine Note
  const handleRefine = async () => {
    if (!content) return;

    setApiError(null);
    setIsProcessing(true);
    setProcessingStage('polishing');

    const currentAbortController = new AbortController();
    abortControllerRef.current = currentAbortController;

    try {
      const finalContent = await processNoteStream(
        content,
        'standard',
        activeContext,
        (streamedText) => {
          setContent(streamedText);
        },
        currentAbortController.signal
      );
      // Update the existing note in-place instead of creating a new one
      if (selectedNote?.id) {
        const updatedNote = storage.updateNote(selectedNote.id, finalContent);
        if (updatedNote) setSelectedNote(updatedNote);
      } else {
        const savedNote = storage.saveNote(finalContent, activeContext, rawTranscriptRef.current || undefined);
        setSelectedNote(savedNote);
      }
      setRefreshLibraryTrigger(prev => prev + 1);

      setIsRefined(true);
      setIsProcessing(false);
      setProcessingStage('idle');
      abortControllerRef.current = null;
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Processing failed:', err);
      setApiError(err.message || 'Failed to refine note.');
      setIsProcessing(false);
      setProcessingStage('idle');
      abortControllerRef.current = null;
    }
  };

  const hasAnyContent = content.length > 0;

  // Auto-process when audioBlob changes
  useEffect(() => {
    if (audioBlob && audioBlob !== processedAudioRef.current) {
      processedAudioRef.current = audioBlob;
      handleTranscribe(audioBlob);
    }
  }, [audioBlob, handleTranscribe]);

  const handleClear = () => {
    if (isProcessing) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setIsProcessing(false);
      setProcessingStage('idle');

      if (processingStage === 'transcribing' || processingStage === 'cleaning') {
        setContent('');
        setIsRefined(false);
        resetRecording();
        processedAudioRef.current = null;
      }
      setApiError(null);
      return;
    }

    setContent('');
    setIsRefined(false);
    setSelectedNote(null);
    resetRecording();
    setApiError(null);
    processedAudioRef.current = null;
    rawTranscriptRef.current = null;
  };

  const handleGoHome = () => {
    if (isProcessing) return;
    setContent('');
    setIsRefined(false);
    setSelectedNote(null);
    resetRecording();
    setApiError(null);
    processedAudioRef.current = null;
    rawTranscriptRef.current = null;
  };

  const handleSelectNote = (note: Note) => {
    setContent(note.content);
    setSelectedNote(note);
    setIsRefined(true); // Treat history notes as polished so they don't prompt for trivial refinement 
    setProcessingStage('idle');
  };

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDelete = () => {
    if (!content) return;

    // If it's a saved note, delete it from storage
    if (selectedNote?.id) {
      storage.deleteNote(selectedNote.id);
      setRefreshLibraryTrigger(prev => prev + 1);
    }

    // Clear the current view and go home
    handleGoHome();
  };

  if (!hasStarted) {
    return (
      <Landing onStart={() => {
        localStorage.setItem('rambly_has_started', 'true');
        setHasStarted(true);
      }} />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans text-[#1A1A2E]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col min-h-screen relative"
      >
        <Header
          onDelete={handleDelete}
          onGoHome={handleGoHome}
          onGoLanding={() => {
            localStorage.setItem('rambly_has_started', 'false');
            setHasStarted(false);
          }}
          hasContent={hasAnyContent}
          isProcessing={isProcessing}
        />

        <main className="flex-1 flex flex-col items-center justify-start w-full mt-2 sm:mt-6">

          {/* Error Toast — fixed position so always visible */}
          <AnimatePresence>
            {(error || apiError) && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg shadow-red-100/50 flex justify-between items-center gap-3"
                role="alert"
              >
                <p className="text-sm font-medium flex-1">{error || apiError}</p>
                <button
                  onClick={() => setApiError(null)}
                  className="text-red-400 hover:text-red-600 font-medium text-xs px-2 py-1 bg-red-100/60 hover:bg-red-100 rounded-lg transition-colors shrink-0"
                >
                  Dismiss
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <NoteArea
            content={content}
            onContentChange={setContent}
            onCopy={handleCopy}
            onRefine={content ? handleRefine : undefined}
            onStartRecording={startRecording}
            onGoBack={selectedNote ? handleGoHome : undefined}
            copied={copied}
            isProcessing={isProcessing}
            processingStage={processingStage}
            noteDate={selectedNote?.createdAt}
            contextName={selectedNote?.contextName}
            rawContent={selectedNote?.rawContent || rawTranscriptRef.current || undefined}
          />

          {!hasAnyContent && !isRecording && processingStage === 'idle' && (
            <Library onSelectNote={handleSelectNote} triggerRefresh={refreshLibraryTrigger} />
          )}
        </main>

        <Footer
          isRecording={isRecording}
          recordingTime={recordingTime}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onClear={handleClear}
          isProcessing={isProcessing}
          analyser={analyser}
          hasContent={hasAnyContent}
          activeContext={activeContext}
          onSelectContext={setActiveContext}
        />
      </motion.div>
    </div>
  );
}
