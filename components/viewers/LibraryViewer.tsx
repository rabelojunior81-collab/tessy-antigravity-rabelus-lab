
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Trash2, Hash, Check, Bookmark, Plus, Edit3 } from 'lucide-react';
import { db } from '../../services/dbService';
import { RepositoryItem, Template } from '../../types';
import { PROMPT_TEMPLATES } from '../../constants/templates';

interface LibraryViewerProps {
  currentProjectId: string;
  onSelectItem: (item: RepositoryItem | Template | { isCreating: boolean }) => void;
  onEditTemplate?: (item: Template | RepositoryItem) => void;
}

const LibraryViewer: React.FC<LibraryViewerProps> = ({ currentProjectId, onSelectItem, onEditTemplate }) => {
  const [userItems, setUserItems] = useState<RepositoryItem[]>([]);
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
      setUserItems(localItems);
    } catch (err) {
      console.error("Failed to load library:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentProjectId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const allItems = useMemo(() => {
    const templates = PROMPT_TEMPLATES.map(t => ({
      ...t,
      title: t.label,
      tags: [t.category.toLowerCase()],
      isSystem: true
    }));
    return [...templates, ...userItems];
  }, [userItems]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    allItems.forEach(item => item.tags?.forEach(tag => tagSet.add(tag.toLowerCase())));
    return Array.from(tagSet).sort();
  }, [allItems]);

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
    let results = allItems;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(item =>
        (item as any).title.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.content && item.content.toLowerCase().substring(0, 100).includes(term))
      );
    }

    if (selectedTags.length > 0) {
      results = results.filter(item =>
        selectedTags.every(tag => item.tags?.some(t => t.toLowerCase() === tag))
      );
    }

    return results;
  }, [allItems, searchTerm, selectedTags]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Remover prompt?')) {
      await db.library.delete(id);
      loadItems();
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="px-2 py-1 space-y-1 glass-header glass-header-compact">
        <div className="flex items-center gap-1">
          <div className="flex-1 relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-glass-muted" size={12} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="FILTRAR..."
              className="w-full glass-input py-1 pl-7 pr-2 text-[10px] font-normal text-glass focus:border-glass-accent outline-none uppercase tracking-wide placeholder:text-glass-muted/40"
            />
          </div>
          <button
            onClick={() => onSelectItem({ isCreating: true } as any)}
            className="p-1 text-glass-muted hover:text-glass-accent transition-all shrink-0 active:scale-90"
            title="Novo Protocolo"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() => toggleTag('todos')}
            style={{
              backgroundColor: selectedTags.length === 0 ? 'rgba(var(--accent-rgb), 0.15)' : undefined,
              borderColor: selectedTags.length === 0 ? 'rgba(var(--accent-rgb), 0.3)' : undefined,
              color: selectedTags.length === 0 ? 'var(--glass-accent)' : undefined
            }}
            className={`px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide border transition-all whitespace-nowrap ${selectedTags.length === 0 ? '' : 'bg-white/5 text-glass-muted border-white/5 hover:text-glass'}`}
          >
            Todos
          </button>
          {availableTags.map(tag => {
            const isActive = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  backgroundColor: isActive ? 'rgba(var(--accent-rgb), 0.15)' : undefined,
                  borderColor: isActive ? 'rgba(var(--accent-rgb), 0.3)' : undefined,
                  color: isActive ? 'var(--glass-accent)' : undefined
                }}
                className={`px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide border transition-all whitespace-nowrap flex items-center gap-1 ${isActive ? '' : 'bg-white/5 text-glass-muted border-white/5 hover:text-glass'}`}
              >
                {isActive && <Check size={10} />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-1 space-y-1">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-4 h-4 border border-accent-primary border-t-transparent animate-spin"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-[9px] text-text-tertiary font-bold uppercase tracking-[0.3em] opacity-30 italic">Protocolos Offline</div>
        ) : (
          filteredItems.map((item, index) => {
            const isSystem = 'isSystem' in item;
            const animationStyle = index < 20 ? {
              animationDelay: `${index * 30}ms`,
              animationFillMode: 'forwards' as const
            } : {};

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item as any)}
                style={animationStyle}
                className={`p-2 glass-card hover:border-glass-accent/40 transition-all cursor-pointer group shadow-sm ${index < 20 ? 'opacity-0 animate-slide-in-right' : 'opacity-100'}`}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {isSystem ? <Bookmark size={10} className="text-accent-primary/60 shrink-0" /> : <Hash size={10} className="text-text-tertiary opacity-40 shrink-0" />}
                    <h4
                      className="text-[11px] font-medium text-glass-secondary transition-colors truncate uppercase tracking-tight group-hover:text-glass-accent"
                    >
                      {(item as any).title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isSystem && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditTemplate?.(item as any); onSelectItem({ ...item, isEditing: true } as any); }}
                        className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-accent-primary transition-colors"
                      >
                        <Edit3 size={11} />
                      </button>
                    )}
                    {!isSystem && (
                      <button onClick={(e) => handleDelete(e, item.id)} className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-red-400 transition-colors">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-text-tertiary line-clamp-1 leading-relaxed mb-1.5 italic font-normal opacity-60">
                  {item.description || 'Diretrizes não especificadas.'}
                </p>
                <div className="flex flex-wrap gap-1">
                  {item.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="px-1 py-0.5 bg-white/5 text-glass-muted border border-white/5 text-[8px] font-medium uppercase tracking-wide">
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
