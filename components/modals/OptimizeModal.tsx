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
      setError('Erro ao otimizar prompt. Verifique sua conexão e tente novamente.');
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
      className={`fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
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
              <Wand2 className="text-emerald-500" size={20} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Otimizar Prompt</h2>
              <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest mt-0.5">Motor Gemini 3 Pro</span>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 className="text-emerald-500 animate-spin" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">Analisando Estrutura Lógica...</p>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
              <AlertCircle className="text-red-500" size={40} />
              <p className="text-[10px] font-black uppercase text-red-500">{error}</p>
              <button onClick={handleOptimize} className="text-[9px] font-black text-emerald-500 uppercase underline">Tentar Novamente</button>
            </div>
          ) : result ? (
            <div className="space-y-10 animate-fade-in">
              {/* Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center text-center">
                  <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-2">Score de Clareza</span>
                  <div className="text-4xl font-black text-emerald-500 tracking-tighter">{result.clarity_score.toFixed(1)}</div>
                  <div className="w-full h-1 bg-gray-800 mt-4 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${result.clarity_score * 10}%` }}></div>
                  </div>
                </div>
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center text-center">
                  <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-2">Score de Completude</span>
                  <div className="text-4xl font-black text-emerald-500 tracking-tighter">{result.completeness_score.toFixed(1)}</div>
                  <div className="w-full h-1 bg-gray-800 mt-4 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${result.completeness_score * 10}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 border-b border-gray-800 pb-2">Sugestões de Refinamento</h3>
                <div className="grid grid-cols-1 gap-3">
                  {result.suggestions.map((s, idx) => (
                    <div key={idx} className="p-4 bg-[#151515] border-l-4 border-amber-500 flex flex-col gap-1">
                      <span className="text-[8px] font-black px-1.5 py-0.5 bg-amber-500/10 text-amber-500 uppercase w-fit mb-1">{s.category}</span>
                      <p className="text-[11px] font-black text-white uppercase tracking-tight">{s.issue}</p>
                      <p className="text-[10px] text-gray-400 italic leading-relaxed">{s.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DIFF Visual */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 border-b border-gray-800 pb-2">Comparação Estrutural</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                       <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Original</span>
                    </div>
                    <div className="p-4 bg-black border border-gray-800 h-full max-h-[300px] overflow-y-auto custom-scrollbar font-mono text-[11px] text-gray-500 leading-relaxed">
                      {inputText}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                       <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Otimizado</span>
                    </div>
                    <div className="p-4 bg-[#0a0f0a] border border-emerald-500/20 h-full max-h-[300px] overflow-y-auto custom-scrollbar font-mono text-[11px] text-gray-200 leading-relaxed">
                      {result.optimized_prompt}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="h-64 flex flex-col items-center justify-center text-center opacity-20">
                <Wand2 size={40} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest">Aguardando Entrada...</p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 border-t border-gray-800 bg-[#0a0a0a] flex flex-wrap gap-4 shrink-0">
          <button 
            onClick={handleClose}
            className="flex-1 sm:flex-none px-10 py-4 bg-gray-900 hover:bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-[10px] border border-gray-800 transition-all"
          >
            Fechar
          </button>
          <button 
            onClick={handleApply}
            disabled={!result}
            className={`flex-1 py-4 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 ${
              !result 
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[6px_6px_0_#065f46]'
            }`}
          >
            {result && <Check size={16} />}
            Aplicar Protocolo Otimizado
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizeModal;