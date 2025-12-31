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
      <div className={`w-full max-w-sm bg-bg-secondary border border-border-visible flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border-subtle bg-bg-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="text-accent-primary" size={18} />
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-primary">Partilhar</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all"><X size={20} /></button>
        </div>

        <div className="p-10 flex flex-col items-center text-center space-y-6">
          {isGenerating ? (
            <div className="py-6 flex flex-col items-center gap-3 opacity-50">
              <Loader2 className="text-accent-primary animate-spin" size={32} />
              <p className="text-[9px] font-bold uppercase tracking-widest">Gerando Protocolo...</p>
            </div>
          ) : error ? (
            <div className="py-6 text-red-400 flex flex-col items-center gap-3">
              <AlertCircle size={32} />
              <p className="text-[10px] font-bold uppercase">{error}</p>
            </div>
          ) : code ? (
            <div className="w-full space-y-6 animate-fade-in">
              <p className="text-[11px] text-text-tertiary uppercase tracking-tight">Código de Acesso:</p>
              <div className="py-4 bg-bg-primary border-2 border-accent-primary/20">
                <span className="text-3xl font-bold text-text-primary font-mono tracking-[0.2em] uppercase">{code}</span>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(code); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }} className={`w-full py-4 font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 ${isCopied ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary' : 'bg-accent-primary hover:bg-accent-secondary text-white'}`}>
                {isCopied ? <Check size={16} /> : <Copy size={16} />} {isCopied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;