
import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Plus, Trash2, Edit3, FileText, ChevronRight, Hash, Bookmark } from 'lucide-react';
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
      <div className="w-full max-w-5xl h-[85vh] bg-bg-secondary border border-border-visible flex flex-col shadow-2xl animate-zoom-in overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-primary shrink-0">
          <div className="flex items-center gap-3">
            <Bookmark className="text-accent-primary" size={18} />
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-primary">Livraria de Protocolos (Templates)</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all active:scale-95"><X size={20} /></button>
        </div>

        <div className="flex-1 flex flex-row overflow-hidden">
          
          {/* Sidebar: Navigation */}
          <div className="w-[320px] flex flex-col border-r border-border-subtle bg-bg-primary/20 shrink-0">
            <div className="p-4 border-b border-border-subtle">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={14} />
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  placeholder="FILTRAR..." 
                  className="w-full bg-bg-tertiary border border-border-subtle py-2.5 pl-9 pr-4 text-[10px] font-bold text-text-primary focus:border-accent-primary outline-none uppercase tracking-widest" 
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-6">
              {/* Fix: Explicitly cast Object.entries(groupedTemplates) to [string, Template[]][] to resolve property access on 'unknown' type */}
              {(Object.entries(groupedTemplates) as [string, Template[]][]).map(([category, items]) => (
                <div key={category} className="space-y-1">
                  <div className="px-3 py-1 flex items-center justify-between">
                    <span className="text-[9px] font-black text-text-tertiary uppercase tracking-[0.2em]">{category}</span>
                    <span className="text-[9px] font-mono text-text-tertiary opacity-40">{items.length}</span>
                  </div>
                  <div className="space-y-1">
                    {items.map(t => (
                      <div 
                        key={t.id} 
                        onClick={() => { setSelectedId(t.id); setIsFormOpen(false); }} 
                        className={`group px-3 py-2.5 border transition-all cursor-pointer flex items-center justify-between ${
                          selectedId === t.id 
                            ? 'bg-accent-primary/10 border-accent-primary' 
                            : 'bg-bg-primary/30 border-transparent hover:border-accent-primary/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Hash size={12} className={selectedId === t.id ? 'text-accent-primary' : 'text-text-tertiary opacity-40'} />
                          <h4 className={`text-[10px] font-bold uppercase truncate tracking-tight ${selectedId === t.id ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                            {t.label}
                          </h4>
                        </div>
                        {t.isCustom && <div className="w-1.5 h-1.5 rounded-full bg-accent-primary opacity-40" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(groupedTemplates).length === 0 && (
                <div className="p-8 text-center text-[10px] text-text-tertiary font-bold uppercase tracking-widest opacity-30">Sem resultados</div>
              )}
            </div>
            
            <div className="p-4 bg-bg-primary/40 border-t border-border-subtle">
              <button 
                onClick={() => { setFormData({ label: '', description: '', content: '', category: 'Personalizado' }); setIsFormOpen(true); }} 
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg"
              >
                <Plus size={14} strokeWidth={3} />
                Criar Protocolo
              </button>
            </div>
          </div>

          {/* Main: Preview & Editor */}
          <div className="flex-1 flex flex-col bg-bg-secondary overflow-hidden">
            {isFormOpen ? (
              <form onSubmit={handleSave} className="flex-1 flex flex-col p-8 space-y-6 animate-fade-in">
                <div className="space-y-4">
                   <div className="flex gap-4">
                     <div className="flex-1 space-y-1.5">
                       <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Identificação</label>
                       <input type="text" required value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} placeholder="NOME DO PROTOCOLO..." className="w-full bg-bg-tertiary border border-border-subtle p-3 text-[11px] font-bold text-text-primary focus:border-accent-primary outline-none uppercase" />
                     </div>
                     <div className="w-[200px] space-y-1.5">
                       <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Categoria</label>
                       <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} className="w-full bg-bg-tertiary border border-border-subtle p-3 text-[11px] font-bold text-text-primary focus:border-accent-primary outline-none uppercase">
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
                     <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Diretriz (Descrição)</label>
                     <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="RESUMO DA FINALIDADE..." className="w-full h-20 bg-bg-tertiary border border-border-subtle p-3 text-[11px] font-medium text-text-secondary outline-none focus:border-accent-primary resize-none custom-scrollbar" />
                   </div>
                </div>
                <div className="flex-1 flex flex-col space-y-1.5">
                  <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Núcleo do Prompt</label>
                  <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="PROMPT..." className="flex-1 w-full bg-bg-tertiary border border-border-subtle p-4 text-[13px] font-mono text-text-primary focus:border-accent-primary outline-none resize-none custom-scrollbar" />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-4 bg-bg-tertiary text-text-tertiary font-bold uppercase tracking-widest text-[10px]">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-accent-primary hover:bg-accent-secondary text-white font-bold uppercase tracking-widest text-[10px] transition-all">Sincronizar Protocolo</button>
                </div>
              </form>
            ) : selectedTemplate ? (
              <div className="flex-1 flex flex-col p-8 overflow-hidden animate-fade-in">
                <div className="flex justify-between items-start mb-8 shrink-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[9px] font-black uppercase tracking-widest">
                        {selectedTemplate.category}
                      </span>
                      {selectedTemplate.isCustom ? (
                        <span className="text-[9px] font-bold text-text-tertiary opacity-40 uppercase tracking-widest">PROTOCOLO USUÁRIO</span>
                      ) : (
                        <span className="text-[9px] font-bold text-accent-secondary uppercase tracking-widest">SISTEMA RABELUS</span>
                      )}
                    </div>
                    <h3 className="text-3xl font-bold uppercase text-text-primary tracking-tighter leading-none">{selectedTemplate.label}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedTemplate.isCustom && (
                      <>
                        <button onClick={() => { setFormData(selectedTemplate); setIsFormOpen(true); }} className="p-2.5 bg-bg-primary/50 border border-border-subtle text-text-tertiary hover:text-accent-primary transition-all"><Edit3 size={18} /></button>
                        <button onClick={handleDelete} className="p-2.5 bg-bg-primary/50 border border-border-subtle text-text-tertiary hover:text-red-400 transition-all"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-8 p-6 bg-bg-primary/40 border-l-4 border-accent-primary backdrop-blur-md shrink-0">
                   <p className="text-[12px] text-text-secondary leading-relaxed font-medium italic">
                     {selectedTemplate.description || 'Este protocolo não possui uma diretriz descritiva associada.'}
                   </p>
                </div>

                <button 
                  onClick={() => { onSelect(selectedTemplate.content); onClose(); }} 
                  className="w-full mb-8 py-5 bg-accent-primary hover:bg-accent-secondary text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_10px_30px_rgba(59,130,246,0.2)] flex items-center justify-center gap-3"
                >
                  <ChevronRight size={18} strokeWidth={3} />
                  Carregar Protocolo no Núcleo
                </button>

                <div className="flex-1 bg-bg-primary/20 border border-border-subtle p-8 overflow-y-auto custom-scrollbar relative group">
                  <div className="absolute top-4 right-4 text-[9px] font-mono text-text-tertiary opacity-20 group-hover:opacity-60 transition-opacity">PREVIEW DO CÓDIGO</div>
                  <pre className="text-[13px] text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">{selectedTemplate.content}</pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-10 animate-pulse">
                <Bookmark size={80} strokeWidth={1} />
                <p className="mt-6 text-[11px] font-black uppercase tracking-[0.5em]">TESSY LIBRARY</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
