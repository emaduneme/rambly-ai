import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Check } from 'lucide-react';
import { ContextProfile, DEFAULT_CONTEXTS } from '../lib/contexts';

interface ContextSelectorProps {
    activeContext: ContextProfile | null;
    onSelectContext: (context: ContextProfile | null) => void;
    disabled?: boolean;
}

export const ContextSelector: React.FC<ContextSelectorProps> = ({ activeContext, onSelectContext, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative z-20 flex items-center justify-center">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-colors duration-200 ${disabled
                    ? 'text-gray-200 cursor-not-allowed'
                    : activeContext
                        ? 'text-indigo-600 hover:text-indigo-700'
                        : 'text-gray-500 hover:text-indigo-500'
                    }`}
                title="Choose AI Persona"
            >
                <User size={16} strokeWidth={2.5} />
                <span className="text-[13px] font-semibold tracking-wide pr-0.5 whitespace-nowrap truncate max-w-[100px] sm:max-w-[140px]">
                    {activeContext ? activeContext.name : 'Persona'}
                </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10 bg-black/10 sm:bg-transparent" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full right-0 sm:-right-2 mb-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl shadow-indigo-100/40 border border-gray-100 overflow-hidden z-20 origin-bottom-right"
                        >
                            <div className="p-1">
                                <button
                                    onClick={() => { onSelectContext(null); setIsOpen(false); }}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <span className={!activeContext ? 'font-medium text-[#1A1A2E]' : 'text-gray-600'}>Default (Neutral)</span>
                                    {!activeContext && <Check size={14} className="text-indigo-500" />}
                                </button>

                                <div className="my-1 border-t border-gray-100" />

                                {DEFAULT_CONTEXTS.map((context) => (
                                    <button
                                        key={context.id}
                                        onClick={() => { onSelectContext(context); setIsOpen(false); }}
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <span className={activeContext?.id === context.id ? 'font-medium text-[#1A1A2E]' : 'text-gray-600'}>
                                            {context.name}
                                        </span>
                                        {activeContext?.id === context.id && <Check size={14} className="text-indigo-500" />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
