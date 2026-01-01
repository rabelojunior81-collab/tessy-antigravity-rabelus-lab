
import React, { useState } from 'react';
import { X, Settings2, Sparkles, RotateCcw } from 'lucide-react';
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
    }, 100);
  };

  return (
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
      <div className={`w-full max-w-xl bg-bg-secondary/95 backdrop-blur-xl border border-border-visible flex flex-col shadow-2xl relative ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="px-4 py-2 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="text-accent-primary" size={16} />
            <h2 className="text-xs font-medium tracking-normal text-text-primary">Parâmetros IA</h2>
          </div>
          <button onClick={handleClose} className="p-1 text-text-tertiary hover:text-text-primary transition-all active:scale-90">
            <X size={16} />
          </button>
        </div>

        <div className="flex border-b border-border-visible bg-bg-primary/50 backdrop-blur-md">
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 text-xs font-medium tracking-normal transition-all relative ${activeTab === 'settings' ? 'text-accent-primary bg-accent-subtle/20' : 'text-text-tertiary'}`}>
            Configurações
            {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-primary"></div>}
          </button>
          <button onClick={() => setActiveTab('shortcuts')} className={`flex-1 py-4 text-xs font-medium tracking-normal transition-all relative ${activeTab === 'shortcuts' ? 'text-accent-primary bg-accent-subtle/20' : 'text-text-tertiary'}`}>
            Atalhos
            {activeTab === 'shortcuts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-primary"></div>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 min-h-[400px]">
          {activeTab === 'settings' ? (
            <div className="space-y-6">
              {factors.map(factor => (
                <div key={factor.id} className="space-y-3 bg-bg-tertiary/20 p-5 border border-border-visible/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">{factor.label}</label>
                    {factor.type === 'toggle' && (
                      <button onClick={() => updateFactor(factor.id)} className={`w-10 h-5 border transition-all flex items-center px-0.5 relative ${factor.enabled ? 'bg-accent-subtle border-accent-primary' : 'bg-bg-tertiary border-border-visible'}`}>
                        <div className={`w-3.5 h-3.5 bg-accent-primary transition-transform shadow-md ${factor.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    )}
                  </div>
                  
                  {factor.type === 'dropdown' && (
                    <select value={factor.value} onChange={(e) => updateFactor(factor.id, e.target.value)} className="w-full bg-bg-primary border border-border-visible p-3 text-xs font-normal text-text-primary outline-none focus:border-accent-primary transition-all">
                      {factor.options?.map(opt => <option key={opt} value={opt} className="bg-bg-secondary">{opt.toUpperCase()}</option>)}
                    </select>
                  )}
                  
                  {factor.type === 'slider' && (
                    <div className="flex items-center gap-6 pt-2">
                      <input type="range" min={factor.min} max={factor.max} value={factor.value} onChange={(e) => updateFactor(factor.id, parseInt(e.target.value))} className="flex-1 h-0.5 bg-bg-tertiary appearance-none cursor-pointer accent-accent-primary" />
                      <span className="text-xs font-mono font-medium text-accent-primary w-8 text-right">{factor.value}</span>
                    </div>
                  )}

                  {factor.type === 'text' && (
                    <textarea value={factor.value} onChange={(e) => updateFactor(factor.id, e.target.value)} placeholder="Inserir contexto..." className="w-full h-24 bg-bg-primary border border-border-visible p-3 text-sm font-normal text-text-primary outline-none focus:border-accent-primary transition-all resize-none custom-scrollbar" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20">
              <Sparkles size={64} className="text-accent-primary mb-6" />
              <p className="text-xs font-medium uppercase tracking-[0.4em]">Shortcuts Module Inactive</p>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <button onClick={() => confirm('Resetar parâmetros?') && resetFactors()} className="flex items-center gap-2 text-text-tertiary hover:text-red-400 text-[10px] font-medium uppercase tracking-wide transition-all">
            <RotateCcw size={14} /> Resetar Nucleus
          </button>
          <button onClick={handleClose} className="px-10 py-3 bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-medium uppercase tracking-wide transition-all active:scale-95 shadow-lg">
            Confirmar Parâmetros
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControllersModal;
