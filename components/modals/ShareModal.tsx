
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
    if (isOpen && conversation && conversation.turns.length > 0) {
      handleGenerateCode();
    }
  }, [isOpen, conversation]);

  const handleGenerateCode = async () => {
    if (!conversation) return;
    setIsGenerating(true);
    setError(null);
    setCode(null);

    try {
      const shareCode = generateShareCode(8);
      await db.shared_conversations.put({
        code: shareCode,
        title: conversation.title,
        turns: conversation.turns,
        createdAt: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });
      setCode(shareCode);
    } catch (err) {
      setError('Falha ao gerar protocolo de compartilhamento.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`w-full h-full sm:h-auto sm:max-w-md bg-[#111111] border border-gray-800 flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-800 bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="text-emerald-500" size={20} />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Compartilhar</h2>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 sm:p-10 flex flex-col items-center text-center space-y-8">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="text-emerald-500 animate-spin" size={40} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">Criptografando Protocolo...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <AlertCircle className="text-red-500" size={40} />
              <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">{error}</p>
              <button onClick={handleGenerateCode} className="text-[9px] font-black text-emerald-500 uppercase underline">Tentar Novamente</button>
            </div>
          ) : code ? (
            <div className="w-full space-y-8 animate-fade-in">
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed uppercase tracking-tight px-4">
                Compartilhe este código para permitir que outros vizualizem a conversa <br/>
                <span className="text-emerald-500 font-black">"{conversation?.title}"</span>
              </p>

              <div className="py-6 px-4 bg-black border-2 border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                <span className="text-3xl font-black text-white font-mono tracking-[0.4em] uppercase">
                  {code}
                </span>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleCopy}
                  className={`w-full py-5 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 border-2 ${
                    isCopied 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                      : 'bg-emerald-600 hover:bg-emerald-500 border-transparent text-white shadow-[6px_6px_0_#065f46]'
                  }`}
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  {isCopied ? 'Copiado para Clipboard' : 'Copiar Código de Acesso'}
                </button>
                <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">
                  * Este código expira automaticamente em 7 dias.
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 opacity-20">
              <Share2 size={40} />
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800 bg-[#0a0a0a] flex shrink-0">
          <button 
            onClick={handleClose}
            className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-[10px] border border-gray-800 transition-all"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
