import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { db } from '../../services/dbService';
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
      results = results.filter(item => item.title.toLowerCase().includes(term));
    }
    if (selectedTag !== 'todos') {
      results = results.filter(item => item.tags?.some(tag => tag.toLowerCase() === selectedTag));
    }
    return results;
  }, [items, searchTerm, selectedTag]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Remover prompt?')) {
      await db.library.delete(id);
      loadItems();
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary animate-fade-in">
      <div className="p-4 border-b border-border-subtle space-y-4 bg-bg-primary/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR..."
            className="w-full bg-bg-primary border border-border-subtle py-2 pl-9 pr-4 text-[10px] font-semibold text-text-primary focus:border-accent-primary outline-none uppercase tracking-widest"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest border transition-all ${
                selectedTag === tag ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' : 'text-text-tertiary border-border-subtle hover:text-text-primary'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-4 h-4 border-2 border-accent-primary border-t-transparent animate-spin"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-[10px] text-text-tertiary font-bold uppercase tracking-widest">Vazio</div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="p-4 bg-bg-primary/30 border border-border-subtle hover:border-accent-primary/20 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <h4 className="text-[11px] font-bold text-text-secondary uppercase group-hover:text-accent-primary transition-colors truncate tracking-tight">
                  {item.title}
                </h4>
                <button onClick={(e) => handleDelete(e, item.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-[11px] text-text-tertiary line-clamp-2 leading-relaxed mb-3 italic font-normal">{item.description}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-accent-primary/5 text-accent-primary/60 border border-accent-primary/10 text-[8px] font-bold uppercase tracking-wider">
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