import React, { useState, useEffect } from 'react';
import { X, Wand2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { OptimizationResult } from '../../types';
import * as geminiService from '../../services/geminiService';

interface OptimizeModalProps {
  isOpen: boolean;
  inputText: string;
  onClose: () => void;
  onApply: (optimizedPrompt: string) => void;
}

const OptimizeModal: React.FC<OptimizeModalProps> = ({ isOpen, inputText, onClose, onApply }) => {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && inputText && inputText.trim()) handleOptimize();
  }, [isOpen, inputText]);

  const handleOptimize = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await geminiService.optimizePrompt(inputText);
      setResult(res);
    } catch (err) {
      setError('Erro no núcleo de otimização.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
      <div className={`w-full max-w-4xl bg-bg-secondary border border-border-visible flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-primary">
          <div className="flex items-center gap-3">
            <Wand2 className="text-accent-primary" size={18} />
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-primary">Otimização</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 min-h-[400px]">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-center gap-4 opacity-50">
              <Loader2 className="text-accent-primary animate-spin" size={32} />
              <p className="text-[10px] font-bold uppercase tracking-widest">Processando...</p>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center text-center gap-4 text-red-400">
              <AlertCircle size={32} />
              <p className="text-[11px] font-bold uppercase">{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-bg-primary/50 border border-border-subtle text-center">
                  <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest block mb-2">Clareza</span>
                  <span className="text-2xl font-bold text-accent-primary">{result.clarity_score.toFixed(1)}</span>
                </div>
                <div className="p-4 bg-bg-primary/50 border border-border-subtle text-center">
                  <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest block mb-2">Contexto</span>
                  <span className="text-2xl font-bold text-accent-primary">{result.completeness_score.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase text-text-tertiary tracking-widest border-b border-border-subtle pb-2">Otimizado</h4>
                <div className="p-4 bg-bg-tertiary/40 border border-border-subtle">
                  <pre className="text-[12px] text-text-secondary font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                    {result.optimized_prompt}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-64 flex flex-col items-center justify-center opacity-10"><Wand2 size={48} /></div>
          )}
        </div>

        <div className="p-6 border-t border-border-subtle bg-bg-primary flex gap-4 shrink-0">
          <button onClick={handleClose} className="flex-1 py-3 bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-tertiary font-bold uppercase tracking-widest text-[10px] transition-all">Abortar</button>
          <button onClick={() => { onApply(result!.optimized_prompt); handleClose(); }} disabled={!result} className={`flex-1 py-3 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${!result ? 'bg-bg-secondary text-text-tertiary opacity-20' : 'bg-accent-primary hover:bg-accent-secondary text-white'}`}>
            {result && <Check size={16} />} Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OptimizeModal);