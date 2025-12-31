
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings2, SlidersHorizontal } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

const Controllers: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { factors, updateFactor } = useChat();

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className={`flex flex-col bg-[#111111] border-b border-gray-800 transition-all duration-300 ${isExpanded ? 'h-[300px]' : 'h-[44px]'}`}>
      <div 
        onClick={toggleExpanded}
        className="h-[44px] flex items-center justify-between px-5 bg-[#0a0a0a]/50 cursor-pointer hover:bg-[#151515] transition-colors shrink-0"
      >
        <div className="flex items-center gap-2.5">
          <Settings2 size={14} className="text-emerald-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Controladores de Sistema</h3>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {factors.map((factor) => {
              if (factor.type === 'toggle') {
                return (
                  <div key={factor.id} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-gray-800 hover:border-emerald-500/20 transition-all group">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${factor.enabled ? 'text-emerald-500' : 'text-gray-500'}`}>
                      {factor.label}
                    </span>
                    <button
                      onClick={() => updateFactor(factor.id)}
                      className={`w-10 h-5 border transition-all flex items-center px-0.5 ${
                        factor.enabled ? 'bg-emerald-600/20 border-emerald-500' : 'bg-gray-800 border-gray-700'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 bg-emerald-500 transition-transform ${factor.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                );
              }
              return null;
            })}
          </div>

          <div className="space-y-6">
            {factors.map((factor) => {
              if (factor.type === 'slider') {
                return (
                  <div key={factor.id} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{factor.label}</label>
                      <span className="text-[9px] font-mono text-emerald-500">LVL {factor.value ?? 3}</span>
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
                  <div key={factor.id} className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{factor.label}</label>
                    <select
                      value={factor.value ?? 'intermediario'}
                      onChange={(e) => updateFactor(factor.id, e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-gray-800 p-2.5 text-[10px] font-black text-gray-400 uppercase outline-none focus:border-emerald-500 transition-all"
                    >
                      {factor.options?.map(opt => (
                        <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                );
              } else if (factor.type === 'text') {
                return (
                  <div key={factor.id} className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{factor.label}</label>
                    <textarea
                      value={factor.value ?? ''}
                      onChange={(e) => updateFactor(factor.id, e.target.value)}
                      placeholder="Instruções extras de sistema..."
                      className="w-full bg-[#0a0a0a] border border-gray-800 p-3 text-[10px] font-medium text-gray-400 h-24 resize-none outline-none focus:border-emerald-500 transition-all custom-scrollbar"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Controllers;
