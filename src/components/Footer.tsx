import React, { useEffect, useRef } from 'react';
import { Mic, Square, Trash2, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ContextSelector } from './ContextSelector';
import { ContextProfile } from '../lib/contexts';

interface FooterProps {
  isRecording: boolean;
  recordingTime: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClear: () => void;
  isProcessing: boolean;
  analyser: AnalyserNode | null;
  hasContent: boolean;
  activeContext: ContextProfile | null;
  onSelectContext: (context: ContextProfile | null) => void;
}

export const Footer: React.FC<FooterProps> = ({
  isRecording,
  recordingTime,
  onStartRecording,
  onStopRecording,
  onClear,
  isProcessing,
  analyser,
  hasContent,
  activeContext,
  onSelectContext
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!analyser || !canvasRef.current || !isRecording) {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      // Clear canvas when not recording
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw elegant center-aligned bars
      const barCount = 40;
      const barWidth = 3;
      const gap = 3;
      const totalWidth = barCount * (barWidth + gap);
      const startX = (canvas.width - totalWidth) / 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const barHeight = (dataArray[dataIndex] / 255) * (canvas.height * 0.7);

        const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.6)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(
          startX + i * (barWidth + gap),
          centerY - barHeight / 2,
          barWidth,
          Math.max(barHeight, 2),
          1.5
        );
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser, isRecording]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 pt-3 pb-safe sm:pt-5 z-50 flex justify-center pointer-events-none">
      <div className="bg-white/95 backdrop-blur-2xl border border-gray-200/60 rounded-2xl shadow-2xl shadow-indigo-900/5 p-3 sm:p-5 flex flex-col items-center pointer-events-auto w-full max-w-[95%] sm:max-w-lg transition-all duration-300">

        {/* Visualizer */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
              className="w-full mb-2 sm:mb-3 overflow-hidden"
            >
              <canvas
                ref={canvasRef}
                width={400}
                height={40}
                className="w-full h-10"
                aria-hidden="true"
                role="presentation"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="mb-2 sm:mb-3 font-mono text-base sm:text-lg font-medium text-indigo-500 tabular-nums"
            >
              {formatTime(recordingTime)}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between w-full px-4 sm:px-8 gap-4">
          {/* Clear / Cancel / New Note Button (Left block) */}
          <div className="flex-1 flex justify-start min-w-[70px]">
            <button
              onClick={onClear}
              aria-label={isProcessing ? "Cancel processing" : hasContent ? "Start a new note" : "Clear"}
              className={cn(
                "px-3 py-2 rounded-2xl transition-all duration-200 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
                isProcessing
                  ? "text-red-400 hover:text-red-600 hover:bg-red-50"
                  : hasContent && !isRecording
                    ? "text-gray-500 hover:text-[#1A1A2E] hover:bg-gray-100"
                    : "text-gray-200 cursor-not-allowed"
              )}
              title={isProcessing ? "Cancel Processing" : hasContent ? "New Note" : "Clear"}
              disabled={isRecording || (!hasContent && !isProcessing)}
            >
              {isProcessing ? (
                <>
                  <X size={20} />
                  <span className="hidden sm:inline text-xs font-semibold">Cancel</span>
                </>
              ) : hasContent ? (
                <>
                  <Plus size={20} strokeWidth={2.5} />
                  <span className="hidden sm:inline text-xs font-semibold">New</span>
                </>
              ) : (
                <Trash2 size={20} />
              )}
            </button>
          </div>

          {/* Main Record Button (Center block) */}
          <div className="flex-shrink-0 relative">
            {/* Pulsing ring */}
            {isRecording && !prefersReducedMotion && (
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500"
              />
            )}
            <button
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={isProcessing}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
              aria-pressed={isRecording}
              className={cn(
                "relative z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
                isRecording
                  ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-200"
                  : isProcessing
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
              )}
            >
              {isRecording ? (
                <Square size={20} fill="currentColor" className="rounded-sm" />
              ) : (
                <Mic size={24} />
              )}
            </button>
          </div>

          {/* Persona Selector (Right block) */}
          <div className="flex-1 flex justify-end min-w-[70px]">
            <ContextSelector
              activeContext={activeContext}
              onSelectContext={onSelectContext}
              disabled={isRecording || isProcessing}
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-400 font-medium" role="status" aria-live="polite">
          {isProcessing
            ? 'Processing your thoughts...'
            : isRecording
              ? 'Recording — tap to stop'
              : 'Tap to record'}
        </div>
      </div>
    </footer>
  );
};
