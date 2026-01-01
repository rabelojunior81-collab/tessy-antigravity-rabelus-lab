
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
      <div className={`w-full max-w-4xl bg-bg-secondary/95 backdrop-blur-xl border border-border-visible flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="px-4 py-2 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="text-accent-primary" size={16} />
            <h2 className="text-xs font-medium tracking-normal text-text-primary uppercase">Otimização de Instrução</h2>
          </div>
          <button onClick={handleClose} className="p-1 text-text-tertiary hover:text-text-primary transition-all active:scale-90"><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10 min-h-[450px]">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-center gap-6 opacity-50">
              <Loader2 className="text-accent-primary animate-spin" size={40} />
              <p className="text-xs font-bold uppercase tracking-widest">Processando Metadados...</p>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center text-center gap-4 text-red-400">
              <AlertCircle size={40} />
              <p className="text-sm font-bold uppercase">{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-bg-tertiary/40 border border-border-visible text-center">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest block mb-3">Score de Clareza</span>
                  <span className="text-4xl font-bold text-accent-primary">{result.clarity_score.toFixed(1)}</span>
                </div>
                <div className="p-6 bg-bg-tertiary/40 border border-border-visible text-center">
                  <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest block mb-3">Score de Contexto</span>
                  <span className="text-4xl font-bold text-accent-primary">{result.completeness_score.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase text-text-tertiary tracking-widest border-b border-border-visible pb-2 flex items-center gap-2">
                   Protocolo Otimizado
                </h4>
                <div className="p-6 bg-bg-primary border border-border-visible">
                  <pre className="text-sm text-text-secondary font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto custom-scrollbar">
                    {result.optimized_prompt}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-64 flex flex-col items-center justify-center opacity-10"><Wand2 size={64} /></div>
          )}
        </div>

        <div className="p-8 border-t border-border-visible bg-bg-primary/80 backdrop-blur-md flex gap-4 shrink-0">
          <button onClick={handleClose} className="flex-1 py-4 bg-bg-tertiary hover:bg-bg-elevated text-text-tertiary font-bold uppercase tracking-widest text-xs transition-all">Abortar</button>
          <button onClick={() => { onApply(result!.optimized_prompt); handleClose(); }} disabled={!result} className={`flex-1 py-4 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 ${!result ? 'bg-bg-secondary text-text-tertiary opacity-30 cursor-not-allowed' : 'bg-accent-primary hover:bg-accent-secondary text-white shadow-lg'}`}>
            {result && <Check size={18} strokeWidth={3} />} Aplicar Instrução
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OptimizeModal);
