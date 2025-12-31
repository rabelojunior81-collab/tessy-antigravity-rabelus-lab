
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Conversation } from '../types';
import { db } from '../services/dbService';

interface HistorySidebarProps {
  currentProjectId: string;
  activeId: string;
  onLoad: (conversation: Conversation) => void;
  onDelete: (id: string) => void;
  refreshKey: number;
  onClose?: () => void;
}

const ITEMS_PER_PAGE = 15;

const HistorySidebar: React.FC<HistorySidebarProps> = ({ currentProjectId, activeId, onLoad, onDelete, refreshKey, onClose }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingConv, setEditingConv] = useState<Conversation | null>(null);
  const [newTitle, setNewTitle] = useState('');
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
  }, [loadConversations, refreshKey]);

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

  const hasMore = useMemo(() => {
    return displayedConversations.length < filteredConversations.length;
  }, [displayedConversations.length, filteredConversations.length]);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }, []);

  const handleDeleteClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  }, []);

  const handleEditClick = useCallback((e: React.MouseEvent, conv: Conversation) => {
    e.stopPropagation();
    setEditingConv(conv);
    setNewTitle(conv.title);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (confirmDeleteId) {
      await db.conversations.delete(confirmDeleteId);
      onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
      loadConversations();
    }
  }, [confirmDeleteId, onDelete, loadConversations]);

  const saveRename = useCallback(async () => {
    if (editingConv && newTitle.trim()) {
      const updated = { ...editingConv, title: newTitle.trim(), updatedAt: Date.now() };
      await db.conversations.put(updated);
      setEditingConv(null);
      loadConversations();
    }
  }, [editingConv, newTitle, loadConversations]);

  const handleLoadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 bg-transparent animate-fade-in relative overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-600 animate-pulse"></div>
          Histórico
        </h2>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-500 transition-colors cursor-pointer active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      <div className="mb-6">
        <div className="relative group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="BUSCAR CONVERSAS..."
            className="w-full bg-white/80 dark:bg-slate-900/60 border-2 lg:border border-teal-600/25 py-2.5 pl-4 pr-10 text-[10px] font-black text-slate-800 dark:text-white placeholder:text-slate-600 dark:placeholder:text-slate-400 focus:outline-none focus:border-teal-600 transition-all !rounded-none uppercase tracking-widest shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 sm:space-y-4 pr-1 pb-10">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent animate-spin"></div></div>
        ) : displayedConversations.length === 0 ? (
          <div className="border-2 lg:border border-dashed border-teal-600/25 p-8 text-center bg-white/40 dark:bg-slate-900/10">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic tracking-wider">Nenhum registro localizado</p>
          </div>
        ) : (
          <>
            {displayedConversations.map((conv, index) => {
              const isActive = conv.id === activeId;
              const preview = conv.turns.length > 0 ? conv.turns[conv.turns.length - 1].tessyResponse.substring(0, 50) + '...' : 'Protocolo vazio';
              const fileCount = conv.turns.reduce((acc, turn) => acc + (turn.attachedFiles?.length || 0), 0);
              
              // Apply cascading animation for the first 20 items
              const animationStyle = index < 20 ? {
                animationDelay: `${index * 50}ms`,
                opacity: 0,
                animationFillMode: 'forwards' as const
              } : {};

              return (
                <div
                  key={conv.id}
                  onClick={() => onLoad(conv)}
                  style={animationStyle}
                  className={`relative w-full text-left p-4 transition-all duration-300 cursor-pointer border-2 lg:border group ${index < 20 ? 'animate-slide-in-left' : ''} ${
                    isActive 
                      ? 'bg-emerald-600/10 border-emerald-600 shadow-[4px_4px_0_rgba(16,185,129,0.15)] scale-[1.02]' 
                      : 'bg-white/80 dark:bg-slate-800/20 border-teal-600/10 hover:border-teal-600/50 hover:bg-teal-500/5 hover:scale-[1.02] hover:shadow-lg'
                  } active:translate-x-[2px] active:translate-y-[2px] active:scale-[1] active:shadow-none`}
                >
                  {fileCount > 0 && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[8px] px-1.5 py-0.5 font-black rounded-sm flex items-center gap-1 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      {fileCount}
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-[10px] sm:text-[11px] font-black uppercase truncate pr-14 tracking-wider transition-colors duration-300 ${isActive ? 'text-emerald-600' : 'text-slate-800 dark:text-white group-hover:text-teal-600'}`}>
                      {conv.title}
                    </h3>
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleEditClick(e, conv)} 
                        className="text-slate-400 hover:text-emerald-600 transition-all p-1 active:scale-90"
                        aria-label="Editar Título"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(e, conv.id)} 
                        className="text-slate-400 hover:text-red-500 transition-all p-1 active:scale-90"
                        aria-label="Deletar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[8px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">{formatDate(conv.updatedAt)}</p>
                    <div className="flex items-center gap-2">
                      <div className="text-[7px] font-black uppercase px-1 bg-teal-500/10 text-teal-600 border lg:border border-teal-500/20 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        {conv.turns.length} msg
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 italic mt-2 border-t border-slate-500/5 pt-1">{preview}</p>
                </div>
              );
            })}
            
            {hasMore && (
              <button 
                onClick={handleLoadMore} 
                className="w-full py-4 border-2 lg:border border-emerald-600/20 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-500/5 transition-all brutalist-button cursor-pointer active:scale-95"
              >
                Carregar Registros Anteriores
              </button>
            )}
          </>
        )}
      </div>

      {confirmDeleteId && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in transition-all">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Remover Protocolo Definitivamente?</p>
          <div className="flex gap-4 w-full max-w-[240px]">
            <button 
              onClick={() => setConfirmDeleteId(null)} 
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
            >
              Abortar
            </button>
            <button 
              onClick={confirmDelete} 
              className="flex-1 py-3 bg-red-600 text-white text-[10px] font-black uppercase shadow-lg shadow-red-500/20 active:scale-95 transition-all"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {editingConv && (
        <div className="absolute inset-0 z-[60] bg-emerald-950/20 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in transition-all">
          <div className="w-full max-w-[300px] bg-white dark:bg-slate-900 border-4 border-emerald-600 shadow-[10px_10px_0_rgba(16,185,129,0.3)] p-6">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Renomear Sequência</h4>
            <input 
              autoFocus
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border-2 lg:border border-emerald-600/20 p-3 text-[11px] font-black text-slate-900 dark:text-white uppercase mb-6 focus:outline-none focus:border-emerald-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename();
                if (e.key === 'Escape') setEditingConv(null);
              }}
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setEditingConv(null)} 
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button 
                onClick={saveRename} 
                className="flex-1 py-3 bg-emerald-600 text-white text-[9px] font-black uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(HistorySidebar);
