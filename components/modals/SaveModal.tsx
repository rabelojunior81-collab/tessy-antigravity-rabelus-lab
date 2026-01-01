
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
    }, 100);
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
    <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
      <div className={`w-full max-w-lg bg-bg-secondary/95 backdrop-blur-xl border border-border-visible flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="px-4 py-2 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Save className="text-accent-primary" size={16} />
            <h2 className="text-xs font-medium tracking-normal text-text-primary">Arquivar Protocolo</h2>
          </div>
          <button onClick={handleClose} className="p-1 text-text-tertiary hover:text-text-primary transition-all active:scale-90"><X size={16} /></button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          {error && <div className="text-[11px] font-medium uppercase text-red-400 flex items-center gap-2"><AlertCircle size={16} /> {error}</div>}
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">Identificação da Sessão</label>
            <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="NOME..." className="w-full bg-bg-tertiary border border-border-visible p-3 text-sm font-normal text-text-primary focus:border-accent-primary outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">Resumo de Metadados</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="DIRETRIZ..." className="w-full h-24 bg-bg-tertiary border border-border-visible p-3 text-sm font-normal text-text-secondary outline-none focus:border-accent-primary resize-none custom-scrollbar" />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={handleClose} className="flex-1 py-3.5 bg-bg-tertiary hover:bg-bg-elevated text-text-tertiary font-medium uppercase tracking-wide text-xs transition-all">Cancelar</button>
            <button type="submit" disabled={!title.trim()} className={`flex-1 py-3.5 font-medium tracking-normal text-xs transition-all shadow-lg ${!title.trim() ? 'bg-bg-secondary text-text-tertiary opacity-20' : 'bg-accent-primary hover:bg-accent-secondary text-white'}`}>Confirmar Arquivamento</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveModal;
