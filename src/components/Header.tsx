import React from 'react';
import { Trash2 } from 'lucide-react';

interface HeaderProps {
  onDelete: () => void;
  onGoHome: () => void;
  onGoLanding?: () => void;
  hasContent: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onDelete,
  onGoHome,
  onGoLanding,
  hasContent
}) => {
  return (
    <header className="flex items-center justify-between px-4 sm:px-8 pt-3 pb-3 sm:pt-4 sm:pb-4 bg-white/80 backdrop-blur-xl border-b border-gray-100/80 sticky top-0 z-10 safe-top">
      {/* Logo — clickable to go landing */}
      <button
        onClick={onGoLanding || onGoHome}
        className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 rounded-lg"
        title="Back to landing"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200 group-hover:shadow-md group-hover:shadow-indigo-300 transition-shadow duration-200">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <span className="hidden sm:block text-[15px] font-semibold tracking-tight text-[#1A1A2E] group-hover:text-indigo-600 transition-colors duration-200">Rambly</span>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {hasContent && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-lg transition-colors duration-200 ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
            title="Delete Note"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>
    </header>
  );
};
