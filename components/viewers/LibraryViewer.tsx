import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Trash2, Edit3 } from 'lucide-react';
import { db, generateUUID } from '../../services/dbService';
import { RepositoryItem } from '../../types';

interface LibraryViewerProps {
  currentProjectId: string;
  onSelectItem: (item: RepositoryItem) => void;
}

const LibraryViewer: React.FC<LibraryViewerProps> = ({ currentProjectId, onSelectItem }) => {
  const [items, setItems] = useState<RepositoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('todos');
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
    } catch (err) {
      console.error("Failed to load library:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentProjectId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const tags = useMemo(() => {
    const set = new Set<string>(['todos']);
    items.forEach(item => item.tags?.forEach(tag => set.add(tag.toLowerCase())));
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    let results = items;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term))
      );
    }
    if (selectedTag !== 'todos') {
      results = results.filter(item => 
        selectedTag === 'todos' ? true : item.tags?.some(tag => tag.toLowerCase() === selectedTag)
      );
    }
    return results;
  }, [items, searchTerm, selectedTag]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Deseja remover este prompt permanentemente?')) {
      await db.library.delete(id);
      loadItems();
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary animate-fade-in">
      <div className="p-7 border-b border-border-subtle space-y-6 bg-bg-primary/30">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR PROTOCOLOS..."
            className="w-full bg-bg-primary border border-border-subtle py-3 pl-11 pr-5 text-[11px] font-semibold text-text-primary focus:border-accent-primary outline-none uppercase rounded-none"
          />
        </div>
        <div className="flex gap-2.5 overflow-x-auto custom-scrollbar pb-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest border transition-all rounded-none ${
                selectedTag === tag ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' : 'text-text-tertiary border-border-subtle hover:border-text-tertiary'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="w-5 h-5 border-2 border-accent-primary border-t-transparent animate-spin"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-[10px] text-text-tertiary uppercase font-bold tracking-widest">Nenhum protocolo localizado</div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="p-6 bg-bg-primary border border-border-subtle hover:border-accent-primary/20 transition-all cursor-pointer group rounded-none"
            >
              <div className="flex justify-between items-start mb-3 gap-3">
                <h4 className="text-[11px] font-bold text-text-secondary uppercase group-hover:text-accent-primary transition-colors truncate pr-9 tracking-tight">
                  {item.title}
                </h4>
                <button onClick={(e) => handleDelete(e, item.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-[11px] text-text-tertiary line-clamp-2 leading-[1.6] mb-4 italic font-normal">{item.description}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags?.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-accent-primary/5 text-accent-primary/60 border border-accent-primary/10 text-[8px] font-bold uppercase tracking-wider rounded-none">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(LibraryViewer);