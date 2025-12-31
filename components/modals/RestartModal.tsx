import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RestartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const RestartModal: React.FC<RestartModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    setIsRestarting(true);
    setTimeout(() => {
      onConfirm();
      setIsRestarting(false);
      handleClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`w-full max-w-sm bg-[#0a0a0a] border-4 border-red-600/30 flex flex-col shadow-[20px_20px_0_rgba(220,38,38,0.1)] ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-red-600/20 bg-red-600/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-red-500" size={18} />
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-red-500">Destruição de Dados</h2>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-600 hover:text-white transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>

        <div className="p-10 flex flex-col items-center text-center space-y-8">
          <div className="relative">
             <div className="w-20 h-20 bg-red-600/5 border-2 border-red-600/20 flex items-center justify-center rotate-45">
                <AlertTriangle className="text-red-600 -rotate-45" size={40} />
             </div>
             <div className="absolute inset-0 bg-red-600/10 animate-pulse rotate-45 pointer-events-none"></div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase text-white tracking-tighter leading-none">Purgar Protocolo?</h3>
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                Toda a memória de contexto desta sessão será permanentemente removida do buffer local.
              </p>
              <div className="py-2 px-4 bg-red-600/10 border border-red-600/20 inline-block">
                <p className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em]">
                  AÇÃO IRREVERSÍVEL
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 bg-black flex gap-4 shrink-0">
          <button 
            onClick={handleClose}
            className="flex-1 py-4 bg-transparent hover:bg-white/5 text-gray-600 font-black uppercase tracking-widest text-[10px] border border-gray-800 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isRestarting}
            className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] border border-black transition-all active:scale-95 shadow-[6px_6px_0_rgba(153,27,27,0.5)]"
          >
            {isRestarting ? 'PURGANDO...' : 'CONFIRMAR PURGA'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RestartModal);