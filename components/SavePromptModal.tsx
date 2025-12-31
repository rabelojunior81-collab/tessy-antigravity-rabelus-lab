
import React, { useState, useEffect, useRef } from 'react';
import { getAllTags } from '../services/storageService';

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, tags: string[]) => void;
}

const SavePromptModal: React.FC<SavePromptModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const existingTags = useRef<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      existingTags.current = getAllTags();
      setIsClosing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = existingTags.current.filter(t => 
        t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t)
      );
      setSuggestions(filtered.slice(0, 10));
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [tagInput, tags]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleAddTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (normalized && !tags.includes(normalized)) {
      setTags([...tags, normalized]);
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title, description, tags);
    setTitle(''); 
    setDescription(''); 
    setTags([]);
    setTagInput('');
    handleClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`glass-panel !rounded-none w-full max-w-md !bg-white/95 dark:!bg-slate-900/60 !backdrop-blur-2xl !border-emerald-500/30 ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b-2 border-emerald-500/10 flex justify-between items-center bg-emerald-500/5 dark:bg-slate-900/40">
          <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter glow-text-green">Arquivamento</h3>
          <button onClick={handleClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-transparent">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Título do Protocolo</label>
            <input autoFocus type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contrato V1.0..." className="w-full bg-slate-100 dark:bg-slate-900/60 border-2 border-emerald-500/10 p-4 text-slate-800 dark:text-white font-bold placeholder-emerald-900/20 dark:placeholder-emerald-900/30 focus:outline-none focus:border-emerald-500 transition-all !rounded-none" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Resumo de Metadados</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição da sequência lógica..." className="w-full bg-slate-100 dark:bg-slate-900/60 border-2 border-emerald-500/10 p-4 text-slate-800 dark:text-white font-medium placeholder-emerald-900/20 dark:placeholder-emerald-900/30 focus:outline-none focus:border-emerald-500 transition-all h-24 resize-none !rounded-none custom-scrollbar" />
          </div>
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Tags / Categorias</label>
            <input 
              type="text" 
              value={tagInput} 
              onChange={(e) => setTagInput(e.target.value)} 
              onKeyDown={handleTagKeyDown}
              placeholder="Adicione tags (Enter ou vírgula)..." 
              className="w-full bg-slate-100 dark:bg-slate-900/60 border-2 border-emerald-500/10 p-4 text-slate-800 dark:text-white font-bold placeholder-emerald-900/20 dark:placeholder-emerald-900/30 focus:outline-none focus:border-emerald-500 transition-all !rounded-none" 
            />
            {showSuggestions && (
              <div className="absolute top-full left-0 w-full z-30 bg-white dark:bg-slate-950 border-2 border-emerald-500/40 shadow-xl !rounded-none mt-1">
                {suggestions.map(suggestion => (
                  <button 
                    key={suggestion}
                    type="button"
                    onClick={() => handleAddTag(suggestion)}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 uppercase"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase flex items-center gap-2">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-slate-900 dark:hover:text-white">×</button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={handleClose} className="brutalist-button flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 font-black uppercase tracking-widest text-xs">Abortar</button>
            <button type="submit" className="brutalist-button flex-1 py-4 bg-emerald-500 text-white font-black uppercase tracking-widest text-xs">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavePromptModal;
