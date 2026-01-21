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
  const [isClosing, setIsClosing] = useState(false);
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
      setIsClosing(false);
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

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-md h-[75vh] glass-modal flex flex-col ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-2 py-1 glass-header flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <Bookmark style={{ color: 'var(--glass-accent)' }} size={10} />
            <h2 className="text-[9px] font-bold tracking-widest text-glass uppercase">Protocolos</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-0.5 text-glass-muted hover:text-glass transition-all"
          >
            <X size={10} />
          </button>
        </div>

        <div className="flex-1 flex flex-row overflow-hidden relative z-10 bg-transparent">
          {/* Sidebar */}
          <div className="w-[140px] flex flex-col border-r border-glass shrink-0 bg-transparent">
            <div className="p-2 border-b border-glass/10 flex items-center gap-1">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-glass-muted" size={10} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="FILTRAR..."
                  className="w-full glass-input py-1 pl-6 pr-1 text-[9px] font-medium text-glass placeholder:text-glass-muted/40 focus:border-glass-accent outline-none transition-all"
                />
              </div>
              <button
                onClick={() => { setFormData({ label: '', description: '', content: '', category: 'Personalizado' }); setIsFormOpen(true); }}
                className="p-1 text-glass-muted hover:text-glass-accent transition-all shrink-0 active:scale-90"
                title="NOVO PROTOCOLO"
              >
                <Plus size={12} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-3">
              {(Object.entries(groupedTemplates) as [string, Template[]][]).map(([category, items]) => (
                <div key={category} className="space-y-0.5">
                  <div className="px-2 py-0.5 flex items-center justify-between opacity-50">
                    <span className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">{category}</span>
                    <span className="text-[7px] font-mono text-glass-muted">{items.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {items.map(t => (
                      <div
                        key={t.id}
                        onClick={() => { setSelectedId(t.id); setIsFormOpen(false); }}
                        className={`group px-2 py-1.5 transition-all cursor-pointer flex items-center gap-2 border-l-2 ${selectedId === t.id
                          ? 'border-glass-accent bg-glass-accent/10 text-glass'
                          : 'border-transparent hover:bg-white/[0.02] text-glass-muted hover:text-glass-secondary'
                          }`}
                      >
                        <Hash size={10} className={selectedId === t.id ? 'text-glass-accent' : 'opacity-20'} />
                        <h4 className="text-[10px] font-medium truncate leading-none">
                          {t.label}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-transparent">
            {isFormOpen ? (
              <form onSubmit={handleSave} className="flex-1 flex flex-col p-4 space-y-3 animate-fade-in h-full">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">Protocolo</label>
                      <input type="text" required value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })}
                        className="w-full glass-input p-2 text-[10px] font-medium text-glass focus:border-glass-accent outline-none transition-colors placeholder:text-glass-muted/40" />
                    </div>
                    <div className="w-[100px] space-y-1">
                      <label className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">Categoria</label>
                      <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full glass-input p-2 text-[10px] font-medium text-glass focus:border-glass-accent outline-none appearance-none cursor-pointer">
                        <option value="Código" className="bg-bg-primary">CÓDIGO</option>
                        <option value="Escrita" className="bg-bg-primary">ESCRITA</option>
                        <option value="Análise" className="bg-bg-primary">ANÁLISE</option>
                        <option value="Ensino" className="bg-bg-primary">ENSINO</option>
                        <option value="Criativo" className="bg-bg-primary">CRIATIVO</option>
                        <option value="Personalizado" className="bg-bg-primary">PESSOAL</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">Descrição</label>
                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full h-12 glass-input p-2 text-[10px] font-medium text-glass-secondary resize-none custom-scrollbar focus:border-glass-accent outline-none transition-colors placeholder:text-glass-muted/40" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col space-y-1">
                  <label className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">Núcleo do Prompt</label>
                  <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="flex-1 w-full glass-input p-2 text-[10px] font-mono text-glass-secondary resize-none custom-scrollbar focus:border-glass-accent outline-none transition-colors leading-relaxed" />
                </div>
                <div className="flex gap-2 pt-1 pb-1">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 py-1.5 glass-card border-glass/10 text-glass-muted hover:text-glass font-bold uppercase tracking-widest text-[8px] transition-all active:scale-95">Cancelar</button>
                  <button type="submit" style={{ boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)' }} className="flex-1 py-1.5 bg-glass-accent text-white hover:brightness-110 font-bold uppercase tracking-widest text-[8px] transition-all active:scale-95 border-transparent">Salvar</button>
                </div>
              </form>
            ) : selectedTemplate ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-fade-in h-full">
                {/* Template Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-surface-subtle shrink-0 bg-white/5">
                  <div className="flex items-center overflow-hidden">
                    <span className="px-1.5 py-0.5 bg-glass-accent/10 border border-glass-accent/20 text-glass-accent text-[8px] font-bold uppercase tracking-widest shrink-0">
                      {selectedTemplate.category}
                    </span>
                    <h3 className="text-[11px] font-medium text-glass ml-3 truncate">
                      {selectedTemplate.label}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {selectedTemplate.isCustom && (
                      <>
                        <button onClick={() => { setFormData(selectedTemplate); setIsFormOpen(true); }} className="p-1.5 text-glass-muted hover:text-glass transition-all"><Edit3 size={12} /></button>
                        <button onClick={handleDelete} className="p-1.5 text-glass-muted hover:text-red-400 transition-all"><Trash2 size={12} /></button>
                      </>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="flex-1 p-3 overflow-y-auto custom-scrollbar bg-transparent">
                  <pre className="text-[10px] text-glass-secondary font-mono font-normal whitespace-pre-wrap leading-relaxed p-3 glass-card border-glass/10 bg-black/20">{selectedTemplate.content}</pre>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-4 py-3 border-t border-glass/10 bg-transparent flex justify-end">
                  <button
                    onClick={() => { onSelect(selectedTemplate.content); handleClose(); }}
                    style={{ boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)' }}
                    className="w-full py-2 bg-glass-accent text-white hover:brightness-110 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <ChevronRight size={14} strokeWidth={3} />
                    Carregar no Núcleo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20">
                <Bookmark size={48} strokeWidth={1} className="text-glass-accent mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Selecione um Protocolo</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;
