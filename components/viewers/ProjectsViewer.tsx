
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
    <div className="flex flex-col h-full bg-[#111111] animate-fade-in">
      <div className="p-6 border-b border-gray-800">
        <button 
          onClick={onOpenModal}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white hover:bg-emerald-500 text-[#0a0a0a] hover:text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[8px_8px_0_rgba(16,185,129,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
        >
          <Plus size={16} strokeWidth={3} />
          Novo Protocolo Master
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {isLoading ? (
          <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent animate-spin"></div></div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] border-4 border-dashed border-gray-800">
            Nenhum Protocolo Ativo
          </div>
        ) : (
          projects.map((project) => {
            const isActive = project.id === currentProjectId;
            return (
              <div
                key={project.id}
                onClick={() => onSwitch(project.id)}
                className={`group p-6 border-4 transition-all cursor-pointer relative overflow-hidden ${
                  isActive 
                    ? 'bg-emerald-500/5 border-emerald-500 shadow-[12px_12px_0_rgba(16,185,129,0.1)]' 
                    : 'bg-[#0a0a0a] border-gray-800 hover:border-gray-600 hover:bg-[#0f0f0f]'
                }`}
              >
                {/* Background Decor */}
                <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity`}>
                   <Folder size={80} strokeWidth={1} />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-none" style={{ backgroundColor: project.color || '#10b981' }}></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">ID: {project.id.split('-')[0]}</span>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={(e) => { e.stopPropagation(); onEditProject(project.id); }} className="text-gray-500 hover:text-emerald-500"><Edit3 size={16} /></button>
                      <button onClick={(e) => handleDelete(e, project.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>

                  <h3 className={`text-2xl sm:text-3xl font-black uppercase leading-none tracking-tighter mb-2 transition-colors duration-300 ${
                    isActive ? 'text-emerald-500' : 'text-white'
                  }`}>
                    {project.name}
                  </h3>
                  
                  <p className="text-[11px] text-gray-500 font-medium leading-tight line-clamp-2 max-w-[90%] mb-4">
                    {project.description || 'Diretriz não especificada para este protocolo de rede.'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                    <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest">
                      Atualizado: {new Date(project.updatedAt).toLocaleDateString('pt-BR')}
                    </div>
                    {isActive && (
                      <div className="flex items-center gap-2 text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] glow-text-green animate-pulse-soft">
                        <CheckCircle2 size={12} />
                        Protocolo Master Ativo
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
