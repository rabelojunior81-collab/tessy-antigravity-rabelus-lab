
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
    }, 200);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversation) return;
    if (!title.trim()) {
      setError('O nome da conversa é obrigatório.');
      return;
    }

    try {
      const updatedConv: Conversation = {
        ...conversation,
        title: title.trim(),
        description: description.trim(),
        updatedAt: Date.now(),
        isSaved: true
      };

      await db.conversations.put(updatedConv);
      onSuccess(updatedConv);
      handleClose();
    } catch (err) {
      setError('Erro ao salvar conversa no banco de dados.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`w-full h-full sm:h-auto sm:max-w-lg bg-[#111111] border border-gray-800 flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-800 bg-[#0a0a0a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Save className="text-emerald-500" size={20} />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Salvar Conversa</h2>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-[10px] font-black uppercase text-red-500">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Nome do Protocolo</label>
            <input 
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nome da conversa..."
              className="w-full bg-black border border-gray-800 p-4 text-[11px] font-black text-white focus:border-emerald-500 outline-none uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Resumo de Metadados</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrição (opcional)..."
              className="w-full bg-black border border-gray-800 p-4 text-[11px] font-medium text-gray-300 h-24 resize-none outline-none focus:border-emerald-500 custom-scrollbar"
            />
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 text-center">
             <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">
               {conversation?.turns.length || 0} TURNOS SERÃO ARQUIVADOS
             </span>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={handleClose}
              className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 text-gray-500 font-black uppercase tracking-widest text-[10px] border border-gray-800 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={!title.trim()}
              className={`flex-1 py-4 font-black uppercase tracking-widest text-[10px] transition-all shadow-[6px_6px_0_#065f46] ${
                !title.trim() ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              Arquivar Protocolo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveModal;
