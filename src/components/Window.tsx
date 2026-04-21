import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  zIndex: number;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({ 
  title, 
  isOpen, 
  onClose, 
  onMinimize, 
  zIndex, 
  children 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          drag
          dragMomentum={false}
          style={{ zIndex }}
          className="absolute bg-white/80 backdrop-blur-3xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-3xl min-w-[300px] max-w-[95vw] max-h-[90vh] flex flex-col pointer-events-auto overflow-visible"
        >
          {/* Title Bar */}
          <div className="bg-slate-800/5 backdrop-blur-md px-6 py-4 flex items-center justify-between cursor-move select-none border-b border-black/5">
            <div className="flex items-center gap-3">
              <span className="text-slate-900 text-sm font-black uppercase tracking-widest">{title}</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onMinimize}
                className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-black/5 transition-all active:scale-90"
              >
                <Minus size={18} className="text-slate-600" />
              </button>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-500/40 active:scale-90"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Window Content */}
          <div className="flex-1 bg-white/10 overflow-auto rounded-b-3xl">
            <div className="p-8 min-w-max min-h-max">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
