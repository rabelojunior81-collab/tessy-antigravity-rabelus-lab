
import React, { useState } from 'react';
import { OptimizationResult } from '../types';

interface OptimizationModalProps {
  isOpen: boolean;
  result: OptimizationResult | null;
  onClose: () => void;
  onApply: (optimizedPrompt: string) => void;
}

const OptimizationModal: React.FC<OptimizationModalProps> = ({ isOpen, result, onClose, onApply }) => {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen || !result) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8 bg-slate-950/40 backdrop-blur-md ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`glass-panel !rounded-none w-full h-full sm:h-auto sm:max-w-3xl flex flex-col max-h-[100vh] sm:max-h-[90vh] overflow-hidden !bg-white dark:!bg-slate-900 ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 sm:px-8 py-4 sm:py-6 border-b-2 border-emerald-500/20 flex justify-between items-center bg-emerald-500/5 dark:bg-slate-950/40 shrink-0">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter glow-text-green">Otimização</h3>
            <p className="text-[8px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mt-1">Motor Gemini Pro</p>
          </div>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/10 flex flex-col items-center justify-center">
              <span className="text-[8px] sm:text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1 sm:mb-2">Clareza</span>
              <span className="text-2xl sm:text-4xl font-black text-emerald-600">{result.clarity_score.toFixed(1)}</span>
            </div>
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/10 flex flex-col items-center justify-center">
              <span className="text-[8px] sm:text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1 sm:mb-2">Completude</span>
              <span className="text-2xl sm:text-4xl font-black text-emerald-600">{result.completeness_score.toFixed(1)}</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Sugestões</h4>
            <div className="space-y-4">
              {result.suggestions.map((s, idx) => (
                <div key={idx} className="p-4 bg-amber-500/5 border-l-4 border-amber-500">
                  <span className="text-[8px] font-black px-2 py-0.5 bg-amber-500/10 text-amber-700 uppercase mb-2 inline-block">{s.category}</span>
                  <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-bold mb-1">{s.issue}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 italic">{s.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4">Otimizado</h4>
            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border-2 border-emerald-500/20 text-slate-800 dark:text-emerald-100 font-mono text-[11px] sm:text-sm whitespace-pre-wrap leading-relaxed">
              {result.optimized_prompt}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 border-t-2 border-emerald-500/10 flex flex-wrap gap-2 sm:gap-4 bg-emerald-500/5 shrink-0">
          <button onClick={handleClose} className="brutalist-button px-4 py-3 sm:px-6 bg-slate-200 text-slate-500 font-black uppercase text-[10px]">Fechar</button>
          <button onClick={() => { onApply(result.optimized_prompt); handleClose(); }} className="brutalist-button flex-1 py-3 bg-emerald-500 text-white font-black uppercase text-[10px]">Executar</button>
        </div>
      </div>
    </div>
  );
};

export default OptimizationModal;
