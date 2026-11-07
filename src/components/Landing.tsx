import React from 'react';
import { RamblyMark } from "./RamblyMark";
import { motion, useReducedMotion } from 'framer-motion';

interface LandingProps {
    onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
    const prefersReducedMotion = useReducedMotion();
    return (
        <div className="min-h-screen flex flex-col font-sans text-ink overflow-hidden selection:bg-accent-tint selection:text-ink">

            {/* Top Navigation */}
            <header className="flex items-center justify-between px-6 sm:px-12 pt-6 sm:pt-8 w-full max-w-7xl mx-auto absolute top-0 left-0 right-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center shrink-0">
                        <RamblyMark size={20} />
                    </div>
                    <span className="text-[17px] font-bold tracking-tight text-ink">Rambly</span>
                </div>

                <a href="https://youtu.be/BzVev97bpjk" target="_blank" rel="noopener noreferrer" className="px-5 py-2 sm:px-6 sm:py-2.5 flex items-center justify-center bg-white border border-neutral-200/80 text-ink hover:bg-neutral-50 rounded-full text-sm sm:text-[15px] font-medium tracking-wide shadow-sm hover:shadow transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                    How it works
                </a>
            </header>

            {/* Main Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 z-10 w-full max-w-4xl mx-auto pt-20 sm:pt-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center w-full"
                >
                    {/* Headline */}
                    <h1 className="text-[44px] sm:text-[56px] md:text-[72px] leading-[1.05] font-semibold tracking-tight text-ink mb-6 max-w-4xl mx-auto">
                        Turn messy thoughts
                        <br className="hidden sm:block" /> into polished notes with <span className="text-accent">Rambly.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-[21px] text-neutral-500 leading-relaxed max-w-2xl mx-auto mb-10 sm:mb-14">
                        Rambly takes your rambling voice memos and structures them into perfectly edited text.
                    </p>

                    {/* Call to Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <button
                            onClick={onStart}
                            className="px-8 py-4 sm:px-10 flex items-center justify-center bg-accent hover:bg-accent-hover text-white rounded-full text-[17px] font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                        >
                            Get started
                        </button>
                    </div>
                </motion.div>
            </main>

            {/* Simple Footer */}
            <footer className="w-full py-8 sm:py-12 mt-20 flex items-center justify-center text-neutral-400 text-sm">
                <p>&copy; 2026 Rearguard Online</p>
            </footer>

        </div>
    );
};
