
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trash2, MessageSquare, Plus } from 'lucide-react';
import { db } from '../../services/dbService';
import { Conversation } from '../../types';

interface HistoryViewerProps {
  currentProjectId: string;
  activeId: string;
  onLoad: (conversation: Conversation) => void;
  onDelete: (id: string) => Promise<void>;
  onNew: () => void;
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ currentProjectId, activeId, onLoad, onDelete, onNew }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await db.conversations
        .where('projectId')
        .equals(currentProjectId)
        .reverse()
        .sortBy('updatedAt');
      setConversations(all);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentProjectId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const term = searchTerm.toLowerCase();
    return conversations.filter(c => c.title.toLowerCase().includes(term));
  }, [conversations, searchTerm]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Excluir sessão?')) {
      try {
        // Agora aguardamos a finalização da deleção assíncrona antes de atualizar a UI local
        await onDelete(id);
        // Recarregamos a lista local para refletir a mudança
        await loadConversations();
      } catch (err) {
        console.error('[HistoryViewer] Falha ao disparar callback de deleção:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary animate-fade-in">
      <div className="p-4 border-b border-border-subtle space-y-3 bg-bg-primary/30">
        <button 
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
        >
          <Plus size={14} strokeWidth={3} />
          Novo Protocolo
        </button>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR..."
            className="w-full bg-bg-primary border border-border-subtle py-2 pl-9 pr-4 text-[10px] font-semibold text-text-primary focus:border-accent-primary outline-none uppercase tracking-widest"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-4 h-4 border-2 border-accent-primary border-t-transparent animate-spin"></div></div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-[10px] text-text-tertiary font-bold uppercase tracking-widest">
            Vazio
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onLoad(conv)}
              className={`p-4 border transition-all cursor-pointer group relative ${
                conv.id === activeId ? 'bg-accent-primary/10 border-accent-primary' : 'bg-bg-primary/30 border-border-subtle hover:border-accent-primary/20'
              }`}
            >
              <div className="flex justify-between items-start gap-2 mb-1.5">
                <h4 className={`text-[11px] font-bold uppercase truncate tracking-tight ${conv.id === activeId ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                  {conv.title}
                </h4>
                <button onClick={(e) => handleDelete(e, conv.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between text-[9px] font-semibold text-text-tertiary uppercase tracking-tighter">
                <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><MessageSquare size={10} /> {conv.turns.length}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryViewer;
