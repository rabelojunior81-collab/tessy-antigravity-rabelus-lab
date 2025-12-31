import React, { useState, useEffect } from 'react';
import { X, Wand2, Check, AlertCircle, Loader2, Zap } from 'lucide-react';
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
    if (isOpen && inputText && inputText.trim().length > 0) {
      handleOptimize();
    }
  }, [isOpen, inputText]);

  const handleOptimize = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const optimizationResult = await geminiService.optimizePrompt(inputText);
      setResult(optimizationResult);
    } catch (err) {
      setError('Erro ao otimizar prompt. O núcleo de processamento está temporariamente instável.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result.optimized_prompt);
      handleClose();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-6 bg-black/85 backdrop-blur-md ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`w-full h-full sm:h-auto sm:max-w-5xl max-h-[100vh] sm:max-h-[90vh] bg-[#111111] border border-gray-800 flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Zap className="text-emerald-500" size={20} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Engenharia de Prompt</h2>
              <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mt-0.5">Módulo de Otimização Pro</span>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:text-white transition-all active:scale-90">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 space-y-10">
          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <Loader2 className="text-emerald-500 animate-spin" size={48} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 size={20} className="text-emerald-500/40 animate-pulse" />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 animate-pulse-soft">Analisando Sintaxe Lógica...</p>
            </div>
          ) : error ? (
            <div className="h-80 flex flex-col items-center justify-center text-center space-y-6">
              <AlertCircle className="text-red-500/50" size={48} />
              <div className="space-y-2">
                 <p className="text-[11px] font-black uppercase text-red-500">{error}</p>
                 <button onClick={handleOptimize} className="text-[9px] font-black text-emerald-500 uppercase underline tracking-widest">Tentar Reconectar</button>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-12 animate-fade-in">
              {/* Scores Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-8 bg-[#0a0a0a] border border-emerald-500/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rotate-45 translate-x-12 -translate-y-12 pointer-events-none"></div>
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-4 block">Clareza Estrutural</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter">{result.clarity_score.toFixed(1)}</span>
                    <span className="text-[12px] font-black text-emerald-500/40">/ 10.0</span>
                  </div>
                  <div className="w-full h-1 bg-gray-900 mt-6 overflow-hidden">
                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${result.clarity_score * 10}%` }}></div>
                  </div>
                </div>
                <div className="p-8 bg-[#0a0a0a] border border-emerald-500/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rotate-45 translate-x-12 -translate-y-12 pointer-events-none"></div>
                  <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest mb-4 block">Completude de Contexto</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter">{result.completeness_score.toFixed(1)}</span>
                    <span className="text-[12px] font-black text-emerald-500/40">/ 10.0</span>
                  </div>
                  <div className="w-full h-1 bg-gray-900 mt-6 overflow-hidden">
                    <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${result.completeness_score * 10}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Suggestions Grid */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 border-b border-gray-800 pb-3 flex items-center gap-3">
                  <span className="w-6 h-[2px] bg-emerald-500/30"></span> Sugestões de Refinamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.suggestions.map((s, idx) => (
                    <div key={idx} className="p-5 bg-emerald-500/5 border border-emerald-500/10 flex flex-col gap-2 group hover:border-emerald-500/30 transition-all">
                      <span className="text-[8px] font-black px-2 py-1 bg-emerald-500/10 text-emerald-500 uppercase w-fit tracking-widest">{s.category}</span>
                      <p className="text-[11px] font-black text-white uppercase leading-tight tracking-tight">{s.issue}</p>
                      <p className="text-[10px] text-gray-500 italic leading-relaxed">{s.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Prompt */}
              <div className="space-y-6">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-600 border-b border-gray-800 pb-3 flex items-center gap-3">
                  <span className="w-6 h-[2px] bg-emerald-500/30"></span> Protocolo Otimizado
                </h3>
                <div className="p-6 bg-black border border-emerald-500/20 relative group">
                  <pre className="text-[12px] text-gray-200 font-mono whitespace-pre-wrap leading-relaxed custom-scrollbar max-h-[400px] overflow-y-auto">
                    {result.optimized_prompt}
                  </pre>
                  <div className="absolute top-4 right-4 text-[7px] font-black text-emerald-500/40 uppercase tracking-widest">
                    AI_GEN_READY
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-80 flex flex-col items-center justify-center text-center opacity-10">
                <Wand2 size={64} className="mb-6" />
                <p className="text-[12px] font-black uppercase tracking-[0.5em]">Sistema em Espera</p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 border-t border-gray-800 bg-[#0a0a0a] flex flex-wrap gap-4 shrink-0">
          <button 
            onClick={handleClose}
            className="flex-1 sm:flex-none px-12 py-4 bg-transparent hover:bg-white/5 text-gray-500 font-black uppercase tracking-[0.2em] text-[10px] border border-gray-800 transition-all active:scale-95"
          >
            Abortar
          </button>
          <button 
            onClick={handleApply}
            disabled={!result}
            className={`flex-1 py-4 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 border-2 active:scale-95 ${
              !result 
                ? 'bg-gray-900 border-gray-800 text-gray-700 cursor-not-allowed' 
                : 'bg-emerald-600 border-black hover:bg-emerald-500 text-white shadow-[8px_8px_0_rgba(16,185,129,0.2)]'
            }`}
          >
            {result && <Check size={18} />}
            Aplicar ao Editor
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OptimizeModal);