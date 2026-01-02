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
      <div className={`w-full max-w-lg bg-bg-secondary/95 backdrop-blur-2xl border border-border-visible flex flex-col shadow-2xl relative ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        
        {/* Header - Minimalist */}
        <div className="px-4 py-0.5 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Settings2 className="text-accent-primary" size={14} />
            <h2 className="text-[10px] font-medium tracking-[0.2em] text-text-primary uppercase">Parâmetros Nucleares</h2>
          </div>
          <button onClick={handleClose} className="p-1 text-text-tertiary hover:text-text-primary transition-all active:scale-90">
            <X size={16} />
          </button>
        </div>

        {/* Tabs - Compact */}
        <div className="flex border-b border-border-visible bg-bg-primary/40">
          <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 text-[10px] font-medium tracking-wide transition-all relative uppercase ${activeTab === 'settings' ? 'text-accent-primary bg-accent-subtle/10' : 'text-text-tertiary hover:text-text-secondary'}`}>
            Configuração
            {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary"></div>}
          </button>
          <button onClick={() => setActiveTab('shortcuts')} className={`flex-1 py-2 text-[10px] font-medium tracking-wide transition-all relative uppercase ${activeTab === 'shortcuts' ? 'text-accent-primary bg-accent-subtle/10' : 'text-text-tertiary hover:text-text-secondary'}`}>
            Atalhos
            {activeTab === 'shortcuts' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary"></div>}
          </button>
        </div>

        {/* Content - Compacted spacing */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-[380px] space-y-3">
          {activeTab === 'settings' ? (
            <div className="space-y-6">
              {factors.map(factor => (
                <div key={factor.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-text-secondary/80 uppercase tracking-widest block">{factor.label}</label>
                    {factor.type === 'toggle' && (
                      <button 
                        onClick={() => updateFactor(factor.id)} 
                        className={`w-10 h-5 border transition-all flex items-center px-0.5 relative cursor-pointer ${
                          factor.enabled ? 'bg-accent-primary/20 border-accent-primary' : 'bg-bg-primary border-border-visible'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 bg-white transition-transform shadow-sm ${factor.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    )}
                  </div>
                  
                  {factor.type === 'dropdown' && (
                    <div className="relative group">
                      <select 
                        value={factor.value} 
                        onChange={(e) => updateFactor(factor.id, e.target.value)} 
                        className="w-full bg-bg-primary/60 border border-border-visible/40 p-2 text-xs font-normal text-text-primary outline-none focus:border-accent-primary/60 transition-all appearance-none uppercase"
                      >
                        {factor.options?.map(opt => <option key={opt} value={opt} className="bg-bg-secondary">{opt.toUpperCase()}</option>)}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                        <Sparkles size={12} />
                      </div>
                    </div>
                  )}
                  
                  {factor.type === 'slider' && (
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min={factor.min} 
                        max={factor.max} 
                        value={factor.value} 
                        onChange={(e) => updateFactor(factor.id, parseInt(e.target.value))} 
                        className="flex-1 h-1 bg-border-subtle appearance-none cursor-pointer accent-accent-primary" 
                      />
                      <span className="text-xs font-mono font-medium text-accent-primary w-6 text-right">{factor.value}</span>
                    </div>
                  )}

                  {factor.type === 'text' && (
                    <textarea 
                      value={factor.value} 
                      // Fixed: missing arrow function syntax and updateFactor call
                      onChange={(e) => updateFactor(factor.id, e.target.value)} 
                      placeholder="Diretrizes de contexto..." 
                      className="w-full h-20 bg-bg-primary/60 border border-border-visible/40 p-2 text-xs font-normal text-text-primary placeholder:text-text-tertiary/40 focus:border-accent-primary/60 transition-all resize-none custom-scrollbar" 
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-10">
              <Sparkles size={48} className="text-accent-primary mb-4" />
              <p className="text-[9px] font-medium uppercase tracking-[0.4em]">Shortcuts Offline</p>
            </div>
          )}
        </div>

        {/* Footer - Minimalist */}
        <div className="px-4 py-3 border-t border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <button 
            onClick={() => confirm('Resetar parâmetros?') && resetFactors()} 
            className="flex items-center gap-2 text-text-tertiary/60 hover:text-red-400 text-[9px] font-normal uppercase tracking-wider transition-all"
          >
            <RotateCcw size={12} /> Resetar
          </button>
          <button 
            onClick={handleClose} 
            className="px-6 py-0.5 bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControllersModal;