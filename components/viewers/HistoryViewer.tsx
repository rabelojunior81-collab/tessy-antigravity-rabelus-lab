import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trash2, Edit3, MessageSquare, Plus } from 'lucide-react';
import { db } from '../../services/dbService';
import { Conversation } from '../../types';

interface HistoryViewerProps {
  currentProjectId: string;
  activeId: string;
  onLoad: (conversation: Conversation) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const ITEMS_PER_PAGE = 20;

const HistoryViewer: React.FC<HistoryViewerProps> = ({ currentProjectId, activeId, onLoad, onDelete, onNew }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
    return conversations.filter(c => 
      c.title.toLowerCase().includes(term) || 
      c.turns.some(t => t.userMessage.toLowerCase().includes(term) || t.tessyResponse.toLowerCase().includes(term))
    );
  }, [conversations, searchTerm]);

  const displayedConversations = useMemo(() => {
    return filteredConversations.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [filteredConversations, currentPage]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Deseja excluir permanentemente este protocolo?')) {
      await db.conversations.delete(id);
      onDelete(id);
      loadConversations();
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary animate-fade-in">
      <div className="p-4 border-b border-border-subtle space-y-4">
        <button 
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-3 bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 rounded-md shadow-lg shadow-accent-primary/10"
        >
          <Plus size={14} strokeWidth={3} />
          Novo Protocolo
        </button>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-accent-primary transition-colors" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="BUSCAR SESSÕES..."
            className="w-full bg-bg-primary border border-border-subtle py-2.5 pl-9 pr-4 text-[10px] font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-primary transition-all uppercase tracking-widest rounded-md"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-4 h-4 border-2 border-accent-primary border-t-transparent animate-spin"></div></div>
        ) : displayedConversations.length === 0 ? (
          <div className="p-8 text-center text-[9px] text-text-tertiary font-bold uppercase tracking-widest border border-dashed border-border-subtle rounded-md">
            Nenhum registro encontrado
          </div>
        ) : (
          displayedConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onLoad(conv)}
              className={`p-3 border transition-all cursor-pointer group relative rounded-lg ${
                conv.id === activeId 
                  ? 'bg-accent-primary/10 border-accent-primary/50' 
                  : 'bg-bg-primary/50 border-border-subtle hover:border-accent-primary/30 hover:bg-bg-tertiary/50'
              }`}
            >
              <div className="flex justify-between items-start mb-1 gap-2">
                <h4 className={`text-[10px] font-black uppercase truncate tracking-tight transition-colors ${
                  conv.id === activeId ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary'
                }`}>
                  {conv.title}
                </h4>
                <button 
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-all shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-center justify-between text-[8px] font-bold text-text-tertiary uppercase tracking-tighter">
                <span>{new Date(conv.updatedAt).toLocaleDateString('pt-BR')}</span>
                <span className="flex items-center gap-1">
                  <MessageSquare size={8} /> {conv.turns.length}
                </span>
              </div>
            </div>
          ))
        )}
        
        {displayedConversations.length < filteredConversations.length && (
          <button 
            onClick={() => setCurrentPage(p => p + 1)}
            className="w-full py-3 text-[9px] font-bold text-accent-primary/60 hover:text-accent-primary uppercase tracking-widest transition-colors"
          >
            Carregar Mais...
          </button>
        )}
      </div>
    </div>
  );
};

export default HistoryViewer;