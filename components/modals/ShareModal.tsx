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
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-xs glass-modal flex flex-col ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-2 py-1 glass-header flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <Share2 style={{ color: 'var(--glass-accent)' }} size={10} />
            <h2 className="text-[9px] font-bold tracking-widest text-glass uppercase">Partilhar</h2>
          </div>
          <button onClick={handleClose} className="p-0.5 text-glass-muted hover:text-glass transition-all">
            <X size={10} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col items-center text-center space-y-3">
          {isGenerating ? (
            <div className="py-4 flex flex-col items-center gap-2 opacity-60">
              <Loader2 style={{ color: 'var(--glass-accent)' }} className="animate-spin" size={20} />
              <p className="text-[8px] font-bold uppercase tracking-widest text-glass-muted">Gerando...</p>
            </div>
          ) : error ? (
            <div className="py-4 text-red-400 flex flex-col items-center gap-2">
              <AlertCircle size={20} />
              <p className="text-[8px] font-bold uppercase">{error}</p>
            </div>
          ) : code ? (
            <div className="w-full space-y-3 animate-fade-in">
              <p className="text-[8px] text-glass-muted font-bold uppercase tracking-widest">Código:</p>
              <div className="py-2 glass-card border-glass/10 bg-white/5 relative group overflow-hidden">
                <div className="absolute inset-0 bg-glass-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <span className="text-lg font-bold text-glass font-mono tracking-[0.2em] uppercase relative z-10">{code}</span>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(code); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); }}
                style={{
                  backgroundColor: isCopied ? 'transparent' : 'var(--glass-accent)',
                  borderColor: isCopied ? 'var(--glass-accent)' : 'transparent',
                  color: isCopied ? 'var(--glass-accent)' : 'white',
                  boxShadow: isCopied ? 'none' : '0 4px 12px rgba(var(--accent-rgb), 0.3)'
                }}
                className={`w-full py-1.5 font-bold uppercase tracking-widest text-[8px] transition-all flex items-center justify-center gap-2 active:scale-95 ${isCopied ? 'border' : ''}`}
              >
                {isCopied ? <Check size={10} strokeWidth={3} /> : <Copy size={10} />}
                {isCopied ? 'COPIADO' : 'COPIAR'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
