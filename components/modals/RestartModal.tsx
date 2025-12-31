
import React, { useState } from 'react';
import { X, RotateCcw, AlertTriangle } from 'lucide-react';

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
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`w-full h-full sm:h-auto sm:max-w-sm bg-[#111111] border border-gray-800 flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-800 bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RotateCcw className="text-red-500" size={18} />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Reiniciar</h2>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 sm:p-10 flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 flex items-center justify-center animate-pulse">
            <AlertTriangle className="text-red-500" size={32} />
          </div>

          <div className="space-y-4">
            <h3 className="text-[14px] font-black uppercase text-white tracking-tight">Reiniciar Protocolo Atual?</h3>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                Todas as mensagens atuais serão perdidas permanentemente.
              </p>
              <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">
                ESTA AÇÃO NÃO PODE SER DESFEITA.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-800 bg-[#0a0a0a] flex gap-3 shrink-0">
          <button 
            onClick={handleClose}
            className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-[10px] border border-gray-800 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isRestarting}
            className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[10px] transition-all shadow-[6px_6px_0_#991b1b]"
          >
            {isRestarting ? 'Executando...' : 'Reiniciar Agora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestartModal;
