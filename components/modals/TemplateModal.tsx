import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Plus, Trash2, Edit3, FileText } from 'lucide-react';
import { db, generateUUID } from '../../services/dbService';
import { Template } from '../../types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
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
    setTemplates(all);
  };

  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return templates;
    const term = searchTerm.toLowerCase();
    return templates.filter(t => t.label.toLowerCase().includes(term));
  }, [templates, searchTerm]);

  const selectedTemplate = useMemo(() => templates.find(t => t.id === selectedId) || null, [templates, selectedId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.content) return;
    const id = formData.id || generateUUID();
    const newTemplate: Template = { ...formData as Template, id, isCustom: true, updatedAt: Date.now(), createdAt: formData.createdAt || Date.now() };
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
      <div className="w-full max-w-4xl h-[80vh] bg-bg-secondary border border-border-visible flex flex-col shadow-2xl animate-zoom-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-primary">
          <div className="flex items-center gap-3">
            <FileText className="text-accent-primary" size={18} />
            <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-primary">Templates</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all"><X size={20} /></button>
        </div>

        <div className="flex-1 flex flex-row overflow-hidden">
          <div className="w-[300px] flex flex-col border-r border-border-subtle bg-bg-primary/20">
            <div className="p-4 border-b border-border-subtle">
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="BUSCAR..." className="w-full bg-bg-tertiary border border-border-subtle p-2.5 text-[10px] font-bold text-text-primary focus:border-accent-primary outline-none uppercase" />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {filteredTemplates.map(t => (
                <div key={t.id} onClick={() => { setSelectedId(t.id); setIsFormOpen(false); }} className={`p-3 border transition-all cursor-pointer ${selectedId === t.id ? 'bg-accent-primary/5 border-accent-primary' : 'bg-bg-primary/50 border-border-subtle hover:border-accent-primary/20'}`}>
                  <h4 className={`text-[10px] font-bold uppercase truncate ${selectedId === t.id ? 'text-accent-primary' : 'text-text-secondary'}`}>{t.label}</h4>
                </div>
              ))}
            </div>
            <div className="p-4 bg-bg-primary border-t border-border-subtle">
              <button onClick={() => { setFormData({ label: '', description: '', content: '', category: 'Personalizado' }); setIsFormOpen(true); }} className="w-full py-2.5 bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-bold uppercase tracking-widest transition-all">Novo</button>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-bg-secondary">
            {isFormOpen ? (
              <form onSubmit={handleSave} className="flex-1 flex flex-col p-6 space-y-6">
                <input type="text" required value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} placeholder="NOME..." className="w-full bg-bg-tertiary border border-border-subtle p-3 text-[11px] font-bold text-text-primary focus:border-accent-primary outline-none uppercase" />
                <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="PROMPT..." className="flex-1 w-full bg-bg-tertiary border border-border-subtle p-4 text-[13px] font-normal text-text-primary focus:border-accent-primary outline-none resize-none custom-scrollbar" />
                <button type="submit" className="w-full py-3 bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-bold uppercase tracking-widest transition-all">Salvar</button>
              </form>
            ) : selectedTemplate ? (
              <div className="flex-1 flex flex-col p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold uppercase text-text-primary tracking-tight">{selectedTemplate.label}</h3>
                    <p className="text-[11px] text-text-tertiary mt-2 italic">{selectedTemplate.description || 'Sem descrição.'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setFormData(selectedTemplate); setIsFormOpen(true); }} className="p-2 text-text-tertiary hover:text-accent-primary"><Edit3 size={16} /></button>
                    <button onClick={handleDelete} className="p-2 text-text-tertiary hover:text-red-400"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="flex-1 bg-bg-primary/30 border border-border-subtle p-6 overflow-y-auto custom-scrollbar">
                  <pre className="text-[13px] text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">{selectedTemplate.content}</pre>
                </div>
                <button onClick={() => { onSelect(selectedTemplate.content); onClose(); }} className="w-full mt-8 py-4 bg-accent-primary hover:bg-accent-secondary text-white text-[11px] font-bold uppercase tracking-[0.1em] transition-all">Carregar no Chat</button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-10"><FileText size={48} /></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;