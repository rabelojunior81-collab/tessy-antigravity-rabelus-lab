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
    }, 150);
  };

  const handleConfirm = () => {
    setIsRestarting(true);
    setTimeout(() => { onConfirm(); setIsRestarting(false); handleClose(); }, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-xs glass-modal flex flex-col border-red-500/30 ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-2 py-1 glass-header flex items-center justify-between shrink-0 border-b-red-500/20">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="text-red-500" size={10} />
            <h2 className="text-[9px] font-bold tracking-widest text-red-400 uppercase">Alerta</h2>
          </div>
          <button onClick={handleClose} className="p-0.5 text-glass-muted hover:text-glass transition-all">
            <X size={10} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col items-center text-center space-y-2">
          <AlertTriangle className="text-red-500/50" size={24} />
          <div className="space-y-1">
            <h3 className="text-sm font-normal text-glass tracking-normal">Purgar Sessão?</h3>
            <p className="text-[8px] font-normal text-glass-muted uppercase leading-relaxed tracking-wide">
              Memória volátil será destruída permanentemente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 glass-header glass-header-compact flex gap-2 shrink-0">
          <button
            onClick={handleClose}
            className="flex-1 py-1.5 glass-card border-glass/10 text-glass-muted font-bold uppercase tracking-widest text-[8px] hover:text-glass transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            style={{ borderColor: 'rgba(var(--accent-rgb), 0.3)', color: 'var(--glass-accent)' }}
            className="flex-1 py-1.5 bg-white/5 border font-bold uppercase tracking-widest text-[8px] transition-all hover:bg-white/10 active:scale-95"
          >
            Arquivar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isRestarting}
            className="flex-1 py-1.5 bg-red-600/80 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-[8px] transition-all disabled:opacity-50 active:scale-95 shadow-[0_4px_12px_rgba(220,38,38,0.2)]"
          >
            {isRestarting ? '...' : 'Purgar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RestartModal);
