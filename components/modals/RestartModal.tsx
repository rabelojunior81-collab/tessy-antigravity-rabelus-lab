
import React, { useState } from 'react';
import { X, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RestartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSave: () => void;
}

const RestartModal: React.FC<RestartModalProps> = ({ isOpen, onClose, onConfirm, onSave }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 100);
  };

  const handleConfirm = () => {
    setIsRestarting(true);
    setTimeout(() => { onConfirm(); setIsRestarting(false); handleClose(); }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
      <div className={`w-full max-w-sm bg-bg-secondary/95 backdrop-blur-xl border border-red-900/40 flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-red-900/20 bg-bg-primary/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={18} />
            <h2 className="text-sm font-medium tracking-wide text-red-400">Alerta Crítico</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all active:scale-90"><X size={20} /></button>
        </div>

        <div className="p-12 flex flex-col items-center text-center space-y-6">
          <AlertTriangle className="text-red-500/40" size={48} />
          <div className="space-y-4">
            <h3 className="text-xl font-normal text-text-primary tracking-normal">Purgar Sessão Atual?</h3>
            <p className="text-xs font-normal text-text-tertiary uppercase leading-relaxed tracking-wide opacity-80">
              Toda a memória volátil deste protocolo será destruída permanentemente.
            </p>
          </div>
        </div>

        <div className="p-8 border-t border-border-visible bg-bg-primary/80 backdrop-blur-md flex flex-wrap gap-3 shrink-0">
          <button onClick={handleClose} className="flex-1 min-w-[100px] py-3.5 bg-bg-tertiary hover:bg-bg-elevated text-text-tertiary font-medium uppercase tracking-wide text-xs transition-all">Cancelar</button>
          <button onClick={onSave} className="flex-1 min-w-[100px] py-3.5 bg-accent-primary/20 hover:bg-accent-primary/30 border border-accent-primary/40 text-accent-primary font-medium uppercase tracking-wide text-xs transition-all">Arquivar</button>
          <button onClick={handleConfirm} disabled={isRestarting} className="flex-1 min-w-[100px] py-3.5 bg-red-600 hover:bg-red-500 text-white font-medium uppercase tracking-wide text-xs transition-all shadow-lg">
            {isRestarting ? 'PURGANDO...' : 'PURGAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RestartModal);
