import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Sparkles, ArrowLeft, Clock, Tag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteAreaProps {
  content: string;
  onContentChange: (content: string) => void;
  onCopy: () => void;
  onRefine?: () => void;
  onStartRecording?: () => void;
  onGoBack?: () => void;
  copied: boolean;
  isProcessing: boolean;
  processingStage: 'idle' | 'transcribing' | 'polishing' | 'cleaning';
  noteDate?: number;
  contextName?: string;
  rawContent?: string;
}

function formatNoteDate(ms: number): string {
  const date = new Date(ms);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const NoteArea: React.FC<NoteAreaProps> = ({
  content,
  onContentChange,
  onCopy,
  onRefine,
  onStartRecording,
  onGoBack,
  copied,
  isProcessing,
  processingStage,
  noteDate,
  contextName,
  rawContent
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isShowingRaw, setIsShowingRaw] = React.useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Empty state — compact so library notes are prominent
  if (!content && !isProcessing) {
    return (
      <div className="w-full max-w-2xl mx-auto px-6 pt-6 sm:pt-10 pb-4 text-center flex flex-col items-center gap-3">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A2E] tracking-tight">
          What's on your mind?
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-[340px] leading-relaxed">
          Click on the mic below to record and we'll polish your thoughts into clean notes.
        </p>
      </div>
    );
  }

  // Processing state
  if (isProcessing && !content) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 w-full min-h-[55vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-pulse" />
            <div className="absolute inset-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 animate-ping opacity-20" />
          </div>
          <p className="text-sm font-medium text-gray-400 tracking-wide">
            {processingStage === 'transcribing' && 'Listening to your thoughts...'}
            {processingStage === 'cleaning' && 'Organizing your notes...'}
            {processingStage === 'polishing' && 'Polishing your note...'}
            {processingStage === 'idle' && 'Processing...'}
          </p>
        </motion.div>
      </div>
    );
  }

  // Parse title from content if it exists
  let displayTitle = '';
  let displayBody = content;

  if (!isShowingRaw && content && content.startsWith('#')) {
    const lines = content.split('\n');
    displayTitle = lines[0].replace(/^#+\s*/, '').trim();
    displayBody = lines.slice(1).join('\n').trim();
  } else if (isShowingRaw) {
    displayTitle = 'Original Transcript';
    displayBody = rawContent || '';
  }

  return (
    <div className="flex-1 pt-4 pb-2 px-5 sm:px-8 max-w-[760px] mx-auto w-full relative">

      {/* Back button + Note metadata header */}
      {onGoBack && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <button
            onClick={onGoBack}
            className="flex items-center gap-1.5 text-[15px] font-medium text-gray-400 hover:text-indigo-600 transition-colors duration-200 group mb-4"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
            Back to library
          </button>

          {/* Top Row: Metadata and Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 mb-6 mt-2">
            {/* Left: Metadata */}
            {(noteDate || contextName) && (
              <div className="flex items-center gap-3 text-sm text-gray-400">
                {noteDate && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {formatNoteDate(noteDate)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 py-0.5 px-2.5 bg-indigo-50/50 rounded-md text-indigo-500 font-medium">
                  <Tag size={12} />
                  {contextName || 'Default (Neutral)'}
                </span>
              </div>
            )}

            {/* Right: Action Buttons */}
            {content && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                {rawContent && (
                  <motion.button
                    onClick={() => setIsShowingRaw(!isShowingRaw)}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border shadow-sm ${isShowingRaw
                      ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:border-orange-300'
                      : 'bg-white text-gray-500 hover:text-orange-500 border-gray-200 hover:border-orange-200'
                      }`}
                  >
                    {isShowingRaw ? 'View Final' : 'View Original'}
                  </motion.button>
                )}
                {!isShowingRaw && onRefine && (
                  <motion.button
                    onClick={onRefine}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-white text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 shadow-sm hover:shadow"
                  >
                    <Sparkles size={16} />
                    Polish further
                  </motion.button>
                )}
                <motion.button
                  onClick={onCopy}
                  whileTap={{ scale: 0.93 }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${copied
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm'
                    : 'bg-white text-gray-600 hover:text-[#1A1A2E] border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow'
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                        <Check size={16} />
                        Copied!
                      </motion.span>
                    ) : (
                      <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                        <Copy size={16} />
                        Copy
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            )}
          </div>

          {/* Title Row */}
          {displayTitle && (
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A2E] tracking-tight leading-tight mb-2">
              {displayTitle}
            </h1>
          )}
        </motion.div>
      )}

      {/* Main Content Body */}
      {displayBody && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`prose prose-base sm:prose-lg prose-slate max-w-none
            prose-headings:text-[#1A1A2E] prose-headings:font-semibold prose-headings:tracking-tight
            prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-[17px] sm:prose-p:text-[19px]
            prose-strong:text-[#1A1A2E] prose-strong:font-semibold
            prose-li:text-gray-600 prose-li:leading-relaxed
            prose-a:text-indigo-500
            prose-code:text-indigo-600 prose-code:bg-indigo-50 prose-code:px-1 prose-code:rounded
            ${!onGoBack ? 'mt-6' : ''}`} // Add margin top if it's a new live note without the header
        >
          <ReactMarkdown
            components={{
              // Give the TL;DR strong/paragraph a special highlighted card look
              p: ({ children, ...props }) => {
                const childStr = String(children);
                if (childStr.includes('TL;DR') || childStr.startsWith('**TL;DR')) {
                  return (
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl px-5 py-4 mb-8 -mx-2 text-[16px]">
                      <p className="m-0 text-[#1A1A2E] font-medium" {...props}>{children}</p>
                    </div>
                  );
                }
                return <p {...props}>{children}</p>;
              }
            }}
          >
            {displayBody}
          </ReactMarkdown>
        </motion.div>
      )}

      {/* Spacer for footer */}
      <div className="h-36 sm:h-44 w-full shrink-0" />
    </div>
  );
};

