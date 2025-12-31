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
    const interval = setInterval(loadProjects, 5000);
    return () => clearInterval(interval);
  }, [loadProjects]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id === 'default-project') {
      alert('Não é possível excluir o protocolo mestre.');
      return;
    }
    if (confirm('Deseja destruir este protocolo permanentemente?')) {
      await db.projects.delete(id);
      if (id === currentProjectId) onSwitch('default-project');
      loadProjects();
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary animate-fade-in">
      <div className="p-9 border-b border-border-subtle bg-bg-primary/30">
        <button 
          onClick={onOpenModal}
          className="w-full flex items-center justify-center gap-4 py-6 bg-accent-primary hover:bg-accent-secondary text-white text-[11px] font-bold uppercase tracking-[0.1em] transition-all active:scale-95 shadow-xl shadow-accent-primary/10 rounded-none"
        >
          <Plus size={18} strokeWidth={3} />
          Novo Protocolo Master
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-7 space-y-9">
        {isLoading ? (
          <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-accent-primary border-t-transparent animate-spin"></div></div>
        ) : projects.length === 0 ? (
          <div className="p-16 text-center text-[11px] text-text-tertiary font-bold uppercase tracking-[0.3em] border border-dashed border-border-subtle rounded-none">
            Nenhum Protocolo Ativo
          </div>
        ) : (
          projects.map((project) => {
            const isActive = project.id === currentProjectId;
            return (
              <div
                key={project.id}
                onClick={() => onSwitch(project.id)}
                className={`group p-9 border transition-all cursor-pointer relative overflow-hidden rounded-none ${
                  isActive 
                    ? 'bg-accent-primary/5 border-accent-primary shadow-xl shadow-accent-primary/5' 
                    : 'bg-bg-primary/50 border-border-subtle hover:border-accent-primary/30 hover:bg-bg-tertiary/50'
                }`}
              >
                {/* Background Decor */}
                <div className={`absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] transition-opacity`}>
                   <Folder size={120} strokeWidth={1} className="text-accent-primary" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-none" style={{ backgroundColor: project.color || '#3B82F6' }}></div>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">ID: {project.id.split('-')[0]}</span>
                    </div>
                    <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); onEditProject(project.id); }} className="text-text-tertiary hover:text-accent-primary transition-colors"><Edit3 size={18} /></button>
                      <button onClick={(e) => handleDelete(e, project.id)} className="text-text-tertiary hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>

                  <h3 className={`text-[18px] font-bold uppercase leading-none tracking-tight mb-3 transition-colors duration-300 ${
                    isActive ? 'text-accent-primary' : 'text-text-primary'
                  }`}>
                    {project.name}
                  </h3>
                  
                  <p className="text-[13px] text-text-tertiary font-normal leading-[1.6] line-clamp-2 max-w-[95%] mb-6 italic">
                    {project.description || 'Diretriz não especificada para este protocolo de rede.'}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-border-subtle/50">
                    <div className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
                      {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-3 text-accent-primary text-[10px] font-bold uppercase tracking-[0.2em] glow-text-blue animate-pulse-soft">
                        <CheckCircle2 size={14} />
                        Ativo
                      </div>
                    )}
                  </div>
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