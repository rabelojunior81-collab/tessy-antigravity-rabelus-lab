import React, { useState } from 'react';
import { X, Settings2, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
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
    }, 150);
  };

  return (
    <div
      className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-sm glass-modal flex flex-col ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className="px-3 py-2 glass-header flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="text-glass-accent" size={12} />
            <h2 className="text-[10px] font-bold tracking-widest text-glass uppercase">Parâmetros</h2>
          </div>
          <button onClick={handleClose} className="p-0.5 text-glass-muted hover:text-glass transition-all">
            <X size={12} />
          </button>
        </div>

        {/* Tabs - Compact */}
        <div className="flex border-b border-glass shrink-0">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 text-[9px] font-bold tracking-widest transition-all relative uppercase ${activeTab === 'settings'
              ? 'text-glass-accent bg-white/5'
              : 'text-glass-muted hover:text-glass'
              }`}
          >
            Config
            {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-glass-accent" />}
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex-1 py-1.5 text-[9px] font-bold tracking-widest transition-all relative uppercase ${activeTab === 'shortcuts'
              ? 'text-glass-accent bg-white/5'
              : 'text-glass-muted hover:text-glass'
              }`}
          >
            Atalhos
            {activeTab === 'shortcuts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-glass-accent" />}
          </button>
        </div>

        {/* Content - Compact spacing */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-2 max-h-[50vh]">
          {activeTab === 'settings' ? (
            <div className="space-y-2">
              {factors.map(factor => (
                <div key={factor.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">{factor.label}</label>
                    {factor.type === 'toggle' && (
                      <button
                        onClick={() => updateFactor(factor.id)}
                        className={`w-7 h-3.5 transition-all flex items-center px-0.5 ${factor.enabled
                          ? 'bg-glass-accent justify-end'
                          : 'bg-white/10 justify-start'
                          }`}
                      >
                        <div className="w-2.5 h-2.5 bg-white" />
                      </button>
                    )}
                  </div>

                  {factor.type === 'dropdown' && (
                    <div className="relative">
                      <select
                        value={factor.value}
                        onChange={(e) => updateFactor(factor.id, e.target.value)}
                        className="w-full glass-input py-1.5 px-2 text-[10px] font-medium uppercase appearance-none cursor-pointer text-glass hover:bg-white/5 transition-colors focus:border-glass-accent focus:outline-none"
                      >
                        {factor.options?.map(opt => (
                          <option key={opt} value={opt} className="bg-bg-primary">{opt.toUpperCase()}</option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown size={10} className="text-glass-muted" />
                      </div>
                    </div>
                  )}

                  {factor.type === 'slider' && (
                    <div className="flex items-center gap-2 glass-card border-glass/10 py-1.5 px-2">
                      <input
                        type="range"
                        min={factor.min}
                        max={factor.max}
                        value={factor.value}
                        onChange={(e) => updateFactor(factor.id, parseInt(e.target.value))}
                        className="flex-1 h-0.5 appearance-none cursor-pointer bg-surface-elevated"
                        style={{
                          background: `linear-gradient(to right, var(--glass-accent) ${((factor.value as number) - (factor.min || 0)) / ((factor.max || 100) - (factor.min || 0)) * 100}%, rgba(var(--surface-rgb), 0.1) ${((factor.value as number) - (factor.min || 0)) / ((factor.max || 100) - (factor.min || 0)) * 100}%)`,
                        }}
                      />
                      <span className="text-[9px] font-mono font-bold text-glass-accent w-4 text-right">{factor.value}</span>
                    </div>
                  )}

                  {factor.type === 'text' && (
                    <textarea
                      value={factor.value}
                      onChange={(e) => updateFactor(factor.id, e.target.value)}
                      placeholder="Contexto..."
                      className="w-full h-16 glass-input py-1.5 px-2 text-[10px] text-glass resize-none custom-scrollbar focus:border-glass-accent focus:outline-none transition-colors placeholder:text-glass-muted/40"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-center opacity-20">
              <Sparkles size={24} className="text-glass-accent mb-2" />
              <p className="text-[8px] font-bold uppercase tracking-widest text-glass-muted">Offline</p>
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        <div className="px-3 py-2 glass-header flex items-center justify-between shrink-0">
          <button
            onClick={() => confirm('Resetar?') && resetFactors()}
            className="flex items-center gap-1 text-glass-muted hover:text-red-400 text-[8px] font-bold uppercase tracking-wide transition-all"
          >
            <RotateCcw size={10} /> Reset
          </button>
          <button
            onClick={handleClose}
            className="px-3 py-1 text-[9px] font-bold uppercase tracking-widest bg-glass-accent text-white hover:brightness-110 transition-all active:scale-95 shadow-[0_4px_12px_rgba(var(--accent-rgb),0.3)]"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControllersModal;

