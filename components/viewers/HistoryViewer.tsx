
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
    <div className="flex flex-col h-full bg-[#111111] animate-fade-in">
      <div className="p-4 border-b border-gray-800 space-y-4">
        <button 
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          <Plus size={14} strokeWidth={3} />
          Novo Protocolo
        </button>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="BUSCAR SESSÕES..."
            className="w-full bg-[#0a0a0a] border border-gray-800 py-2.5 pl-9 pr-4 text-[10px] font-black text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-all uppercase tracking-widest"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent animate-spin"></div></div>
        ) : displayedConversations.length === 0 ? (
          <div className="p-8 text-center text-[9px] text-gray-600 font-black uppercase tracking-widest border border-dashed border-gray-800">
            Nenhum registro encontrado
          </div>
        ) : (
          displayedConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onLoad(conv)}
              className={`p-3 border transition-all cursor-pointer group relative ${
                conv.id === activeId 
                  ? 'bg-emerald-500/10 border-emerald-500/50' 
                  : 'bg-[#0a0a0a]/50 border-gray-800 hover:border-gray-600 hover:bg-[#151515]'
              }`}
            >
              <div className="flex justify-between items-start mb-1 gap-2">
                <h4 className={`text-[10px] font-black uppercase truncate tracking-tight transition-colors ${
                  conv.id === activeId ? 'text-emerald-500' : 'text-gray-300 group-hover:text-white'
                }`}>
                  {conv.title}
                </h4>
                <button 
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-center justify-between text-[8px] font-black text-gray-500 uppercase tracking-tighter">
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
            className="w-full py-3 text-[9px] font-black text-emerald-500/60 hover:text-emerald-500 uppercase tracking-widest transition-colors"
          >
            Carregar Mais...
          </button>
        )}
      </div>
    </div>
  );
};

export default HistoryViewer;
