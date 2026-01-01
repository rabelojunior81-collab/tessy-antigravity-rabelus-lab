
import React from 'react';
import { X, Bookmark, Edit3, Trash2, ChevronRight, Hash, Code } from 'lucide-react';
import { Template, RepositoryItem } from '../../types';

interface LibraryDetailsViewerProps {
  item: Template | RepositoryItem;
  onClose: () => void;
  onSelect: (content: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const LibraryDetailsViewer: React.FC<LibraryDetailsViewerProps> = ({ 
  item, 
  onClose, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {
  const isTemplate = 'category' in item;
  const title = isTemplate ? (item as Template).label : (item as RepositoryItem).title;
  const category = isTemplate ? (item as Template).category : 'Protocolo';
  const isCustom = 'isCustom' in item ? (item as Template).isCustom : true;

  return (
    <div className="flex-1 bg-bg-secondary overflow-hidden flex flex-col p-6 animate-fade-in">
      <div className="flex-1 flex flex-col h-full overflow-hidden border border-border-visible bg-bg-tertiary/40 backdrop-blur-lg shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 overflow-hidden">
            <span className="px-2 py-0.5 bg-accent-subtle/40 text-accent-primary text-[9px] font-medium uppercase border border-accent-primary/30 shrink-0">
              {category}
            </span>
            <h2 className="text-2xl font-light text-text-primary truncate tracking-tight">
              {title}
            </h2>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {isCustom && onEdit && (
              <button 
                onClick={() => onEdit(item.id)}
                className="p-2 text-text-tertiary hover:text-accent-primary transition-all active:scale-95"
                title="Editar"
              >
                <Edit3 size={16} />
              </button>
            )}
            {isCustom && onDelete && (
              <button 
                onClick={() => onDelete(item.id)}
                className="p-2 text-text-tertiary hover:text-red-400 transition-all active:scale-95"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>
            )}
            <div className="h-4 w-px bg-border-visible mx-2"></div>
            <button 
              onClick={onClose}
              className="p-1.5 text-text-tertiary hover:text-red-400 transition-all active:scale-90"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div className="px-6 py-4 bg-bg-tertiary/30 border-b border-border-visible/50 shrink-0">
            <p className="text-sm text-text-secondary leading-relaxed italic font-normal">
              {item.description}
            </p>
          </div>
        )}

        {/* Prompt Preview */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <div className="flex items-center gap-2 mb-4">
             <Code size={12} className="text-accent-primary opacity-50" />
             <h4 className="text-[10px] font-medium text-text-tertiary uppercase tracking-[0.2em]">Núcleo do Prompt</h4>
          </div>
          <div className="bg-bg-primary/40 border border-border-visible p-8 shadow-inner group relative">
            <pre className="text-sm text-text-secondary font-mono font-normal whitespace-pre-wrap leading-relaxed select-all">
              {item.content}
            </pre>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Bookmark size={16} className="text-accent-primary/20" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 bg-bg-primary/60 border-t border-border-visible flex items-center justify-between shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-bg-tertiary border border-border-visible text-text-primary text-xs font-medium hover:bg-bg-elevated transition-all active:scale-95"
          >
            Voltar
          </button>
          
          <button 
            onClick={() => onSelect(item.content || '')}
            className="px-10 py-3 bg-accent-primary hover:bg-accent-secondary text-white text-xs font-medium transition-all flex items-center gap-3 shadow-xl active:scale-95 group"
          >
            <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            CARREGAR NO NÚCLEO
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibraryDetailsViewer;
