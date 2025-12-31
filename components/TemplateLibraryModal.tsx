
import React, { useState, useEffect, useMemo } from 'react';
import { PROMPT_TEMPLATES } from '../constants/templates';
import { Template } from '../types';
import { getCustomTemplates, saveCustomTemplate, updateCustomTemplate, deleteCustomTemplate, generateUUID } from '../services/storageService';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<Template['category']>('Personalizado');
  const [formContent, setFormContent] = useState('');
  const [formError, setFormError] = useState('');

  const loadCustomTemplates = () => {
    setCustomTemplates(getCustomTemplates());
  };

  useEffect(() => {
    if (isOpen) {
      loadCustomTemplates();
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const systemTemplatesGrouped = useMemo(() => {
    const grouped: Record<string, Template[]> = {};
    PROMPT_TEMPLATES.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = [];
      grouped[t.category].push(t);
    });
    return grouped;
  }, []);

  if (!isOpen) return null;

  const categories: Template['category'][] = ['Código', 'Escrita', 'Análise', 'Ensino', 'Criativo', 'Personalizado'];

  const handleOpenForm = (template: Template | null = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormTitle(template.label);
      setFormCategory(template.category);
      setFormContent(template.content);
    } else {
      setEditingTemplate(null);
      setFormTitle('');
      setFormCategory('Personalizado');
      setFormContent('');
    }
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (formTitle.length < 3) {
      setFormError('O título deve ter pelo menos 3 caracteres.');
      return;
    }
    if (formContent.length < 10) {
      setFormError('O conteúdo deve ter pelo menos 10 caracteres.');
      return;
    }

    const templateData: Template = {
      id: editingTemplate?.id || generateUUID(),
      label: formTitle,
      category: formCategory,
      content: formContent,
      isCustom: true,
      createdAt: editingTemplate?.createdAt || Date.now(),
      updatedAt: Date.now()
    };

    if (editingTemplate) {
      updateCustomTemplate(editingTemplate.id, templateData);
    } else {
      saveCustomTemplate(templateData);
    }

    loadCustomTemplates();
    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteCustomTemplate(id);
    setConfirmDeleteId(null);
    loadCustomTemplates();
  };

  return (
    <div 
      className={`fixed inset-0 z-[60] flex items-center justify-center p-8 bg-slate-950/30 dark:bg-slate-950/80 backdrop-blur-md ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`glass-panel !rounded-none w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden !bg-white/95 dark:!bg-slate-900/60 !backdrop-blur-2xl !border-emerald-500/40 ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="px-8 py-6 border-b-2 border-emerald-500/20 flex justify-between items-center bg-emerald-500/5 dark:bg-slate-900/40 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter glow-text-green">Biblioteca de Templates</h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] mt-1">Gestão de Protocolos Rabelus Lab</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleOpenForm()}
              className="brutalist-button px-5 py-2.5 bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-emerald-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              Novo Template
            </button>
            <button onClick={handleClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-transparent space-y-12">
          
          <div>
            <div className="flex items-center gap-4 mb-8">
              <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">Meus Templates</h4>
              <div className="h-0.5 flex-1 bg-emerald-500/20"></div>
            </div>
            
            {customTemplates.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-emerald-500/10 text-center bg-slate-50 dark:bg-slate-900/20">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest italic">
                  Você ainda não possui templates personalizados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customTemplates.map(template => (
                  <div 
                    key={template.id}
                    className="group relative p-6 bg-white dark:bg-slate-900 border-2 border-emerald-500/20 hover:border-emerald-500/60 transition-all shadow-[6px_6px_0_rgba(0,0,0,0.05)] dark:shadow-[6px_6px_0_rgba(0,0,0,0.3)] flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-tighter">Personalizado</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenForm(template); }}
                          className="text-emerald-600 hover:text-emerald-400 p-1"
                          title="Editar"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(template.id); }}
                          className="text-red-500 hover:text-red-400 p-1"
                          title="Excluir"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                    <h5 className="text-sm font-black text-slate-800 dark:text-white uppercase mb-3 tracking-wider line-clamp-1">{template.label}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 italic mb-6 flex-1">{template.content}</p>
                    <button 
                      onClick={() => onSelect(template)}
                      className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white font-black uppercase text-[9px] tracking-widest transition-all border border-emerald-500/20"
                    >
                      Carregar Protocolo
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-4 mb-8">
              <h4 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em]">Templates Pré-definidos</h4>
              <div className="h-0.5 flex-1 bg-slate-500/20"></div>
            </div>
            <div className="space-y-10">
              {Object.entries(systemTemplatesGrouped).map(([category, templates]) => {
                const typedTemplates = templates as Template[];
                return (
                  <div key={category}>
                    <h6 className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-400/50 uppercase tracking-[0.4em] mb-4">{category}</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {typedTemplates.map(template => (
                        <div 
                          key={template.id}
                          className="group relative p-6 bg-slate-50 dark:bg-slate-900/40 border-2 border-emerald-500/5 hover:border-emerald-500/40 transition-all shadow-[4px_4px_0_rgba(0,0,0,0.02)] dark:shadow-[4px_4px_0_rgba(0,0,0,0.2)] cursor-pointer flex flex-col"
                          onClick={() => onSelect(template)}
                        >
                          <div className="mb-3">
                             <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-500 text-[8px] font-black uppercase tracking-tighter">Sistema</span>
                          </div>
                          <h5 className="text-sm font-black text-slate-800 dark:text-white uppercase mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-wider">
                            {template.label}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic font-medium flex-1">
                            {template.content}
                          </p>
                          <div className="mt-4 flex justify-end">
                            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                              Carregar Protocolo →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-8 border-t-2 border-emerald-500/20 bg-emerald-500/5 dark:bg-slate-900/40 flex justify-end shrink-0">
          <button onClick={handleClose} className="brutalist-button px-10 py-3 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-300 dark:hover:bg-slate-700">
            Fechar Biblioteca
          </button>
        </div>

        {isFormOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="glass-panel !rounded-none w-full max-w-lg !bg-white dark:!bg-slate-900 shadow-2xl animate-zoom-in !border-emerald-500/50">
              <div className="px-6 py-4 border-b-2 border-emerald-500/20 bg-emerald-500/5 flex justify-between items-center">
                <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                  {editingTemplate ? 'Editar Protocolo' : 'Novo Protocolo'}
                </h4>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors p-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSaveForm} className="p-6 space-y-6">
                {formError && (
                  <div className="p-3 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest border-2 border-red-200">
                    Erro: {formError}
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Título do Template</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={formTitle} 
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Refatoração de Componentes"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/20 p-3 text-slate-900 dark:text-white font-bold placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all !rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Categoria</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/20 p-3 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500 transition-all !rounded-none uppercase text-xs"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Instrução do Protocolo</label>
                  <textarea 
                    value={formContent} 
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Insira as diretrizes detalhadas do prompt aqui..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-emerald-500/20 p-3 text-slate-900 dark:text-white font-medium h-48 resize-none focus:outline-none focus:border-emerald-500 transition-all !rounded-none custom-scrollbar"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="brutalist-button flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-[10px]">Cancelar</button>
                  <button type="submit" className="brutalist-button flex-1 py-3 bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px]">Salvar Protocolo</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {confirmDeleteId && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="glass-panel !rounded-none w-full max-w-sm !bg-white dark:!bg-slate-900 p-8 border-red-500/50 shadow-2xl text-center animate-zoom-in">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 mx-auto flex items-center justify-center rounded-full mb-6">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-4 tracking-tighter">Confirmar Exclusão</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 font-medium">Esta ação removerá permanentemente o template da base de dados. Deseja prosseguir?</p>
              <div className="flex gap-4">
                <button onClick={() => setConfirmDeleteId(null)} className="brutalist-button flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-[10px]">Cancelar</button>
                <button onClick={() => handleDelete(confirmDeleteId)} className="brutalist-button flex-1 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-[10px]">Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateLibraryModal;
