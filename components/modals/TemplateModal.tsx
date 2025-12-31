import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Plus, Trash2, Edit3, Save, FileText } from 'lucide-react';
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
    return templates.filter(t => 
      t.label.toLowerCase().includes(term) || 
      t.description?.toLowerCase().includes(term)
    );
  }, [templates, searchTerm]);

  const selectedTemplate = useMemo(() => 
    templates.find(t => t.id === selectedId) || null,
  [templates, selectedId]);

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
    if (!selectedId) return;
    if (confirm('Deseja excluir este template permanentemente?')) {
      await db.templates.delete(selectedId);
      await loadTemplates();
      setSelectedId(null);
    }
  };

  const openEdit = () => {
    if (selectedTemplate) {
      setFormData(selectedTemplate);
      setIsFormOpen(true);
    }
  };

  const openNew = () => {
    setFormData({ label: '', description: '', content: '', category: 'Personalizado' });
    setIsFormOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full h-full sm:h-auto sm:max-w-4xl max-h-[100vh] sm:max-h-[85vh] bg-[#111111] border border-gray-800 flex flex-col shadow-2xl animate-zoom-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <FileText className="text-emerald-500" size={20} />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Biblioteca de Templates</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
          {/* Left Panel: List */}
          <div className={`w-full sm:w-[350px] flex flex-col border-r border-gray-800 bg-[#0d0d0d] ${isFormOpen ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar templates..."
                  className="w-full bg-black border border-gray-800 py-2 pl-9 pr-4 text-[10px] font-black text-white focus:border-emerald-500 outline-none uppercase"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
              {filteredTemplates.length === 0 ? (
                <div className="p-8 text-center text-[9px] font-black text-gray-600 uppercase tracking-widest">
                  Nenhum template encontrado
                </div>
              ) : (
                filteredTemplates.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => { setSelectedId(t.id); setIsFormOpen(false); }}
                    className={`p-3 border transition-all cursor-pointer ${
                      selectedId === t.id 
                        ? 'bg-emerald-500/10 border-emerald-500/50' 
                        : 'bg-black border-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <h4 className={`text-[10px] font-black uppercase truncate ${selectedId === t.id ? 'text-emerald-500' : 'text-gray-300'}`}>
                      {t.label}
                    </h4>
                    <p className="text-[8px] text-gray-600 mt-1 line-clamp-1">{t.description || 'Sem descrição'}</p>
                    <div className="mt-2 flex items-center justify-between text-[7px] font-black text-gray-700 uppercase">
                      <span>{t.category}</span>
                      <span>{new Date(t.createdAt || 0).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-[#0a0a0a] border-t border-gray-800">
              <button 
                onClick={openNew}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Novo Template
              </button>
            </div>
          </div>

          {/* Right Panel: Content / Form */}
          <div className="flex-1 flex flex-col bg-[#111111]">
            {isFormOpen ? (
              <form onSubmit={handleSave} className="flex-1 flex flex-col p-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">
                    {formData.id ? 'Editar Template' : 'Criar Template'}
                  </h3>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="text-[8px] font-black text-gray-500 uppercase hover:text-white">Cancelar</button>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Nome do Template</label>
                  <input 
                    type="text" required
                    value={formData.label}
                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-3 text-[11px] font-black text-white focus:border-emerald-500 outline-none uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Descrição</label>
                  <input 
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-3 text-[11px] font-black text-white focus:border-emerald-500 outline-none uppercase"
                  />
                </div>

                <div className="flex-1 flex flex-col space-y-1.5">
                  <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Conteúdo do Prompt</label>
                  <textarea 
                    required
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="flex-1 w-full bg-black border border-gray-800 p-4 text-[12px] font-medium text-gray-300 focus:border-emerald-500 outline-none resize-none custom-scrollbar"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Salvar Template
                </button>
              </form>
            ) : selectedTemplate ? (
              <div className="flex-1 flex flex-col p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[8px] font-black text-emerald-500 uppercase px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 mb-2 inline-block">
                      {selectedTemplate.category}
                    </span>
                    <h3 className="text-2xl font-black uppercase text-white tracking-tighter">{selectedTemplate.label}</h3>
                    <p className="text-[11px] text-gray-500 mt-2 font-bold italic leading-relaxed">{selectedTemplate.description || 'Nenhuma descrição fornecida.'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={openEdit} className="p-2 text-gray-500 hover:text-blue-500 transition-all border border-gray-800 hover:border-blue-500/20 bg-black"><Edit3 size={16} /></button>
                    <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-500 transition-all border border-gray-800 hover:border-red-500/20 bg-black"><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="flex-1 bg-black/50 border border-gray-800 p-6 overflow-y-auto custom-scrollbar">
                  <pre className="text-[13px] text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {selectedTemplate.content}
                  </pre>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => { onSelect(selectedTemplate.content); onClose(); }}
                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-[6px_6px_0_#059669] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                  >
                    Carregar Protocolo no Chat
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                <FileText size={48} className="text-gray-600 mb-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">Selecione um template para visualizar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;