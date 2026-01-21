import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Conversation } from '../../types';
import { db } from '../../services/dbService';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onSuccess: (updatedConv: Conversation) => void;
}

const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, conversation, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && conversation) {
      setTitle(conversation.title === 'Nova Conversa' ? '' : conversation.title);
      setDescription(conversation.description || '');
      setError(null);
    }
  }, [isOpen, conversation]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation || !title.trim()) {
      setError('Identificação é obrigatória.');
      return;
    }

    try {
      const updatedConv: Conversation = { ...conversation, title: title.trim(), description: description.trim(), updatedAt: Date.now(), isSaved: true };
      await db.conversations.put(updatedConv);
      onSuccess(updatedConv);
      handleClose();
    } catch (err) {
      setError('Erro ao persistir metadados.');
    }
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
            <Save style={{ color: 'var(--glass-accent)' }} size={10} />
            <h2 className="text-[9px] font-bold tracking-widest text-glass uppercase">Arquivar</h2>
          </div>
          <button onClick={handleClose} className="p-0.5 text-glass-muted hover:text-glass transition-all">
            <X size={10} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-2 space-y-2">
          {error && (
            <div className="text-[9px] font-medium text-red-100 flex items-center gap-1.5 bg-red-500/20 glass-header-compact p-1.5 border border-red-500/20">
              <AlertCircle size={10} className="text-red-400" /> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">ID Sessão</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nome..."
              className="w-full glass-input py-1.5 px-2 text-[10px] text-glass focus:border-glass-accent outline-none placeholder:text-glass-muted/40"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">Resumo</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Diretriz..."
              className="w-full h-14 glass-input py-1.5 px-2 text-[10px] text-glass resize-none focus:border-glass-accent outline-none placeholder:text-glass-muted/40 custom-scrollbar"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-1.5 glass-card border-glass/10 text-glass-muted font-bold uppercase tracking-widest text-[8px] hover:text-glass transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              style={{
                backgroundColor: title.trim() ? 'var(--glass-accent)' : undefined,
                boxShadow: title.trim() ? '0 4px 12px rgba(var(--accent-rgb), 0.3)' : 'none'
              }}
              className={`flex-1 py-1.5 font-bold tracking-widest text-[8px] transition-all uppercase active:scale-95 ${!title.trim()
                ? 'glass-card border-glass/5 opacity-30 cursor-not-allowed text-glass-muted'
                : 'text-white border-transparent'
                }`}
            >
              Arquivar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveModal;
