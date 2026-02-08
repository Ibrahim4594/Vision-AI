import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getColors = () => {
    switch(type) {
      case 'success': return 'border-emerald-500 text-emerald-400';
      case 'error': return 'border-red-500 text-red-400';
      case 'warning': return 'border-amber-500 text-amber-400';
      default: return 'border-blue-500 text-blue-400';
    }
  };

  return (
    <div className={`
      fixed top-[90px] left-1/2 transform -translate-x-1/2 z-[300]
      min-w-[300px] max-w-[90%] px-5 py-4
      bg-slate-900/95 backdrop-blur-xl rounded-2xl
      border-l-4 shadow-2xl transition-all duration-400 cubic-bezier(0.16, 1, 0.3, 1)
      flex items-center gap-3
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'}
      ${getColors()}
    `}>
      <div className="font-medium text-white text-sm">{message}</div>
    </div>
  );
};

export default Toast;