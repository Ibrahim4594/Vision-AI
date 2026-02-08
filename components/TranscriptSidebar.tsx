import React from 'react';
import { AppMode } from '../types';
import { MODE_COLORS } from '../constants';

interface TranscriptSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  currentMode: AppMode;
}

const TranscriptSidebar: React.FC<TranscriptSidebarProps> = ({ isOpen, onClose, text, currentMode }) => {
  return (
    <div 
      className={`
        absolute top-20 bottom-0 right-0 z-40
        w-full md:w-96 
        bg-slate-950/90 backdrop-blur-xl border-l border-white/10 shadow-2xl
        transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)
        flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-3">
              <div 
                  className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" 
                  style={{ backgroundColor: MODE_COLORS[currentMode], color: MODE_COLORS[currentMode] }}
              />
              <span className="text-sm font-bold text-slate-200 tracking-wider uppercase">Transcript</span>
          </div>
          <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
              aria-label="Close sidebar"
          >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-40">
          {(!text || text === 'Ready') ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 opacity-60">
                   <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                   <p className="text-sm font-medium">Waiting for analysis...</p>
              </div>
          ) : (
              <p className="text-lg md:text-xl text-slate-100 leading-relaxed font-medium animate-fade-in whitespace-pre-wrap">
                  {text}
              </p>
          )}
      </div>
    </div>
  );
};

export default TranscriptSidebar;