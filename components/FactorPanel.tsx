import React, { useCallback } from 'react';
import { Factor } from '../types';

interface FactorPanelProps {
  factors: Factor[];
  onToggle: (id: string, value?: any) => void;
}

const FactorPanel: React.FC<FactorPanelProps> = ({ factors, onToggle }) => {
  const handleToggle = useCallback((id: string) => {
    onToggle(id);
  }, [onToggle]);

  const handleSliderChange = useCallback((id: string, value: string) => {
    onToggle(id, parseInt(value));
  }, [onToggle]);

  const handleDropdownChange = useCallback((id: string, value: string) => {
    onToggle(id, value);
  }, [onToggle]);

  const handleTextChange = useCallback((id: string, value: string) => {
    onToggle(id, value);
  }, [onToggle]);

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto custom-scrollbar bg-transparent">
      <h2 className="text-xl font-black mb-8 text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border-b-2 border-emerald-600/25 pb-4 lg:shadow-[0_4px_0_rgba(16,185,129,0.05)]">
        Controladores
      </h2>
      <div className="space-y-6">
        {factors.map((factor) => {
          if (factor.type === 'toggle') {
            return (
              <div key={factor.id} className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/40 border-2 lg:border border-emerald-600/25 shadow-[4px_4px_0_rgba(16,185,129,0.1)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.3)] lg:shadow-[6px_6px_0_rgba(16,185,129,0.1)] hover:lg:border-emerald-600/50 transition-all group">
                <span className={`text-xs font-black uppercase tracking-wider transition-colors duration-300 ${factor.enabled ? 'text-emerald-600 glow-text-green' : 'text-slate-800 dark:text-white'}`}>{factor.label}</span>
                <button
                  onClick={() => handleToggle(factor.id)}
                  className={`w-14 h-7 border-2 lg:border transition-all flex items-center px-1 ${
                    factor.enabled ? 'bg-emerald-600 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                  } !rounded-none shadow-inner`}
                >
                  <div className={`w-4 h-4 bg-white transition-transform ${factor.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            );
          } else if (factor.type === 'slider') {
            return (
              <div key={factor.id} className="p-5 bg-white/80 dark:bg-slate-900/40 border-2 lg:border border-emerald-600/25 shadow-[4px_4px_0_rgba(16,185,129,0.1)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.3)] lg:shadow-[6px_6px_0_rgba(16,185,129,0.1)] hover:lg:border-emerald-600/50 transition-all group">
                <label className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4 transition-colors group-hover:text-emerald-600">
                  {factor.label}
                </label>
                <input
                  type="range" min={factor.min || 1} max={factor.max || 5} value={factor.value ?? 3}
                  onChange={(e) => handleSliderChange(factor.id, e.target.value)}
                  className="w-full h-1 bg-slate-300 dark:bg-slate-700 appearance-none cursor-pointer accent-emerald-600"
                  style={{ borderRadius: 0 }}
                />
                <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase mt-4 tracking-tighter">
                  <span>Conciso</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm glow-text-green">LVL {factor.value ?? 3}</span>
                  <span>Detalhado</span>
                </div>
              </div>
            );
          } else if (factor.type === 'dropdown') {
            return (
              <div key={factor.id} className="p-5 bg-white/80 dark:bg-slate-900/40 border-2 lg:border border-emerald-600/25 shadow-[4px_4px_0_rgba(16,185,129,0.1)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.3)] lg:shadow-[6px_6px_0_rgba(16,185,129,0.1)] hover:lg:border-emerald-600/50 transition-all group">
                <label className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3 transition-colors group-hover:text-emerald-600">
                  {factor.label}
                </label>
                <select
                  value={factor.value ?? (factor.options?.[0] || 'intermediario')}
                  onChange={(e) => handleDropdownChange(factor.id, e.target.value)}
                  className="w-full bg-white/85 dark:bg-slate-800 border-2 lg:border border-emerald-600/25 p-3 text-xs font-bold text-slate-800 dark:text-white uppercase focus:outline-none focus:border-emerald-600 transition-all !rounded-none focus:lg:shadow-[4px_4px_0_rgba(16,185,129,0.2)]"
                >
                  {factor.options?.map((opt) => (
                    <option key={opt} value={opt} className="dark:bg-slate-800">{opt.toUpperCase()}</option>
                  )) || (
                    <>
                      <option value="iniciante" className="dark:bg-slate-800">INICIANTE</option>
                      <option value="intermediario" className="dark:bg-slate-800">INTERMEDIÁRIO</option>
                      <option value="avancado" className="dark:bg-slate-800">AVANÇADO</option>
                      <option value="especialista" className="dark:bg-slate-800">ESPECIALISTA</option>
                    </>
                  )}
                </select>
              </div>
            );
          } else if (factor.type === 'text') {
            return (
              <div key={factor.id} className="p-5 bg-white/80 dark:bg-slate-900/40 border-2 lg:border border-emerald-600/25 shadow-[4px_4px_0_rgba(16,185,129,0.1)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.3)] lg:shadow-[6px_6px_0_rgba(16,185,129,0.1)] hover:lg:border-emerald-600/50 transition-all group">
                <label className="block text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-3 transition-colors group-hover:text-emerald-600">
                  {factor.label}
                </label>
                <textarea
                  value={factor.value ?? ''}
                  onChange={(e) => handleTextChange(factor.id, e.target.value)}
                  placeholder="EX: PROTOCOLO NODE.JS..."
                  className="w-full bg-white/85 dark:bg-slate-800 border-2 lg:border border-emerald-600/25 p-4 text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:border-emerald-600 resize-none transition-all !rounded-none h-32 custom-scrollbar placeholder:text-slate-400 dark:placeholder:text-emerald-900/30 focus:lg:shadow-[4px_4px_0_rgba(16,185,129,0.2)]"
                />
              </div>
            );
          }
          return null;
        })}
      </div>
      
      <div className="mt-auto p-6 bg-emerald-600/15 dark:bg-emerald-900/20 border-2 lg:border border-emerald-600/30 shadow-[6px_6px_0_rgba(16,185,129,0.1)] dark:shadow-[6px_6px_0_rgba(0,0,0,0.3)] lg:shadow-[8px_8px_0_rgba(16,185,129,0.1)]">
        <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
           <span className="w-1.5 h-3 bg-emerald-400 shadow-[0_0_8px_#10b981]"></span> Dica do Sistema
        </h4>
        <p className="text-[11px] text-slate-800 dark:text-emerald-100/70 leading-relaxed font-medium">
          Modo Profissional impõe clareza semântica rigorosa. Controle de profundidade ajusta densidade de tokens.
        </p>
      </div>
    </div>
  );
};

export default React.memo(FactorPanel);