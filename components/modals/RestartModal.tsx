
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
      <div className={`w-full max-w-sm bg-bg-secondary border border-red-600/30 flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-red-600/10 bg-bg-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={16} />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-500">Atenção</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all"><X size={20} /></button>
        </div>

        <div className="p-10 flex flex-col items-center text-center space-y-6">
          <AlertTriangle className="text-red-500 opacity-50" size={40} />
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-text-primary tracking-tight">Purgar Protocolo?</h3>
            <p className="text-[10px] font-semibold text-text-tertiary uppercase leading-relaxed tracking-widest">
              Toda a memória desta sessão será perdida permanentemente.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-border-subtle bg-bg-primary flex flex-wrap gap-2 shrink-0">
          <button onClick={handleClose} className="flex-1 min-w-[80px] py-3 bg-bg-tertiary text-text-tertiary font-bold uppercase tracking-widest text-[9px] transition-all">Cancelar</button>
          <button onClick={onSave} className="flex-1 min-w-[80px] py-3 bg-accent-primary hover:bg-accent-secondary text-white font-bold uppercase tracking-widest text-[9px] transition-all">Salvar</button>
          <button onClick={handleConfirm} disabled={isRestarting} className="flex-1 min-w-[80px] py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-[9px] transition-all">
            {isRestarting ? 'PURGANDO...' : 'PURGAR'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RestartModal);
