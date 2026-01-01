
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trash2, Hash, Check } from 'lucide-react';
import { db } from '../../services/dbService';
import { RepositoryItem } from '../../types';

interface LibraryViewerProps {
  currentProjectId: string;
  onSelectItem: (item: RepositoryItem) => void;
}

const LibraryViewer: React.FC<LibraryViewerProps> = ({ currentProjectId, onSelectItem }) => {
  const [items, setItems] = useState<RepositoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => item.tags?.forEach(tag => tagSet.add(tag.toLowerCase())));
    return Array.from(tagSet).sort();
  }, [items]);

  const toggleTag = (tag: string) => {
    if (tag === 'todos') {
      setSelectedTags([]);
      return;
    }
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

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
        selectedTags.every(tag => item.tags?.some(t => t.toLowerCase() === tag))
      );
    }

    return results;
  }, [items, searchTerm, selectedTags]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Remover prompt?')) {
      await db.library.delete(id);
      loadItems();
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary animate-fade-in">
      <div className="p-4 border-b border-border-visible space-y-4 bg-bg-primary/80 backdrop-blur-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR PROMPT, DESCRIÇÃO OU CÓDIGO..."
            className="w-full bg-bg-primary border border-border-visible py-2.5 pl-9 pr-4 text-xs font-bold text-text-primary focus:border-accent-primary outline-none uppercase tracking-widest"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() => toggleTag('todos')}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${
              selectedTags.length === 0 ? 'bg-accent-subtle/40 border-accent-primary text-accent-primary' : 'bg-bg-tertiary/80 text-text-tertiary border-border-visible hover:text-text-primary'
            }`}
          >
            Todos
          </button>
          {availableTags.map(tag => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive ? 'bg-accent-subtle/40 border-accent-primary text-accent-primary' : 'bg-bg-tertiary/80 text-text-tertiary border-border-visible hover:text-text-primary'
                }`}
              >
                {isActive && <Check size={10} />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-4 h-4 border border-accent-primary border-t-transparent animate-spin"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-tertiary font-bold uppercase tracking-widest opacity-30">Vazio</div>
        ) : (
          filteredItems.map((item, index) => {
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
                className={`p-4 bg-bg-tertiary/80 border border-border-visible hover:border-accent-primary/40 transition-all cursor-pointer group shadow-sm ${index < 20 ? 'animate-slide-in-right' : ''}`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Hash size={12} className="text-accent-primary/60 shrink-0" />
                    <h4 className="text-base font-bold text-text-secondary uppercase group-hover:text-accent-primary transition-colors truncate">
                      {item.title}
                    </h4>
                  </div>
                  <button onClick={(e) => handleDelete(e, item.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-text-tertiary line-clamp-2 leading-relaxed mb-4 italic font-medium">
                  {item.description || 'Sem descrição definida.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.tags?.slice(0, 5).map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 bg-accent-subtle/20 text-accent-primary/80 border border-accent-primary/20 text-[10px] font-bold uppercase tracking-widest">
                      {tag}
                    </span>
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

export default React.memo(LibraryViewer);
