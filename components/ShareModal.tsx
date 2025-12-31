
import React, { useState, useEffect } from 'react';
import { loadConversation } from '../services/storageService';
import { Conversation } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  conversationTitle: string;
  onImportSuccess?: (conv: Conversation) => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  conversationId, 
  conversationTitle,
  onImportSuccess 
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'import'>('share');
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: 'info' as 'success' | 'error' | 'info' });
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setShareCode('');
      setStatusMessage({ text: '', type: 'info' });
    }
  }, [isOpen, conversationId]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const generateShareCode = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    localStorage.setItem(`tessy-shared-${code}`, conversationId);
    setShareCode(code);
    
    navigator.clipboard.writeText(code).then(() => {
      setStatusMessage({ text: `CÓDIGO ${code} GERADO E COPIADO!`, type: 'success' });
    });
  };

  const handleImport = () => {
    const code = importCode.trim().toUpperCase();
    if (code.length !== 6) {
      setStatusMessage({ text: 'O CÓDIGO DEVE TER 6 CARACTERES.', type: 'error' });
      return;
    }

    const linkedId = localStorage.getItem(`tessy-shared-${code}`);
    if (linkedId) {
      const conversation = loadConversation(linkedId);
      if (conversation) {
        setStatusMessage({ text: 'CONVERSA LOCALIZADA E CARREGADA!', type: 'success' });
        if (onImportSuccess) onImportSuccess(conversation);
        setTimeout(handleClose, 1500);
      } else {
        setStatusMessage({ text: 'CONVERSA NÃO ENCONTRADA NO BANCO LOCAL.', type: 'error' });
      }
    } else {
      setStatusMessage({ text: 'CÓDIGO DE COMPARTILHAMENTO INVÁLIDO.', type: 'error' });
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[70] flex items-center justify-center p-8 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-md ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`glass-panel !rounded-none w-full max-w-lg flex flex-col !bg-white/95 dark:!bg-slate-900/60 !backdrop-blur-2xl !border-emerald-500/40 ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="px-8 py-6 border-b-2 border-emerald-500/20 flex justify-between items-center bg-emerald-500/5 dark:bg-slate-900/40 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter glow-text-green">Compartilhar Conversa</h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] mt-1">Sincronização de Protocolos</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b-2 border-emerald-500/10 shrink-0">
          <button 
            onClick={() => { setActiveTab('share'); setStatusMessage({ text: '', type: 'info' }); }}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'share' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Gerar Código
          </button>
          <button 
            onClick={() => { setActiveTab('import'); setStatusMessage({ text: '', type: 'info' }); }}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'import' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Importar Código
          </button>
        </div>

        <div className="p-10 space-y-8 bg-transparent">
          {activeTab === 'share' ? (
            <div className="text-center space-y-6">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-black leading-relaxed">
                Gere um código de 6 dígitos para permitir que outros usuários com acesso a este banco importem esta conversa: <br/>
                <span className="text-slate-800 dark:text-white font-black">"{conversationTitle}"</span>
              </p>
              
              {shareCode ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-[0.5em] bg-emerald-500/5 dark:bg-emerald-500/10 px-8 py-6 border-2 border-emerald-500/30">
                    {shareCode}
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(shareCode);
                      setStatusMessage({ text: 'CÓDIGO COPIADO!', type: 'success' });
                    }}
                    className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline"
                  >
                    Copiar Código Novamente
                  </button>
                </div>
              ) : (
                <button 
                  onClick={generateShareCode}
                  className="brutalist-button w-full py-5 bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-emerald-600"
                >
                  Gerar Novo Protocolo de Compartilhamento
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Insira o Código de 6 Dígitos</label>
                <input 
                  type="text" 
                  value={importCode} 
                  onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  placeholder="EX: A1B2C3"
                  className="w-full bg-slate-100 dark:bg-slate-900/60 border-2 border-emerald-500/20 p-5 text-3xl font-black text-center text-slate-800 dark:text-white placeholder-emerald-900/10 dark:placeholder-emerald-900/20 focus:outline-none focus:border-emerald-500 transition-all !rounded-none tracking-[0.5em]"
                />
              </div>
              <button 
                onClick={handleImport}
                className="brutalist-button w-full py-5 bg-teal-600 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-teal-700"
              >
                Importar Sequência
              </button>
            </div>
          )}

          {statusMessage.text && (
            <div className={`p-4 text-[10px] font-black uppercase tracking-widest text-center border-2 ${
              statusMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
              statusMessage.type === 'error' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 
              'bg-blue-500/10 text-blue-600 border-blue-500/20'
            }`}>
              {statusMessage.text}
            </div>
          )}
        </div>

        <div className="p-8 border-t-2 border-emerald-500/20 bg-emerald-500/5 dark:bg-slate-900/40 flex justify-end shrink-0">
          <button onClick={handleClose} className="brutalist-button px-10 py-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-300 dark:hover:bg-slate-700">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
