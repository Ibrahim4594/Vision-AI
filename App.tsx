import React, { useState, useRef, useEffect, useCallback } from 'react';
import Camera, { CameraHandle } from './components/Camera';
import ControlPanel from './components/ControlPanel';
import ChatInterface from './components/ChatInterface';
import SettingsPanel from './components/SettingsPanel';
import TranscriptSidebar from './components/TranscriptSidebar';
import LoadingSpinner from './components/LoadingSpinner';
import Toast, { ToastType } from './components/Toast';
import { AppMode, AppSettings, ChatMessage } from './types';
import { PROMPTS, MODE_LABELS, DEFAULT_SPEECH_RATE, MODE_COLORS, HAPTIC_PATTERNS } from './constants';
import { analyzeImage } from './services/geminiService';
import { speak, stopSpeaking } from './services/speechService';
import { VoiceCommandService } from './services/voiceService';
import { playSound } from './services/audioService';

const DEFAULT_SETTINGS: AppSettings = {
  speechRate: DEFAULT_SPEECH_RATE,
  voiceEnabled: false,
  hapticsEnabled: true,
};

const App: React.FC = () => {
  // State
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.SCENE);
  const [lastSpokenText, setLastSpokenText] = useState<string>('Ready');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('visionai_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Toast State
  const [toast, setToast] = useState<{msg: string, type: ToastType, show: boolean}>({ msg: '', type: 'info', show: false });

  // Refs
  const cameraRef = useRef<CameraHandle>(null);
  const activeRef = useRef<boolean>(false);
  const settingsRef = useRef<AppSettings>(settings);
  const voiceServiceRef = useRef<VoiceCommandService | null>(null);
  
  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ msg: message, type, show: true });
  };

  const triggerHaptic = (pattern: number[]) => {
      if (settingsRef.current.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(pattern);
      }
  };

  useEffect(() => {
    activeRef.current = isActive;
    if (!isActive) {
      stopSpeaking();
      setIsProcessing(false);
    }
  }, [isActive]);

  useEffect(() => {
    settingsRef.current = settings;
    localStorage.setItem('visionai_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      const isEdge = /Edg/.test(navigator.userAgent);
      if (!isChrome && !isEdge && settings.voiceEnabled) {
        showToast("Voice commands optimized for Chrome/Edge", 'warning');
      }
    }
  }, [settings.voiceEnabled]);

  useEffect(() => {
    const handleOnline = () => showToast("Connection restored", 'success');
    const handleOffline = () => {
      playSound.error();
      showToast("No internet connection", 'error');
      setIsActive(false);
      stopSpeaking();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processFrame = useCallback(async (customPrompt?: string) => {
    if (!cameraRef.current || isProcessing || !cameraReady) return;

    const imageBase64 = cameraRef.current.capture();
    if (!imageBase64) return;

    setIsProcessing(true);
    if (!customPrompt) playSound.shutter(); // Auditory cue that processing started

    try {
      const promptToUse = customPrompt || PROMPTS[currentMode];
      const usePro = currentMode === AppMode.CHAT;
      const text = await analyzeImage(imageBase64, promptToUse, { usePro });

      playSound.success(); // Auditory cue that result is ready

      if (currentMode === AppMode.CHAT && customPrompt) {
        setChatHistory(prev => [...prev, { role: 'model', text }]);
        speak(text, settingsRef.current.speechRate);
        setIsProcessing(false);
      } else {
        setLastSpokenText(text);
        
        // Auto-open sidebar if closed and we got new text (optional, but good UX)
        // setIsSidebarOpen(true); 

        // Advanced Haptics & Spatial Audio based on Navigation content
        if (currentMode === AppMode.NAV) {
            const upperText = text.toUpperCase();
            
            // Determine direction for spatial audio (-1.0 left to 1.0 right)
            let pan = 0;
            if (upperText.includes('LEFT') && !upperText.includes('RIGHT')) pan = -0.8;
            else if (upperText.includes('RIGHT') && !upperText.includes('LEFT')) pan = 0.8;

            // Priority 1: Direct Hazard Commands
            if (upperText.includes('STOP') || upperText.includes('DANGER')) {
                playSound.hazard(pan);
                triggerHaptic(HAPTIC_PATTERNS.HAZARD);
            } 
            // Priority 2: Proximity Alerts
            else if (upperText.includes('VERY CLOSE')) {
                 playSound.ping(pan); // Audio cue for very close proximity with direction
                 triggerHaptic(HAPTIC_PATTERNS.VERY_CLOSE);
            }
            else if (upperText.includes('CLOSE')) {
                 triggerHaptic(HAPTIC_PATTERNS.CLOSE);
            }
            else if (upperText.includes('CAUTION') || upperText.includes('WARNING')) {
                triggerHaptic(HAPTIC_PATTERNS.WARNING);
            }
        }

        speak(text, settingsRef.current.speechRate, () => {
          // ONLY LOOP if we are in Navigation Mode.
          // All other modes (Scene, Object, Read, Color) should stop after one description.
          if (activeRef.current && currentMode === AppMode.NAV) {
            setTimeout(() => { if(activeRef.current) processFrame(); }, 1500); 
          } else {
             setIsActive(false);
             setIsProcessing(false);
          }
        });
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      playSound.error();
      showToast("Processing error. Retrying...", 'error');
      setIsProcessing(false);
      setIsActive(false);
    }
  }, [currentMode, isProcessing, cameraReady]);

  const handleToggle = useCallback(() => {
    triggerHaptic(HAPTIC_PATTERNS.CLICK);
    
    if (currentMode === AppMode.CHAT) return;
    
    if (isActive) {
      setIsActive(false);
      stopSpeaking();
      playSound.click(); // Stop sound
    } else {
      setIsActive(true);
      speak(`Starting ${MODE_LABELS[currentMode]}`, settingsRef.current.speechRate, () => processFrame());
    }
  }, [isActive, currentMode, processFrame]);

  const handleModeChange = useCallback((mode: AppMode) => {
    playSound.modeSwitch();
    triggerHaptic(HAPTIC_PATTERNS.CLICK);
    setIsActive(false);
    stopSpeaking();
    setCurrentMode(mode);
    setLastSpokenText("Ready");
    speak(`${MODE_LABELS[mode]}`, settingsRef.current.speechRate);
  }, []);

  const handleChatSubmit = useCallback((text: string) => {
    if (!cameraReady) {
        showToast("Camera initializing...", 'warning');
        return;
    }
    playSound.click();
    setChatHistory(prev => [...prev, { role: 'user', text }]);

    // Contextual Prompt Construction
    let promptContext = "Context: You are VisionAI, helping a visually impaired user. Analyze the image to answer.";
    
    // Add brief history context (last exchange) to maintain conversation flow
    if (chatHistory.length > 0) {
        const lastExchanges = chatHistory.slice(-2); // Get last 2 messages
        promptContext += " Previous context: ";
        lastExchanges.forEach(msg => {
            promptContext += `${msg.role === 'user' ? 'User' : 'AI'}: "${msg.text}". `;
        });
    }

    const prompt = `${promptContext} Current Question: "${text}". Answer directly, concisely, and naturally.`;
    
    setTimeout(() => processFrame(prompt), 0);
  }, [processFrame, cameraReady, chatHistory]);

  const handleVoiceCommand = useCallback((command: string, transcript: string) => {
    
    // Handle Chat Mode free-form input
    if (command.startsWith('chat:')) {
        const query = command.substring(5); // Remove "chat:" prefix
        if (query.length > 0) {
            playSound.success();
            handleChatSubmit(query);
        }
        return;
    }

    // Handle "Ask" specific commands (works in any mode to switch to chat)
    if (command.startsWith('ask:')) {
          playSound.success();
          if (currentMode !== AppMode.CHAT) setCurrentMode(AppMode.CHAT);
          handleChatSubmit(command.split(':')[1]);
          return;
    }

    // Standard Commands
    playSound.success();
    switch(command) {
      case 'start': if (!activeRef.current && currentMode !== AppMode.CHAT) handleToggle(); break;
      case 'stop': 
        if (activeRef.current) handleToggle(); 
        else stopSpeaking(); 
        break;
      case 'scene': handleModeChange(AppMode.SCENE); break;
      case 'read': handleModeChange(AppMode.READ); break;
      case 'object': handleModeChange(AppMode.OBJECT); break;
      case 'navigate': handleModeChange(AppMode.NAV); break;
      case 'color': handleModeChange(AppMode.COLOR); break;
      case 'chat': handleModeChange(AppMode.CHAT); break;
    }
  }, [handleToggle, handleModeChange, handleChatSubmit, currentMode]);

  // Update Voice Service with latest state and callback
  useEffect(() => {
    if (settings.voiceEnabled) {
      if (!voiceServiceRef.current) {
          voiceServiceRef.current = new VoiceCommandService(handleVoiceCommand);
      }
      
      // IMPORTANT: Update callback and mode to avoid stale closures
      voiceServiceRef.current.updateCallback(handleVoiceCommand);
      voiceServiceRef.current.setChatMode(currentMode === AppMode.CHAT);
      
      voiceServiceRef.current.start();
    } else {
      voiceServiceRef.current?.stop();
    }
  }, [settings.voiceEnabled, handleVoiceCommand, currentMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const activeElement = document.activeElement as HTMLElement;
        const isTyping = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
        
        // Allow normal typing behavior
        if (isTyping) { 
            if (e.key === 'Escape') activeElement.blur(); 
            return; 
        }

        if (e.key === ' ') { 
            e.preventDefault(); 
            // Only toggle if NOT in chat mode
            if (currentMode !== AppMode.CHAT) handleToggle(); 
        }
        else if (e.key === 'Escape') { 
            setIsActive(false); 
            setIsSettingsOpen(false); 
            stopSpeaking();
            playSound.click();
        }
        else if (e.key >= '1' && e.key <= '6') handleModeChange([AppMode.SCENE, AppMode.READ, AppMode.OBJECT, AppMode.NAV, AppMode.COLOR, AppMode.CHAT][parseInt(e.key) - 1]);
        else if (e.key.toLowerCase() === 'r') speak(lastSpokenText, settingsRef.current.speechRate);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggle, handleModeChange, lastSpokenText, currentMode, settings]);

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden text-white relative animate-fade-in">
      
      {/* 1. Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 h-20 px-4 bg-gradient-to-b from-slate-950/90 to-transparent backdrop-blur-sm flex justify-between items-center z-30 safe-top">
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className="text-2xl filter drop-shadow-md">🌟</span>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 drop-shadow-sm tracking-tight">VisionAI</h1>
            </div>
            <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest ml-1 drop-shadow-md">Accessibility Companion</p>
        </div>
        <div className="flex items-center gap-3">
            {settings.voiceEnabled && (
                <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-pulse mr-1">
                     <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" /></svg>
                </div>
            )}
            {/* Status Dot */}
            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 mr-2 ${cameraReady ? 'text-emerald-500 bg-emerald-500' : 'text-amber-500 bg-amber-500'}`} />
            
            {/* Transcript Toggle Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border
                    ${isSidebarOpen 
                        ? 'bg-white/20 border-white/30 text-white' 
                        : 'bg-slate-900/40 border-white/10 text-slate-300 hover:bg-slate-800/60'}
                `}
                aria-label="Toggle Transcript"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
            </button>

            {/* Settings Button */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-900/40 hover:bg-slate-800/60 border border-white/10 transition-all text-white backdrop-blur-md"
              aria-label="Settings"
            >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
        </div>
      </div>

      {/* 2. Main Viewport */}
      <div className="flex-1 relative">
        {!cameraReady && <LoadingSpinner />}
        
        <Camera 
          ref={cameraRef} 
          onReady={() => setCameraReady(true)} 
          onError={(msg) => showToast(msg, 'error')} 
          currentMode={currentMode}
        />
        
        {currentMode === AppMode.CHAT ? (
            <ChatInterface 
                history={chatHistory} 
                onSendMessage={handleChatSubmit}
                onClearChat={() => {setChatHistory([]); showToast("Chat cleared", 'success');}}
                isProcessing={isProcessing}
            />
        ) : (
          <TranscriptSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)}
            text={lastSpokenText}
            currentMode={currentMode}
          />
        )}

        <Toast 
            message={toast.msg} 
            type={toast.type} 
            isVisible={toast.show} 
            onClose={() => setToast(prev => ({ ...prev, show: false }))} 
        />
      </div>

      <ControlPanel 
        currentMode={currentMode}
        isActive={isActive}
        isProcessing={isProcessing}
        onModeChange={handleModeChange}
        onToggleActive={handleToggle}
      />

      <SettingsPanel 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  );
};

export default App;