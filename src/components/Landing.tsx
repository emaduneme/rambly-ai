import React from 'react';
import { User, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingProps {
    onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-[#FAFAF8] flex flex-col font-sans text-[#1A1A2E] overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">

            {/* Top Navigation */}
            <header className="flex items-center justify-between px-6 sm:px-12 pt-6 sm:pt-8 w-full max-w-7xl mx-auto absolute top-0 left-0 right-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" x2="12" y1="19" y2="22" />
                        </svg>
                    </div>
                    <span className="text-[17px] font-bold tracking-tight text-[#1A1A2E]">Rambly</span>
                </div>

                <a href="https://youtu.be/BzVev97bpjk" target="_blank" rel="noopener noreferrer" className="px-5 py-2 sm:px-6 sm:py-2.5 flex items-center justify-center bg-white border border-gray-200/80 text-[#1A1A2E] hover:bg-indigo-50 hover:text-indigo-600 rounded-full text-sm sm:text-[15px] font-medium tracking-wide shadow-sm hover:shadow transition-all duration-300">
                    How it works
                </a>
            </header>

            {/* Main Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 z-10 w-full max-w-4xl mx-auto pt-20 sm:pt-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center w-full"
                >
                    {/* Headline */}
                    <h1 className="text-[44px] sm:text-[56px] md:text-[72px] leading-[1.05] font-serif tracking-tight text-[#1A1A2E] mb-6 max-w-4xl mx-auto">
                        Turn messy thoughts
                        <br className="hidden sm:block" /> into polished notes with <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-violet-600 italic font-medium pr-2">Rambly.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-[21px] text-gray-500 font-light leading-relaxed max-w-2xl mx-auto mb-10 sm:mb-14">
                        Rambly takes your rambling voice memos and structures them into perfectly edited text.
                    </p>

                    {/* Call to Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                        <button
                            onClick={onStart}
                            className="px-8 py-4 sm:px-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-full text-[17px] font-semibold tracking-wide shadow-lg shadow-indigo-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
                        >
                            Get Started
                        </button>
                    </div>
                </motion.div>
            </main>

            {/* Simple Footer */}
            <footer className="w-full py-8 sm:py-12 mt-20 flex items-center justify-center text-gray-400 text-sm font-light">
                <p>&copy; {new Date().getFullYear()} Emmanuel Maduneme. All rights reserved.</p>
            </footer>

        </div>
    );
};
