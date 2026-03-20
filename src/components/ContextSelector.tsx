import React, { useState, useId, useEffect, useRef } from 'react';
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
    const menuId = useId();
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            const firstItem = menuRef.current?.querySelector<HTMLButtonElement>('button[role="menuitem"]');
            firstItem?.focus();
        } else {
            triggerRef.current?.focus();
        }
    }, [isOpen]);

    return (
        <div className="relative z-20 flex items-center justify-center">
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={menuId}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 ${disabled
                    ? 'text-gray-200 cursor-not-allowed'
                    : activeContext
                        ? 'text-indigo-600 hover:text-indigo-700'
                        : 'text-gray-500 hover:text-indigo-500'
                    }`}
                title="Choose AI Persona"
                aria-label="Choose AI persona"
                onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                        setIsOpen(false);
                    }
                    if (event.key === 'ArrowDown' && !isOpen) {
                        event.preventDefault();
                        setIsOpen(true);
                    }
                }}
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
                            id={menuId}
                            role="menu"
                            aria-label="Persona options"
                            ref={menuRef}
                            onKeyDown={(event) => {
                                if (event.key === 'Escape') {
                                    event.preventDefault();
                                    setIsOpen(false);
                                    return;
                                }

                                const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');
                                if (!items || items.length === 0) return;

                                const currentIndex = Array.from(items).findIndex((item) => item === document.activeElement);
                                if (event.key === 'ArrowDown') {
                                    event.preventDefault();
                                    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
                                    items[nextIndex].focus();
                                }
                                if (event.key === 'ArrowUp') {
                                    event.preventDefault();
                                    const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
                                    items[prevIndex].focus();
                                }
                                if (event.key === 'Tab') {
                                    event.preventDefault();
                                    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + (event.shiftKey ? -1 : 1) + items.length) % items.length;
                                    items[nextIndex].focus();
                                }
                            }}
                        >
                            <div className="p-1">
                                <button
                                    onClick={() => { onSelectContext(null); setIsOpen(false); }}
                                    role="menuitem"
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
                                >
                                    <span className={!activeContext ? 'font-medium text-[#1A1A2E]' : 'text-gray-600'}>Default (Neutral)</span>
                                    {!activeContext && <Check size={14} className="text-indigo-500" />}
                                </button>

                                <div className="my-1 border-t border-gray-100" />

                                {DEFAULT_CONTEXTS.map((context) => (
                                    <button
                                        key={context.id}
                                        onClick={() => { onSelectContext(context); setIsOpen(false); }}
                                        role="menuitem"
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded-lg hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2"
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
