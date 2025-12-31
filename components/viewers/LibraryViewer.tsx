
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Trash2, Edit3, Tag } from 'lucide-react';
import { db } from '../../services/dbService';
import { RepositoryItem } from '../../types';

interface LibraryViewerProps {
  currentProjectId: string;
  onSelectItem: (item: RepositoryItem) => void;
}

const LibraryViewer: React.FC<LibraryViewerProps> = ({ currentProjectId, onSelectItem }) => {
  const [items, setItems] = useState<RepositoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  const categories = useMemo(() => {
    const tags = new Set<string>(['all']);
    items.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag.toLowerCase()));
    });
    return Array.from(tags).sort();
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
    if (selectedCategory !== 'all') {
      results = results.filter(item => 
        item.tags?.some(tag => tag.toLowerCase() === selectedCategory)
      );
    }
    return results;
  }, [items, searchTerm, selectedCategory]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Excluir este prompt da biblioteca?')) {
      await db.library.delete(id);
      loadItems();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] animate-fade-in">
      <div className="p-4 border-b border-gray-800 space-y-4">
        <button 
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-900/10"
        >
          <Plus size={14} strokeWidth={3} />
          Novo Prompt
        </button>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR PROMPTS..."
            className="w-full bg-[#0a0a0a] border border-gray-800 py-2.5 pl-9 pr-4 text-[10px] font-black text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-all uppercase tracking-widest"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                selectedCategory === cat 
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' 
                  : 'bg-[#0a0a0a] border-gray-800 text-gray-500 hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent animate-spin"></div></div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-[9px] text-gray-600 font-black uppercase tracking-widest border border-dashed border-gray-800">
            Nenhum prompt disponível
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="p-4 bg-[#0a0a0a]/50 border border-gray-800 hover:border-emerald-500/40 hover:bg-[#151515] transition-all cursor-pointer group relative"
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <h4 className="text-[11px] font-black text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                  {item.title}
                </h4>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="text-gray-600 hover:text-emerald-500"><Edit3 size={12} /></button>
                  <button onClick={(e) => handleDelete(e, item.id)} className="text-gray-600 hover:text-red-500"><Trash2 size={12} /></button>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed mb-3 italic">
                {item.description || 'Nenhuma descrição fornecida.'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags?.map(tag => (
                  <span key={tag} className="text-[7px] font-black uppercase px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
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

export default LibraryViewer;
