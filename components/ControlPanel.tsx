import React from 'react';
import { AppMode } from '../types';
import { MODE_LABELS, MODE_COLORS } from '../constants';

interface ControlPanelProps {
  currentMode: AppMode;
  isActive: boolean;
  isProcessing: boolean;
  onModeChange: (mode: AppMode) => void;
  onToggleActive: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  currentMode,
  isActive,
  isProcessing,
  onModeChange,
  onToggleActive
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      
      {/* Background with blur */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.5)] safe-bottom" />

      <div className="relative px-3 pt-4 pb-safe safe-bottom max-w-2xl mx-auto">
        
        {/* Floating Action Button - Only if not Chat */}
        {currentMode !== AppMode.CHAT && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-auto">
            <button
              onClick={onToggleActive}
              disabled={isProcessing}
              className={`
                relative w-24 h-24 rounded-full flex items-center justify-center border-[6px] border-slate-900 shadow-2xl transition-all duration-300
                ${isProcessing ? 'bg-gradient-to-br from-gray-500 to-gray-600 cursor-not-allowed' : isActive ? 'bg-gradient-to-br from-red-500 to-red-600 scale-100' : 'bg-gradient-to-br from-yellow-400 to-amber-500 hover:scale-105'}
              `}
              aria-label={isActive ? "Stop" : "Start"}
            >
              {isProcessing ? (
                 <svg className="w-10 h-10 text-white animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
              ) : isActive ? (
                 <div className="w-8 h-8 bg-white rounded-md shadow-sm" />
              ) : (
                 <div className="ml-2 w-0 h-0 border-t-[14px] border-t-transparent border-l-[24px] border-l-slate-900 border-b-[14px] border-b-transparent filter drop-shadow-sm" />
              )}
              
              {/* Ripple Effect Container */}
              {isActive && <div className="absolute inset-0 rounded-full animate-[pulse-glow_2s_infinite]" />}
            </button>
          </div>
        )}

        {/* Mode Grid */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {(Object.keys(MODE_LABELS) as AppMode[]).map((mode) => {
            const isSelected = currentMode === mode;
            const modeColor = MODE_COLORS[mode];
            
            return (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`
                  relative flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all duration-300 overflow-hidden
                  ${isSelected ? 'bg-slate-800/80 border border-white/20 shadow-lg -translate-y-1' : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50'}
                `}
                style={isSelected ? { borderColor: modeColor, boxShadow: `0 8px 16px -4px ${modeColor}40` } : {}}
              >
                <div 
                  className={`w-3 h-3 rounded-full mb-2 transition-transform duration-300 ${isSelected ? 'scale-125' : 'scale-100'}`}
                  style={{ backgroundColor: modeColor, boxShadow: isSelected ? `0 0 10px ${modeColor}` : 'none' }} 
                />
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {MODE_LABELS[mode].split(' ')[0]}
                </span>
                
                {/* Active shine effect */}
                {isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;