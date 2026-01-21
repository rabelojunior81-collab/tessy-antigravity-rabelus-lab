import React, { useState, useEffect } from 'react';
import { X, Wand2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { OptimizationResult } from '../../types';
import * as geminiService from '../../services/gemini/service';
import { getGeminiToken } from '../../services/gemini/client';

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

  const handleOptimize = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = await getGeminiToken();
      if (!token) {
        setError('Chave Gemini ausente. Configure nos Parâmetros.');
        setIsLoading(false);
        return;
      }
      const res = await geminiService.optimizePrompt(token, inputText);
      setResult(res);
    } catch (err) {
      setError('Erro no núcleo de otimização.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setResult(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Trigger optimization when modal opens with valid text
  useEffect(() => {
    if (isOpen && inputText && inputText.trim()) {
      handleOptimize();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-sm glass-modal flex flex-col ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-2 py-0.5 glass-header glass-header-compact flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <Wand2 style={{ color: 'var(--glass-accent)' }} size={10} />
            <h2 className="text-[9px] font-bold tracking-widest text-glass uppercase">Otimizar</h2>
          </div>
          <button onClick={handleClose} className="p-0.5 text-glass-muted hover:text-glass transition-all">
            <X size={10} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 min-h-[120px] max-h-[40vh]">
          {isLoading ? (
            <div className="h-28 flex flex-col items-center justify-center text-center gap-2 opacity-70">
              <Loader2 style={{ color: 'var(--glass-accent)' }} className="animate-spin" size={20} />
              <p className="text-[8px] font-bold uppercase tracking-widest text-glass-muted">Processando...</p>
            </div>
          ) : error ? (
            <div className="h-28 flex flex-col items-center justify-center text-center gap-2 text-red-400">
              <AlertCircle size={20} />
              <p className="text-[8px] font-bold uppercase">{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-2 animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div className="px-2 py-1.5 glass-card text-center flex items-center justify-between border-glass/10">
                  <span className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">Clareza</span>
                  <span style={{ color: 'var(--glass-accent)' }} className="text-sm font-bold">{result.clarity_score.toFixed(1)}</span>
                </div>
                <div className="px-2 py-1.5 glass-card text-center flex items-center justify-between border-glass/10">
                  <span className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">Contexto</span>
                  <span style={{ color: 'var(--glass-accent)' }} className="text-sm font-bold">{result.completeness_score.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-[8px] font-bold uppercase text-glass-muted tracking-widest border-b border-glass/10 pb-1">
                  Protocolo Otimizado
                </h4>
                <div className="p-2 glass-card border-glass/10">
                  <pre className="text-[9px] text-glass-secondary font-mono whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                    {result.optimized_prompt}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-28 flex flex-col items-center justify-center opacity-10">
              <Wand2 size={24} className="text-glass-accent" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 glass-header glass-header-compact flex gap-2 shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 py-1 glass-card border-glass/10 text-glass-muted font-bold uppercase tracking-widest text-[8px] hover:text-glass transition-all active:scale-95"
          >
            Abortar
          </button>
          <button
            onClick={() => { onApply(result!.optimized_prompt); handleClose(); }}
            disabled={!result}
            style={{
              backgroundColor: result ? 'var(--glass-accent)' : undefined,
              boxShadow: result ? '0 4px 12px rgba(var(--accent-rgb), 0.3)' : 'none'
            }}
            className={`flex-1 py-1 font-bold uppercase tracking-widest text-[8px] transition-all flex items-center justify-center gap-1 active:scale-95 ${!result
              ? 'glass-card border-glass/5 opacity-30 cursor-not-allowed text-glass-muted'
              : 'text-white border-transparent'
              }`}
          >
            {result && <Check size={10} strokeWidth={3} />} Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OptimizeModal);
