
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

const Controllers: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { factors, updateFactor } = useChat();

  return (
    <div className="flex flex-col bg-[#111111] border-b border-gray-800 transition-all duration-300">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-[40px] flex items-center justify-between px-5 bg-[#0a0a0a]/50 cursor-pointer hover:bg-[#151515] transition-colors shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <Settings2 size={12} className="text-emerald-500" />
          <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Controladores</h3>
        </div>
        <button className="text-gray-500">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[400px] border-t border-gray-800/50' : 'max-h-0'}`}>
        <div className="p-4 sm:p-5 space-y-5 bg-[#0d0d0d]">
          <div className="grid grid-cols-2 gap-3">
            {factors.map((factor) => {
              if (factor.type === 'toggle') {
                return (
                  <div key={factor.id} className="flex items-center justify-between p-2.5 bg-[#0a0a0a] border border-gray-800 hover:border-emerald-500/10 transition-all">
                    <span className={`text-[8px] font-black uppercase tracking-widest ${factor.enabled ? 'text-emerald-500' : 'text-gray-600'}`}>
                      {factor.label}
                    </span>
                    <button
                      onClick={() => updateFactor(factor.id)}
                      className={`w-8 h-4 border transition-all flex items-center px-0.5 ${
                        factor.enabled ? 'bg-emerald-600/20 border-emerald-500' : 'bg-gray-800 border-gray-700'
                      }`}
                    >
                      <div className={`w-2.5 h-2.5 bg-emerald-500 transition-transform ${factor.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="space-y-5">
            {factors.map((factor) => {
              if (factor.type === 'slider') {
                return (
                  <div key={factor.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{factor.label}</label>
                      <span className="text-[8px] font-mono text-emerald-500">LVL {factor.value ?? 3}</span>
                    </div>
                    <input
                      type="range" min={factor.min || 1} max={factor.max || 5} value={factor.value ?? 3}
                      onChange={(e) => updateFactor(factor.id, parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-800 appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                );
              } else if (factor.type === 'dropdown') {
                return (
                  <div key={factor.id} className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{factor.label}</label>
                    <select
                      value={factor.value ?? 'intermediario'}
                      onChange={(e) => updateFactor(factor.id, e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-gray-800 p-2 text-[9px] font-black text-gray-400 uppercase outline-none focus:border-emerald-500/40"
                    >
                      {factor.options?.map(opt => (
                        <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                );
              } else if (factor.type === 'text') {
                return (
                  <div key={factor.id} className="space-y-1.5">
                    <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{factor.label}</label>
                    <textarea
                      value={factor.value ?? ''}
                      onChange={(e) => updateFactor(factor.id, e.target.value)}
                      placeholder="Instruções de sistema..."
                      className="w-full bg-[#0a0a0a] border border-gray-800 p-2 text-[9px] font-medium text-gray-400 h-16 resize-none outline-none focus:border-emerald-500/40 custom-scrollbar"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Controllers);
