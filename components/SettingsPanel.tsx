import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const [hasCustomKey, setHasCustomKey] = useState(false);

  useEffect(() => {
    const win = window as any;
    if (isOpen && win.aistudio?.hasSelectedApiKey) {
        win.aistudio.hasSelectedApiKey().then(setHasCustomKey);
    }
  }, [isOpen]);

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, speechRate: parseFloat(e.target.value) });
  };

  const toggleVoice = () => onUpdateSettings({ ...settings, voiceEnabled: !settings.voiceEnabled });
  const toggleHaptics = () => onUpdateSettings({ ...settings, hapticsEnabled: !settings.hapticsEnabled });

  const handleSelectKey = async () => {
      const win = window as any;
      if (win.aistudio?.openSelectKey) {
          await win.aistudio.openSelectKey();
          // Assume success if no error, update state
          setHasCustomKey(true);
      }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`
        fixed inset-y-0 right-0 w-full max-w-sm bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-[101]
        transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-yellow-500/10 to-transparent">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Settings</h2>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* API Key Section (New) */}
            <div className="bg-slate-800/40 rounded-2xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-lg font-semibold text-white">API Access</label>
                    {hasCustomKey && (
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full uppercase tracking-wider">
                            Active
                        </span>
                    )}
                </div>
                
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    To avoid quota limits, you can use your own paid API key from Google AI Studio.
                </p>

                {(window as any).aistudio?.openSelectKey ? (
                    <button 
                        onClick={handleSelectKey}
                        className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                        {hasCustomKey ? 'Switch API Key' : 'Select API Key'}
                    </button>
                ) : (
                    <div className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                        Secure key selection is not available in this environment.
                    </div>
                )}

                <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-center text-xs text-yellow-500/70 hover:text-yellow-400 mt-4 hover:underline"
                >
                    View Billing Documentation
                </a>
            </div>

            {/* Speech Rate Section */}
            <div className="bg-slate-800/40 rounded-2xl p-5 border border-white/5">
              <label className="block text-lg font-semibold text-white mb-4 flex justify-between">
                <span>Speech Rate</span>
                <span className="text-yellow-400 font-mono">{settings.speechRate.toFixed(1)}x</span>
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={settings.speechRate} 
                onChange={handleRateChange}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium uppercase tracking-wide">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Voice Commands</h3>
                  <p className="text-sm text-slate-400 mt-1">"Start", "Stop", "Read"</p>
                </div>
                <button 
                  onClick={toggleVoice}
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${settings.voiceEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.voiceEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="bg-slate-800/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">Haptic Feedback</h3>
                  <p className="text-sm text-slate-400 mt-1">Vibrate on hazards</p>
                </div>
                <button 
                  onClick={toggleHaptics}
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${settings.hapticsEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${settings.hapticsEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Shortcuts */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { k: 'Space', v: 'Start/Stop' },
                  { k: '1-6', v: 'Change Mode' },
                  { k: 'R', v: 'Replay Audio' },
                  { k: 'Esc', v: 'Stop/Close' }
                ].map((item) => (
                  <div key={item.k} className="bg-slate-800/30 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                    <span className="text-slate-300 text-sm">{item.v}</span>
                    <kbd className="bg-slate-700/50 px-2 py-1 rounded text-xs font-mono text-yellow-400 min-w-[30px] text-center">{item.k}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-6 text-center border-t border-white/5 bg-slate-900/50">
             <p className="text-xs text-slate-500">VisionAI v1.0 • Gemini 3 Powered</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;