
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { RepositoryItem } from '../types';
import { db } from '../services/dbService';

interface RepositoryBrowserProps {
  currentProjectId: string;
  onSelectItem: (item: RepositoryItem) => void;
  refreshKey: number;
  onClose?: () => void;
}

const RepositoryBrowser: React.FC<RepositoryBrowserProps> = ({ currentProjectId, onSelectItem, refreshKey, onClose }) => {
  const [items, setItems] = useState<RepositoryItem[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const localItems = await db.library
        .where('projectId')
        .equals(currentProjectId)
        .reverse()
        .sortBy('timestamp');
        
      setItems(localItems);
      
      const tagSet = new Set<string>();
      localItems.forEach(item => {
        if (item.tags) item.tags.forEach(tag => tagSet.add(tag.toLowerCase()));
      });
      setAvailableTags(Array.from(tagSet).sort());
    } catch (err) {
      console.error("Failed to load library:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentProjectId]);

  useEffect(() => {
    loadItems();
  }, [refreshKey, loadItems]);

  const handleDelete = useCallback(async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await db.library.delete(id);
    loadItems();
  }, [loadItems]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  const filteredItems = useMemo(() => {
    let results = items;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.content && item.content.toLowerCase().includes(term))
      );
    }

    if (selectedTags.length > 0) {
      results = results.filter(item => 
        selectedTags.every(tag => item.tags?.includes(tag.toLowerCase()))
      );
    }

    return results;
  }, [items, selectedTags, searchTerm]);

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 bg-transparent animate-fade-in relative overflow-hidden transition-all duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-600 animate-pulse"></div>
          Biblioteca
        </h2>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-500 transition-colors cursor-pointer active:scale-95"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="BUSCAR PROMPTS..."
          className="w-full bg-white/80 dark:bg-slate-900/60 border-2 lg:border border-emerald-600/25 py-2.5 px-4 text-[10px] font-black text-slate-800 dark:text-white placeholder:text-slate-600 dark:placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 transition-all !rounded-none uppercase tracking-widest shadow-sm"
        />
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar p-1">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 text-[8px] font-black uppercase border lg:border transition-all cursor-pointer active:scale-95 ${
                selectedTags.includes(tag) 
                  ? 'bg-emerald-600 border-emerald-300 text-white shadow-md' 
                  : 'bg-white/40 dark:bg-slate-800/40 border-emerald-600/10 text-slate-500 dark:text-slate-400 hover:border-emerald-600/40'
              }`}
            >
              {tag}
            </button>
          ))}
          {availableTags.length === 0 && !isLoading && (
            <span className="text-[8px] font-black text-slate-400 uppercase italic">Nenhuma tag...</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 pb-10">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent animate-spin"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="border-2 lg:border border-dashed border-emerald-600/20 p-8 text-center bg-white/40 dark:bg-slate-900/10">
            <p className="text-[10px] text-slate-500 font-black uppercase italic tracking-widest">Nenhum protocolo localizado</p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            // Apply cascading animation for the first 20 items
            const animationStyle = index < 20 ? {
              animationDelay: `${index * 50}ms`,
              opacity: 0,
              animationFillMode: 'forwards' as const
            } : {};

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                style={animationStyle}
                className={`relative w-full text-left p-4 bg-white/60 dark:bg-slate-800/10 border-2 lg:border border-emerald-600/10 hover:border-emerald-600/50 hover:bg-emerald-500/5 transition-all cursor-pointer group shadow-[4px_4px_0_rgba(16,185,129,0.03)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${index < 20 ? 'animate-slide-in-right' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-[10px] sm:text-[11px] font-black text-slate-800 dark:text-white uppercase truncate pr-8 tracking-wider group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h3>
                  <button 
                    onClick={(e) => handleDelete(e, item.id)} 
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors p-1 active:scale-90"
                    aria-label="Deletar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase line-clamp-2 leading-tight italic">{item.description || 'Sem descrição.'}</p>
                <div className="flex gap-1 mt-3">
                   {item.tags?.slice(0, 3).map(tag => (
                     <span key={tag} className="text-[7px] font-black uppercase text-emerald-600 dark:text-emerald-500 bg-emerald-500/5 px-1 border lg:border border-emerald-600/10">{tag}</span>
                   ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default React.memo(RepositoryBrowser);
