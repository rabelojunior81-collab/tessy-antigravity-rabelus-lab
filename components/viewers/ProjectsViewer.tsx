import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Folder, Trash2, Edit3, CheckCircle2 } from 'lucide-react';
import { db } from '../../services/dbService';
import { Project } from '../../types';

interface ProjectsViewerProps {
  currentProjectId: string;
  onSwitch: (id: string) => void;
  onOpenModal: () => void;
  onEditProject: (id: string) => void;
}

const ProjectsViewer: React.FC<ProjectsViewerProps> = ({ 
  currentProjectId, 
  onSwitch, 
  onOpenModal, 
  onEditProject 
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await db.projects.toArray();
      setProjects(all.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id === 'default-project') return;
    if (confirm('Destruir protocolo?')) {
      await db.projects.delete(id);
      if (id === currentProjectId) onSwitch('default-project');
      loadProjects();
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary animate-fade-in">
      <div className="p-4 border-b border-border-subtle bg-bg-primary/50">
        <button 
          onClick={onOpenModal}
          className="w-full flex items-center justify-center gap-2 py-3 bg-accent-primary hover:bg-accent-secondary text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
        >
          <Plus size={14} strokeWidth={3} />
          Novo Protocolo
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-4 h-4 border-2 border-accent-primary border-t-transparent animate-spin"></div></div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-[10px] text-text-tertiary font-bold uppercase tracking-widest border border-dashed border-border-subtle">
            Vazio
          </div>
        ) : (
          projects.map((project) => {
            const isActive = project.id === currentProjectId;
            return (
              <div
                key={project.id}
                onClick={() => onSwitch(project.id)}
                className={`group p-4 border transition-all cursor-pointer relative ${
                  isActive ? 'bg-accent-primary/5 border-accent-primary' : 'bg-bg-primary/30 border-border-subtle hover:border-accent-primary/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2" style={{ backgroundColor: project.color || '#3B82F6' }}></div>
                    <span className="text-[12px] font-bold uppercase text-text-primary truncate max-w-[150px]">{project.name}</span>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={(e) => { e.stopPropagation(); onEditProject(project.id); }} className="text-text-tertiary hover:text-accent-primary"><Edit3 size={14} /></button>
                    <button onClick={(e) => handleDelete(e, project.id)} className="text-text-tertiary hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
                
                <p className="text-[11px] text-text-tertiary line-clamp-1 mb-3 font-normal italic">
                  {project.description || 'Sem diretriz.'}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50 text-[9px] font-semibold text-text-tertiary uppercase tracking-widest">
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  {isActive && <span className="text-accent-primary">ATIVO</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectsViewer;