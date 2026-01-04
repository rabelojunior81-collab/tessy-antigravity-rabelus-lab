import React, { useState, useMemo, useEffect } from 'react';
import { Search, Trash2, MessageSquare, Plus, Check, X } from 'lucide-react';
import { Conversation } from '../../types';
import { useChat } from '../../contexts/ChatContext';

interface HistoryViewerProps {
  currentProjectId: string;
  activeId: string;
  onLoad: (conversation: Conversation) => void;
  onDelete: (id: string) => Promise<void>;
  onNew: () => void;
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ currentProjectId, activeId, onLoad, onDelete, onNew }) => {
  const { conversations, isLoading: chatLoading } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Reset confirming state when list changes or mouse moves away (optional, let's keep it simple)
  useEffect(() => {
    setConfirmingId(null);
  }, [conversations.length, currentProjectId]);

  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;
    const term = searchTerm.toLowerCase();
    return conversations.filter(c => c.title.toLowerCase().includes(term));
  }, [conversations, searchTerm]);

  const handleStartDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmingId(id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmingId(null);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await onDelete(id);
      setConfirmingId(null);
    } catch (err) {
      console.error('[HistoryViewer] Fail:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary animate-fade-in">
      <div className="p-4 border-b border-border-visible space-y-3 bg-bg-primary/80 backdrop-blur-md">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-primary hover:bg-accent-secondary text-white text-sm font-medium tracking-normal transition-all active:scale-95 shadow-md"
        >
          <Plus size={14} strokeWidth={3} />
          Novo Protocolo
        </button>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={14} />
          <input
            id="history-search"
            name="history-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR..."
            className="w-full bg-bg-primary border border-border-visible py-2 pl-9 pr-4 text-xs font-normal text-text-primary focus:border-accent-primary outline-none tracking-normal"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {chatLoading && conversations.length === 0 ? (
          <div className="flex justify-center p-8"><div className="w-4 h-4 border border-accent-primary border-t-transparent animate-spin"></div></div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-tertiary font-medium uppercase tracking-wide opacity-30">
            Vazio
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isConfirming = confirmingId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => !isConfirming && onLoad(conv)}
                className={`p-2 border transition-all cursor-pointer group relative ${conv.id === activeId ? 'bg-accent-subtle/30 border-accent-primary' : 'bg-bg-primary/80 border-border-visible hover:border-accent-primary/30'
                  } ${isConfirming ? 'border-red-400/50 bg-red-400/5' : ''}`}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <h4 className={`text-sm font-normal truncate tracking-normal transition-colors ${isConfirming ? 'text-red-400' : (conv.id === activeId ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary')
                    }`}>
                    {isConfirming ? 'EXCLUIR SESSÃO?' : conv.title}
                  </h4>

                  <div className="flex items-center gap-1 shrink-0">
                    {isConfirming ? (
                      <>
                        <button
                          onClick={(e) => handleConfirmDelete(e, conv.id)}
                          className="p-1 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Confirmar"
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="p-1 text-text-tertiary hover:bg-bg-elevated transition-all"
                          title="Cancelar"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => handleStartDelete(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-red-400 transition-all"
                        title="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-medium text-text-tertiary uppercase tracking-wide">
                  <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5"><MessageSquare size={10} /> {conv.turns.length}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryViewer;
