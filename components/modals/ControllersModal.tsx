import React, { useState } from 'react';
import { X, Settings2, Sparkles, RotateCcw, Check } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';

interface ControllersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ControllersModal: React.FC<ControllersModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'shortcuts'>('settings');
  const [isClosing, setIsClosing] = useState(false);
  const { factors, updateFactor, resetFactors } = useChat();

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleReset = () => {
    if (confirm('Restaurar todas as configurações para o padrão de fábrica?')) {
      resetFactors();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex items-center justify-center p-0 sm:p-9 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] bg-[#111111] border border-gray-800 flex flex-col shadow-2xl relative overflow-hidden rounded-none ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-9 py-6 border-b border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center rounded-none">
              <Settings2 className="text-emerald-500" size={24} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[14px] font-bold uppercase tracking-[0.05em] text-text-primary">Configurações da IA</h2>
              <span className="text-[10px] font-semibold text-emerald-500/60 uppercase tracking-widest mt-1.5">Painel de Controle Antigravity</span>
            </div>
          </div>
          <button onClick={handleClose} className="p-3 text-gray-500 hover:text-white transition-all rounded-none">
            <X size={28} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-[#0d0d0d]">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-5 text-[10px] font-bold uppercase tracking-widest transition-all relative rounded-none ${
              activeTab === 'settings' ? 'text-emerald-500 bg-emerald-500/5' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Settings
            {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('shortcuts')}
            className={`flex-1 py-5 text-[10px] font-bold uppercase tracking-widest transition-all relative rounded-none ${
              activeTab === 'shortcuts' ? 'text-emerald-500 bg-emerald-500/5' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            AI Shortcuts
            {activeTab === 'shortcuts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-9 sm:p-14">
          {activeTab === 'settings' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Toggles Group */}
              <div className="space-y-9">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-6 border-b border-gray-800 pb-3">Switches de Sistema</h4>
                <div className="space-y-5">
                  {factors.filter(f => f.type === 'toggle').map(factor => (
                    <div key={factor.id} className="flex items-center justify-between p-6 bg-black/40 border border-gray-800/50 hover:border-emerald-500/20 transition-all rounded-none">
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-bold uppercase tracking-widest ${factor.enabled ? 'text-emerald-500' : 'text-gray-400'}`}>
                          {factor.label}
                        </span>
                        <span className="text-[8px] font-semibold text-gray-700 uppercase mt-1">Status: {factor.enabled ? 'ATIVO' : 'OFFLINE'}</span>
                      </div>
                      <button
                        onClick={() => updateFactor(factor.id)}
                        className={`w-12 h-6 border transition-all flex items-center px-1 rounded-none ${
                          factor.enabled ? 'bg-emerald-600/20 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'bg-gray-900 border-gray-800'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-emerald-500 transition-transform rounded-none ${factor.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sliders & Dropdowns Group */}
              <div className="space-y-9">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-tertiary mb-6 border-b border-gray-800 pb-3">Parâmetros Lógicos</h4>
                <div className="space-y-9">
                  {factors.map(factor => {
                    if (factor.type === 'dropdown') {
                      return (
                        <div key={factor.id} className="space-y-3">
                          <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.08em] block">{factor.label}</label>
                          <select
                            value={factor.value}
                            onChange={(e) => updateFactor(factor.id, e.target.value)}
                            className="w-full bg-black border border-gray-800 p-4 text-[11px] font-bold text-emerald-500 uppercase outline-none focus:border-emerald-500/50 transition-all rounded-none"
                          >
                            {factor.options?.map(opt => (
                              <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    if (factor.type === 'slider') {
                      return (
                        <div key={factor.id} className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.08em]">{factor.label}</label>
                            <span className="text-[11px] font-mono font-bold text-emerald-500">LEVEL {factor.value}</span>
                          </div>
                          <input
                            type="range" min={factor.min} max={factor.max} value={factor.value}
                            onChange={(e) => updateFactor(factor.id, parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-800 appearance-none cursor-pointer accent-emerald-500 rounded-none"
                          />
                        </div>
                      );
                    }
                    if (factor.type === 'text') {
                      return (
                        <div key={factor.id} className="space-y-3">
                          <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.08em] block">{factor.label}</label>
                          <textarea
                            value={factor.value}
                            onChange={(e) => updateFactor(factor.id, e.target.value)}
                            placeholder="Defina diretrizes de contexto para a IA..."
                            className="w-full h-32 bg-black border border-gray-800 p-5 text-[13px] font-normal text-text-primary outline-none focus:border-emerald-500/50 transition-all resize-none custom-scrollbar rounded-none"
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
              <Sparkles size={64} className="text-emerald-500" />
              <div className="space-y-3">
                <p className="text-[14px] font-bold uppercase text-text-primary tracking-[0.05em]">Atalhos de IA</p>
                <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.2em]">Módulos de Automação em Breve</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-9 border-t border-gray-800 bg-[#0a0a0a] flex items-center justify-between shrink-0">
          <button 
            onClick={handleReset}
            className="flex items-center gap-3 px-7 py-4 bg-red-600/5 border border-red-600/20 text-red-500 text-[11px] font-bold uppercase tracking-widest hover:bg-red-600/10 transition-all rounded-none"
          >
            <RotateCcw size={16} />
            Restaurar Padrões
          </button>
          <div className="flex gap-6">
            <button 
              onClick={handleClose}
              className="px-14 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-[8px_8px_0_#065f46] rounded-none active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Confirmar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControllersModal;