import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { Conversation } from '../../types';
import { db, generateShareCode } from '../../services/dbService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, conversation }) => {
  const [code, setCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen && conversation) handleGenerateCode();
  }, [isOpen, conversation]);

  const handleGenerateCode = async () => {
    if (!conversation) return;
    setIsGenerating(true);
    setError(null);
    setCode(null);
    try {
      const shareCode = generateShareCode(8);
      await db.shared_conversations.put({ code: shareCode, title: conversation.title, turns: conversation.turns, createdAt: Date.now(), expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) });
      setCode(shareCode);
    } catch (err) {
      setError('Erro ao gerar código.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
      <div className={`w-full max-w-sm bg-bg-secondary/95 backdrop-blur-xl border border-border-visible flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="px-4 py-1 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="text-accent-primary" size={16} />
            <h2 className="text-xs font-medium tracking-normal text-text-primary">Partilhar</h2>
          </div>
          <button onClick={handleClose} className="p-1 text-text-tertiary hover:text-text-primary transition-all active:scale-90"><X size={16} /></button>
        </div>

        <div className="p-12 flex flex-col items-center text-center space-y-8">
          {isGenerating ? (
            <div className="py-10 flex flex-col items-center gap-4 opacity-50">
              <Loader2 className="text-accent-primary animate-spin" size={40} />
              <p className="text-xs font-bold uppercase tracking-widest">Gerando Protocolo...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-red-400 flex flex-col items-center gap-4">
              <AlertCircle size={40} />
              <p className="text-xs font-bold uppercase">{error}</p>
            </div>
          ) : code ? (
            <div className="w-full space-y-8 animate-fade-in">
              <p className="text-xs text-text-tertiary font-bold uppercase tracking-widest">Código de Sincronização:</p>
              <div className="py-4 bg-bg-primary border border-accent-primary/30 shadow-inner">
                <span className="text-4xl font-bold text-text-primary font-mono tracking-[0.3em] uppercase">{code}</span>
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(code); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} 
                className={`w-full py-5 font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-4 shadow-lg ${isCopied ? 'bg-accent-subtle/40 text-accent-primary border border-accent-primary' : 'bg-accent-primary hover:bg-accent-secondary text-white'}`}
              >
                {isCopied ? <Check size={20} strokeWidth={3} /> : <Copy size={20} />} {isCopied ? 'COPIADO' : 'COPIAR CÓDIGO'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;