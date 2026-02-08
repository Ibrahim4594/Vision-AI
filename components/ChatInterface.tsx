import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  history: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isProcessing: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, onSendMessage, onClearChat, isProcessing }) => {
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col pt-24 pb-32 px-0 bg-slate-950/80 backdrop-blur-md">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 scrollbar-hide">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-xl shadow-orange-500/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Ask VisionAI</h3>
            <p className="text-slate-400 max-w-xs">Ask anything about your surroundings. I can read signs, identify objects, and help you navigate.</p>
          </div>
        )}
        
        {history.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            <div className={`max-w-[85%] px-5 py-3.5 text-[15px] leading-relaxed shadow-md backdrop-blur-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-none' 
                : 'bg-slate-800/80 border border-white/10 text-slate-100 rounded-2xl rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isProcessing && (
           <div className="flex justify-start animate-fade-in">
              <div className="bg-slate-800/80 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                 <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
           </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-slate-900/50 border-t border-white/5 backdrop-blur-xl absolute bottom-0 left-0 right-0 safe-bottom">
         <div className="flex items-center justify-between mb-3 px-1">
             <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Chat Active</span>
             {history.length > 0 && (
                <button onClick={onClearChat} className="text-xs text-slate-400 hover:text-white transition-colors">
                    Clear Chat
                </button>
             )}
         </div>
         <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 bg-slate-800/50 border border-white/10 text-white px-4 py-3.5 rounded-2xl text-base focus:outline-none focus:border-amber-400/50 focus:bg-slate-800 transition-all placeholder-slate-500"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none hover:scale-105 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-[-45deg] translate-x-0.5 translate-y-[-1px]">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
         </form>
      </div>
    </div>
  );
};

export default ChatInterface;