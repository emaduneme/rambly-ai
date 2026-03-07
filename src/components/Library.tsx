import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, FileText, Sparkles, Save } from 'lucide-react';
import { storage, Note } from '../lib/storage';

interface LibraryProps {
    onSelectNote: (note: Note) => void;
    triggerRefresh: number; // Increment this to force reload
}

function formatRelativeTime(ms: number): string {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto', style: 'short' });
    const date = new Date(ms);
    const now = new Date();
    const difference = ms - now.getTime();

    const diffInDays = Math.round(difference / (1000 * 60 * 60 * 24));

    // If more than 7 days, show the actual date like "Mar 6, 2026"
    if (Math.abs(diffInDays) > 7) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const diffInHours = Math.round(difference / (1000 * 60 * 60));
    const diffInMinutes = Math.round(difference / (1000 * 60));

    if (Math.abs(diffInDays) > 0) return rtf.format(diffInDays, 'day');
    if (Math.abs(diffInHours) > 0) return rtf.format(diffInHours, 'hour');
    if (Math.abs(diffInMinutes) > 0) return rtf.format(diffInMinutes, 'minute');
    return 'just now';
}

function parseNoteData(content: string, rawContent?: string, showingRaw?: boolean) {
    const displayContent = showingRaw && rawContent ? rawContent : content;
    const lines = displayContent.trim().split('\n');
    let title = 'Untitled Thought';
    let body = displayContent;

    if (lines[0] && lines[0].startsWith('#')) {
        title = lines[0].replace(/^#+\s*/, '').trim();
        // remove the title line
        body = lines.slice(1).join('\n').trim();
    } else if (displayContent && displayContent.length > 0) {
        // Auto-extract first sentence/chunk if no title
        const firstLine = lines[0].trim();
        title = firstLine.length > 40 ? firstLine.slice(0, 40) + '...' : firstLine;
        body = lines.length > 1 ? lines.slice(1).join('\n').trim() : body;
        title = title.replace(/[*_]/g, ''); // remove bold formatting from fallback title
    }

    return { title, body };
}

export const Library: React.FC<LibraryProps> = ({ onSelectNote, triggerRefresh }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
    const [showingRawId, setShowingRawId] = useState<string | null>(null);
    const confirmTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setNotes(storage.getNotes());
    }, [triggerRefresh]);

    useEffect(() => {
        if (confirmingDeleteId) {
            confirmTimeoutRef.current = window.setTimeout(() => {
                setConfirmingDeleteId(null);
            }, 3000);
            return () => {
                if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            };
        }
    }, [confirmingDeleteId]);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirmingDeleteId === id) {
            storage.deleteNote(id);
            setNotes(storage.getNotes());
            setConfirmingDeleteId(null);
        } else {
            setConfirmingDeleteId(id);
        }
    };

    const handleToggleRaw = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setShowingRawId(prev => prev === id ? null : id);
    };

    if (notes.length === 0) {
        return null;
    }

    return (
        <div className="w-full max-w-5xl mx-auto px-5 sm:px-8 pt-8 pb-56">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6 px-1 text-center">
                Recent Thoughts
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <AnimatePresence>
                    {notes.map((note) => {
                        const isShowingRaw = showingRawId === note.id;
                        const parsed = parseNoteData(note.content, note.rawContent, isShowingRaw);

                        // Always show the actual date format (e.g. Mar 6, 2026) as seen in user's screenshot
                        const dateString = new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                        return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                key={note.id}
                                onClick={() => onSelectNote(note)}
                                className="w-full bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:border-gray-200 hover:-translate-y-1 transition-all duration-300 group relative flex flex-col min-h-[220px] overflow-hidden"
                            >
                                {/* Side transcript tail */}
                                {note.rawContent && (
                                    <button
                                        onClick={(e) => handleToggleRaw(e, note.id)}
                                        className="absolute bottom-8 -right-[2px] px-3 py-2 bg-gradient-to-br from-indigo-500 to-violet-500 text-white rounded-l-xl shadow-md text-xs font-semibold tracking-wide opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 transition-all duration-300 ease-out flex items-center gap-1.5 hover:shadow-indigo-200/50 hover:shadow-lg z-10 [writing-mode:vertical-rl] [text-orientation:mixed] sm:[writing-mode:horizontal-tb] sm:rounded-l-md sm:rounded-r-sm min-h-[100px] sm:min-h-0 min-w-[28px]"
                                    >
                                        {isShowingRaw ? 'View Final' : 'View Original'}
                                    </button>
                                )}

                                {/* Top Date */}
                                <div className="text-center text-gray-400 text-xs tracking-wide mb-3">
                                    {dateString}
                                </div>

                                {/* Delete button absolutely positioned top right */}
                                <button
                                    onClick={(e) => handleDeleteClick(e, note.id)}
                                    className={`absolute top-4 right-4 p-1.5 rounded-lg transition-all duration-200 text-xs font-medium z-10 ${confirmingDeleteId === note.id
                                        ? 'bg-red-50 text-red-500 border border-red-200 opacity-100'
                                        : 'text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
                                        }`}
                                >
                                    {confirmingDeleteId === note.id ? 'Delete?' : <Trash2 size={16} />}
                                </button>

                                {/* Title */}
                                <h3 className="text-center text-xl sm:text-[22px] font-bold text-[#1A1A2E] leading-tight px-4 mt-1 tracking-tight">
                                    {parsed.title}
                                </h3>

                                {/* Orange Line */}
                                <div className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full mx-auto my-4 shrink-0 transition-all duration-300 group-hover:w-12 shadow-sm" />

                                {/* Content Body */}
                                <div className="text-[15px] sm:text-base text-gray-600 leading-relaxed font-light line-clamp-4 flex-1 text-left sm:text-center mb-6">
                                    {parsed.body}
                                </div>

                                {/* Footer Icons / Tags */}
                                <div className="flex items-center justify-between mt-auto">
                                    {/* Tag */}
                                    <div className={`inline-flex items-center justify-center font-bold ${note.contextName === 'Default (Neutral)' ? 'w-8 h-8 rounded-full text-lg border border-gray-200 border-dashed text-gray-400 font-medium' : 'px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider bg-slate-200 text-slate-800'}`}>
                                        {note.contextName === 'Default (Neutral)' ? '+' : note.contextName}
                                    </div>

                                    {/* Save Icon purely decorative for visual match */}
                                    <div className="text-gray-200">
                                        <Save size={20} className="fill-current opacity-30" strokeWidth={1} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

