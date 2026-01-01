
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Plus, Trash2, Edit3, ChevronRight, Hash, Bookmark } from 'lucide-react';
import { db, generateUUID } from '../../services/dbService';
import { Template } from '../../types';
import { PROMPT_TEMPLATES } from '../../constants/templates';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Template>>({
    label: '',
    description: '',
    content: '',
    category: 'Personalizado'
  });

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      setIsFormOpen(false);
      setSelectedId(null);
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    const all = await db.templates.toArray();
    setUserTemplates(all);
  };

  const allTemplates = useMemo(() => {
    return [...PROMPT_TEMPLATES, ...userTemplates];
  }, [userTemplates]);

  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return allTemplates;
    const term = searchTerm.toLowerCase();
    return allTemplates.filter(t => 
      t.label.toLowerCase().includes(term) || 
      (t.description || '').toLowerCase().includes(term) ||
      t.content.toLowerCase().substring(0, 100).includes(term)
    );
  }, [allTemplates, searchTerm]);

  const groupedTemplates = useMemo(() => {
    const groups: Record<string, Template[]> = {};
    filteredTemplates.forEach(t => {
      const cat = t.category || 'Outros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(t);
    });
    return groups;
  }, [filteredTemplates]);

  const selectedTemplate = useMemo(() => allTemplates.find(t => t.id === selectedId) || null, [allTemplates, selectedId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.content) return;
    const id = formData.id || generateUUID();
    const newTemplate: Template = { 
      ...formData as Template, 
      id, 
      isCustom: true, 
      updatedAt: Date.now(), 
      createdAt: formData.createdAt || Date.now() 
    };
    await db.templates.put(newTemplate);
    await loadTemplates();
    setIsFormOpen(false);
    setSelectedId(id);
  };

  const handleDelete = async () => {
    if (!selectedId || !confirm('Excluir?')) return;
    await db.templates.delete(selectedId);
    await loadTemplates();
    setSelectedId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-5xl h-[85vh] bg-bg-secondary/95 backdrop-blur-xl border border-border-visible flex flex-col shadow-2xl animate-zoom-in overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <Bookmark className="text-accent-primary" size={20} />
            <h2 className="text-base font-medium tracking-normal text-text-primary">Biblioteca de Protocolos</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all active:scale-95"><X size={20} /></button>
        </div>

        <div className="flex-1 flex flex-row overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-[320px] flex flex-col border-r border-border-visible bg-bg-primary/40 shrink-0">
            <div className="p-4 border-b border-border-visible">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={14} />
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  placeholder="FILTRAR..." 
                  className="w-full bg-bg-primary border border-border-visible py-2.5 pl-9 pr-4 text-xs font-normal text-text-primary focus:border-accent-primary outline-none tracking-normal" 
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-6">
              {(Object.entries(groupedTemplates) as [string, Template[]][]).map(([category, items]) => (
                <div key={category} className="space-y-1">
                  <div className="px-3 py-1 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide opacity-50">{category}</span>
                    <span className="text-[10px] font-mono text-text-tertiary opacity-40">{items.length}</span>
                  </div>
                  <div className="space-y-1">
                    {items.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => { setSelectedId(t.id); setIsFormOpen(false); }} 
                        className={`group px-3 py-2.5 border transition-all cursor-pointer flex items-center justify-between ${
                          selectedId === t.id 
                            ? 'bg-accent-subtle/40 border-accent-primary' 
                            : 'bg-bg-primary/30 border-transparent hover:border-accent-primary/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Hash size={12} className={selectedId === t.id ? 'text-accent-primary' : 'text-text-tertiary opacity-40'} />
                          <h4 className={`text-sm font-normal truncate tracking-normal ${selectedId === t.id ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                            {t.label}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-bg-primary/60 border-t border-border-visible">
              <button 
                onClick={() => { setFormData({ label: '', description: '', content: '', category: 'Personalizado' }); setIsFormOpen(true); }} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent-primary hover:bg-accent-secondary text-white text-xs font-medium tracking-normal transition-all active:scale-95 shadow-lg"
              >
                <Plus size={14} strokeWidth={3} />
                Criar Protocolo
              </button>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col bg-bg-secondary overflow-hidden">
            {isFormOpen ? (
              <form onSubmit={handleSave} className="flex-1 flex flex-col p-10 space-y-6 animate-fade-in">
                <div className="space-y-4">
                   <div className="flex gap-4">
                     <div className="flex-1 space-y-1.5">
                       <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">Nome do Protocolo</label>
                       <input type="text" required value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="w-full bg-bg-tertiary border border-border-visible p-3 text-sm font-normal text-text-primary focus:border-accent-primary outline-none" />
                     </div>
                     <div className="w-[200px] space-y-1.5">
                       <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">Categoria</label>
                       <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full bg-bg-tertiary border border-border-visible p-3 text-sm font-normal text-text-primary focus:border-accent-primary outline-none">
                         <option value="Código">Código</option>
                         <option value="Escrita">Escrita</option>
                         <option value="Análise">Análise</option>
                         <option value="Ensino">Ensino</option>
                         <option value="Criativo">Criativo</option>
                         <option value="Personalizado">Personalizado</option>
                       </select>
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">Descrição</label>
                     <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-20 bg-bg-tertiary border border-border-visible p-3 text-sm font-normal text-text-secondary outline-none focus:border-accent-primary resize-none custom-scrollbar" />
                   </div>
                </div>
                <div className="flex-1 flex flex-col space-y-1.5">
                  <label className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide">Núcleo do Prompt</label>
                  <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="flex-1 w-full bg-bg-tertiary border border-border-visible p-4 text-sm font-mono font-normal text-text-primary focus:border-accent-primary outline-none resize-none custom-scrollbar" />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 bg-bg-tertiary text-text-tertiary font-medium uppercase tracking-wide text-[10px]">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-accent-primary hover:bg-accent-secondary text-white font-medium uppercase tracking-wide text-[10px] transition-all">Sincronizar</button>
                </div>
              </form>
            ) : selectedTemplate ? (
              <div className="flex-1 flex flex-col p-10 overflow-hidden animate-fade-in">
                <div className="flex justify-between items-start mb-8 shrink-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-accent-subtle/40 border border-accent-primary/30 text-accent-primary text-[10px] font-medium uppercase tracking-wide">
                        {selectedTemplate.category}
                      </span>
                      <span className="text-[10px] font-medium text-text-tertiary opacity-60 uppercase tracking-wide">
                        {selectedTemplate.isCustom ? 'PROTOCOL_USER' : 'PROTOCOL_SYSTEM'}
                      </span>
                    </div>
                    <h3 className="text-3xl font-normal text-text-primary tracking-normal">{selectedTemplate.label}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedTemplate.isCustom && (
                      <>
                        <button onClick={() => { setFormData(selectedTemplate); setIsFormOpen(true); }} className="p-2.5 bg-bg-primary/50 border border-border-visible text-text-tertiary hover:text-accent-primary transition-all"><Edit3 size={18} /></button>
                        <button onClick={handleDelete} className="p-2.5 bg-bg-primary/50 border border-border-visible text-text-tertiary hover:text-red-400 transition-all"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-10 p-6 bg-bg-tertiary/60 border-l-4 border-accent-primary backdrop-blur-md">
                   <p className="text-sm text-text-secondary leading-relaxed font-normal italic">
                     {selectedTemplate.description || 'Nenhuma diretriz associada.'}
                   </p>
                </div>

                <button 
                  onClick={() => { onSelect(selectedTemplate.content); onClose(); }} 
                  className="w-full mb-8 py-5 bg-accent-primary hover:bg-accent-secondary text-white text-xs font-medium tracking-normal transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3"
                >
                  <ChevronRight size={18} strokeWidth={3} />
                  Carregar no Núcleo
                </button>

                <div className="flex-1 bg-bg-primary/30 border border-border-visible p-8 overflow-y-auto custom-scrollbar relative">
                  <div className="absolute top-4 right-4 text-[9px] font-medium font-mono text-text-tertiary opacity-30">PREVIEW_SOURCE</div>
                  <pre className="text-sm text-text-secondary font-mono font-normal whitespace-pre-wrap leading-relaxed">{selectedTemplate.content}</pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-10 animate-pulse">
                <Bookmark size={100} strokeWidth={1} />
                <p className="mt-6 text-xs font-medium uppercase tracking-widest">Tessy Protocol Library</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
