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
      <div className={`w-full max-w-2xl bg-bg-secondary border border-border-visible flex flex-col shadow-2xl relative ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-primary">
          <div className="flex items-center gap-3">
            <Settings2 className="text-accent-primary" size={20} />
            <h2 className="text-[14px] font-bold uppercase tracking-[0.05em] text-text-primary">Parâmetros IA</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-border-subtle bg-bg-primary/50">
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'settings' ? 'text-accent-primary bg-accent-primary/5' : 'text-text-tertiary'}`}>
            Configurações
            {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-primary"></div>}
          </button>
          <button onClick={() => setActiveTab('shortcuts')} className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'shortcuts' ? 'text-accent-primary bg-accent-primary/5' : 'text-text-tertiary'}`}>
            Atalhos
            {activeTab === 'shortcuts' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-primary"></div>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 min-h-[400px]">
          {activeTab === 'settings' ? (
            <div className="space-y-8">
              {factors.map(factor => (
                <div key={factor.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{factor.label}</label>
                    {factor.type === 'toggle' && (
                      <button onClick={() => updateFactor(factor.id)} className={`w-10 h-5 border transition-all flex items-center px-1 ${factor.enabled ? 'bg-accent-primary/20 border-accent-primary' : 'bg-bg-tertiary border-border-subtle'}`}>
                        <div className={`w-3 h-3 bg-accent-primary transition-transform ${factor.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    )}
                  </div>
                  
                  {factor.type === 'dropdown' && (
                    <select value={factor.value} onChange={(e) => updateFactor(factor.id, e.target.value)} className="w-full bg-bg-tertiary border border-border-subtle p-3 text-[11px] font-semibold text-text-primary uppercase outline-none focus:border-accent-primary transition-all">
                      {factor.options?.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                    </select>
                  )}
                  
                  {factor.type === 'slider' && (
                    <div className="flex items-center gap-4">
                      <input type="range" min={factor.min} max={factor.max} value={factor.value} onChange={(e) => updateFactor(factor.id, parseInt(e.target.value))} className="flex-1 h-1 bg-bg-tertiary appearance-none cursor-pointer accent-accent-primary" />
                      <span className="text-[11px] font-mono text-accent-primary w-8 text-right">{factor.value}</span>
                    </div>
                  )}

                  {factor.type === 'text' && (
                    <textarea value={factor.value} onChange={(e) => updateFactor(factor.id, e.target.value)} className="w-full h-24 bg-bg-tertiary border border-border-subtle p-3 text-[12px] font-normal text-text-primary outline-none focus:border-accent-primary transition-all resize-none custom-scrollbar" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-12">
              <Sparkles size={48} className="text-accent-primary mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Em Breve</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border-subtle bg-bg-primary flex items-center justify-between shrink-0">
          <button onClick={() => confirm('Resetar?') && resetFactors()} className="flex items-center gap-2 text-text-tertiary hover:text-red-400 text-[10px] font-bold uppercase tracking-widest transition-all">
            <RotateCcw size={14} /> Reset
          </button>
          <button onClick={handleClose} className="px-8 py-3 bg-accent-primary hover:bg-accent-secondary text-white text-[11px] font-bold uppercase tracking-[0.1em] transition-all active:scale-95">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControllersModal;