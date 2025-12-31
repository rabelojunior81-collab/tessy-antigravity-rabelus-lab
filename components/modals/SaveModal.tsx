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
      setError('Título é obrigatório.');
      return;
    }

    try {
      const updatedConv: Conversation = { ...conversation, title: title.trim(), description: description.trim(), updatedAt: Date.now(), isSaved: true };
      await db.conversations.put(updatedConv);
      onSuccess(updatedConv);
      handleClose();
    } catch (err) {
      setError('Erro ao salvar.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
      <div className={`w-full max-w-lg bg-bg-secondary border border-border-visible flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border-subtle bg-bg-primary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="text-accent-primary" size={18} />
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-primary">Arquivar</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {error && <div className="text-[10px] font-bold uppercase text-red-400 flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Título</label>
            <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-bg-tertiary border border-border-subtle p-3 text-[11px] font-bold text-text-primary focus:border-accent-primary outline-none uppercase" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Resumo</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full h-24 bg-bg-tertiary border border-border-subtle p-3 text-[11px] font-medium text-text-secondary outline-none focus:border-accent-primary resize-none custom-scrollbar" />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={handleClose} className="flex-1 py-3 bg-bg-tertiary text-text-tertiary font-bold uppercase tracking-widest text-[10px]">Cancelar</button>
            <button type="submit" disabled={!title.trim()} className={`flex-1 py-3 font-bold uppercase tracking-widest text-[10px] transition-all ${!title.trim() ? 'bg-bg-secondary text-text-tertiary opacity-20' : 'bg-accent-primary hover:bg-accent-secondary text-white'}`}>Arquivar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveModal;