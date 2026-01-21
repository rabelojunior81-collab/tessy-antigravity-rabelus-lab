import React, { useState, useEffect } from 'react';
import { X, Bookmark, Edit3, Trash2, ChevronRight, Hash, Code, Save, Undo2 } from 'lucide-react';
import { Template, RepositoryItem } from '../../types';
import { db, generateUUID } from '../../services/dbService';

interface LibraryDetailsViewerProps {
  item: Template | RepositoryItem | (Template & { isEditing?: boolean }) | null;
  isCreating?: boolean;
  currentProjectId?: string;
  onClose: () => void;
  onSelect: (content: string) => void;
  onSaveSuccess?: () => void;
}

const LibraryDetailsViewer: React.FC<LibraryDetailsViewerProps> = ({
  item,
  isCreating = false,
  currentProjectId,
  onClose,
  onSelect,
  onSaveSuccess
}) => {
  const [isEditing, setIsEditing] = useState(isCreating || (item as any)?.isEditing);
  const [formData, setFormData] = useState<Partial<Template & { title?: string }>>({
    label: '',
    description: '',
    content: '',
    category: 'Personalizado'
  });

  useEffect(() => {
    if (item && !isCreating) {
      setFormData({
        id: item.id,
        label: 'label' in item ? (item as Template).label : (item as RepositoryItem).title,
        description: item.description || '',
        content: item.content || '',
        category: 'category' in item ? (item as Template).category : 'Personalizado',
        isCustom: 'isCustom' in item ? (item as Template).isCustom : true,
      });
      setIsEditing((item as any).isEditing || false);
    } else if (isCreating) {
      setFormData({
        label: '',
        description: '',
        content: '',
        category: 'Personalizado'
      });
      setIsEditing(true);
    }
  }, [item, isCreating]);

  if (!item && !isCreating) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label || !formData.content) return;

    try {
      const id = formData.id || generateUUID();

      // If we have a project ID, save to 'library' table as a RepositoryItem
      if (currentProjectId) {
        const repoItem: RepositoryItem = {
          id,
          projectId: currentProjectId,
          title: formData.label || '',
          description: formData.description || '',
          content: formData.content || '',
          timestamp: Date.now(),
          tags: [formData.category?.toLowerCase() || 'personalizado']
        };
        await db.library.put(repoItem);
      } else {
        // Otherwise save to global templates
        const template: Template = {
          id,
          label: formData.label || '',
          description: formData.description || '',
          content: formData.content || '',
          category: (formData.category as any) || 'Personalizado',
          isCustom: true,
          updatedAt: Date.now(),
          createdAt: formData.id ? (item as any).createdAt || Date.now() : Date.now()
        };
        await db.templates.put(template);
      }

      setIsEditing(false);
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const category = formData.category || 'Personalizado';
  const title = formData.label || (isCreating ? 'Novo Protocolo' : 'Detalhes');

  return (
    <div className="flex-1 glass-panel overflow-hidden flex flex-col h-full animate-fade-in group">
      <div className="flex-1 flex flex-col h-full overflow-hidden">

        {/* Header - Standardized */}
        <div className="px-2 py-0.5 border-b border-glass-border glass-header flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <div className="w-1.5 h-1.5 bg-glass-muted/40" />
            <h2 className="text-[9px] font-bold text-glass tracking-widest uppercase opacity-80 truncate">
              {title}
            </h2>
            <span className="px-1.5 py-0.5 bg-glass-accent/10 text-glass-accent text-[8px] font-bold uppercase border border-glass-accent/20 shrink-0 tracking-wide rounded-sm">
              {isEditing ? 'EDITOR' : category}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isEditing && (formData as any).isCustom !== false && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-0.5 text-glass-muted hover:text-glass-accent transition-all active:scale-95"
                title="Editar"
              >
                <Edit3 size={12} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-0.5 text-glass-muted hover:text-red-400 transition-all active:scale-90"
              title="Fechar"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {isEditing ? (
          /* FORM VIEW */
          <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-glass-muted uppercase tracking-widest">Nome do Protocolo</label>
                  <input
                    type="text"
                    required
                    value={formData.label}
                    onChange={e => setFormData({ ...formData, label: e.target.value })}
                    placeholder="TITULO..."
                    className="w-full glass-input p-2.5 text-xs font-normal text-glass uppercase focus:border-glass-accent outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-glass-muted uppercase tracking-widest">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full glass-input p-2.5 text-xs font-normal text-glass uppercase focus:border-glass-accent outline-none"
                  >
                    <option value="Código" className="bg-black">Código</option>
                    <option value="Escrita" className="bg-black">Escrita</option>
                    <option value="Análise" className="bg-black">Análise</option>
                    <option value="Ensino" className="bg-black">Ensino</option>
                    <option value="Criativo" className="bg-black">Criativo</option>
                    <option value="Personalizado" className="bg-black">Personalizado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-glass-muted uppercase tracking-widest">Diretrizes / Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="OBJETIVO DESTE PROTOCOLO..."
                  className="w-full h-20 glass-input p-2.5 text-xs font-normal text-glass-secondary outline-none focus:border-glass-accent resize-none custom-scrollbar"
                />
              </div>

              <div className="flex-1 flex flex-col space-y-2 min-h-[300px]">
                <label className="text-[10px] font-bold text-glass-muted uppercase tracking-widest">Núcleo do Prompt (Conteúdo)</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="CONTEÚDO DO PROMPT..."
                  className="flex-1 w-full glass-input p-3 text-sm font-mono font-normal text-glass focus:border-glass-accent outline-none resize-none custom-scrollbar"
                />
              </div>
            </div>

            {/* Footer Form */}
            <div className="px-3 py-2 glass-header border-t border-glass-border flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => isCreating ? onClose() : setIsEditing(false)}
                className="px-3 py-1.5 glass-button text-glass-muted text-[10px] font-bold uppercase tracking-widest hover:text-glass transition-all"
              >
                Abortar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-glass-accent hover:brightness-110 text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
              >
                <Save size={12} /> Sincronizar
              </button>
            </div>
          </form>
        ) : (
          /* PREVIEW VIEW */
          <div className="flex-1 flex flex-col overflow-hidden">
            {formData.description && (
              <div className="px-4 py-2 bg-glass-base/30 border-b border-glass-border shrink-0">
                <p className="text-sm text-glass-secondary leading-relaxed italic font-normal">
                  {formData.description}
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <div className="flex items-center gap-2 mb-4">
                <Code size={12} className="text-glass-accent opacity-50" />
                <h4 className="text-[10px] font-bold text-glass-muted uppercase tracking-[0.2em]">Núcleo do Protocolo</h4>
              </div>
              <div className="glass-card p-3 shadow-inner group relative">
                <pre className="text-sm text-glass-secondary font-mono font-normal whitespace-pre-wrap leading-relaxed select-all">
                  {formData.content}
                </pre>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-3 py-2 glass-header border-t border-glass-border flex items-center justify-between shrink-0">
              <button
                onClick={onClose}
                className="px-3 py-1.5 glass-button text-glass-muted text-[10px] font-bold uppercase tracking-widest hover:text-glass transition-all"
              >
                <Undo2 size={12} className="mr-2 inline" /> Voltar
              </button>

              <button
                onClick={() => onSelect(formData.content || '')}
                className="px-3 py-1.5 bg-glass-accent hover:brightness-110 text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm active:scale-95 group"
              >
                <ChevronRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                Carregar no Núcleo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryDetailsViewer;
