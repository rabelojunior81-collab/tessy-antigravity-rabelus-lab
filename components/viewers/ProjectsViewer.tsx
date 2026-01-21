import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Folder, Trash2, Edit3, Search, Check, X } from 'lucide-react';
import { db } from '../../services/dbService';
import { Project } from '../../types';

interface ProjectsViewerProps {
  currentProjectId: string;
  onSwitch: (id: string) => void;
  onOpenModal: () => void;
  onEditProject: (id: string) => void;
  onSelectProject: (id: string) => void;
}

const ProjectsViewer: React.FC<ProjectsViewerProps> = ({
  currentProjectId,
  onSwitch,
  onOpenModal,
  onEditProject,
  onSelectProject
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

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

  useEffect(() => {
    setConfirmingId(null);
  }, [projects.length]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) return projects;
    const term = searchTerm.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term)
    );
  }, [projects, searchTerm]);

  const handleStartDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (id === 'default-project') return;
    setConfirmingId(id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmingId(null);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await db.projects.delete(id);
      if (id === currentProjectId) onSwitch('default-project');
      loadProjects();
      setConfirmingId(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="px-2 py-1 flex items-center gap-1 glass-header glass-header-compact">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-glass-muted" size={12} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="BUSCAR PROJETOS..."
            className="w-full glass-input py-1 pl-7 pr-2 text-[10px] font-normal text-glass focus:border-glass-accent outline-none placeholder:text-glass-muted/40"
          />
        </div>
        <button
          onClick={onOpenModal}
          className="p-1 text-glass-muted hover:text-glass-accent transition-all shrink-0 active:scale-90"
          title="Novo Projeto"
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-1 space-y-1">
        {isLoading && projects.length === 0 ? (
          <div className="flex justify-center p-8"><div className="w-4 h-4 border border-glass-accent border-t-transparent animate-spin"></div></div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-8 text-center text-xs text-glass-muted font-medium uppercase tracking-wide opacity-30">
            {searchTerm ? 'Nenhum resultado' : 'Vazio'}
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isActive = project.id === currentProjectId;
            const isConfirming = confirmingId === project.id;
            return (
              <div
                key={project.id}
                onClick={() => !isConfirming && onSelectProject(project.id)}
                style={{
                  backgroundColor: isActive && !isConfirming ? 'rgba(var(--accent-rgb), 0.12)' : undefined,
                  borderColor: isActive && !isConfirming ? 'rgba(var(--accent-rgb), 0.3)' : undefined
                }}
                className={`p-1.5 glass-card transition-all cursor-pointer group relative ${isActive ? '' : 'hover:border-glass-accent/30'} ${isConfirming ? 'border-red-400/50 bg-red-400/5' : ''}`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    {!isConfirming && (
                      <div className="w-1.5 h-1.5 shrink-0" style={{ backgroundColor: 'var(--glass-accent)' }}></div>
                    )}
                    <h4
                      style={{ color: !isConfirming && isActive ? 'var(--glass-accent)' : undefined }}
                      className={`text-sm font-normal truncate tracking-normal transition-colors ${isConfirming ? 'text-red-400' : (isActive ? '' : 'text-glass-secondary group-hover:text-glass')}`}
                    >
                      {isConfirming ? 'EXCLUIR PROJETO?' : project.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {isConfirming ? (
                      <>
                        <button
                          onClick={(e) => handleConfirmDelete(e, project.id)}
                          className="p-1 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Confirmar"
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="p-1 text-glass-muted hover:bg-surface-elevated transition-all"
                          title="Cancelar"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={(e) => { e.stopPropagation(); onEditProject(project.id); }}
                          className="p-1 text-glass-muted hover:text-glass"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        {project.id !== 'default-project' && (
                          <button
                            onClick={(e) => handleStartDelete(e, project.id)}
                            className="p-1 text-glass-muted hover:text-red-400"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-glass-muted line-clamp-1 mb-2 font-normal italic">
                  {project.description || 'Sem diretriz definida.'}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-glass/10 text-[9px] font-medium text-glass-muted uppercase tracking-wide">
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    {isActive && <span style={{ color: 'var(--glass-accent)' }}>ATIVO</span>}
                    <button
                      onClick={(e) => { e.stopPropagation(); onSwitch(project.id); }}
                      style={{
                        backgroundColor: isActive ? 'var(--glass-accent)' : 'transparent',
                        color: isActive ? 'white' : 'var(--glass-accent)',
                        borderColor: isActive ? 'var(--glass-accent)' : 'rgba(var(--accent-rgb), 0.3)'
                      }}
                      className="px-1 py-0.5 border text-[8px] transition-all hover:brightness-110 active:scale-95 font-bold tracking-widest"
                    >
                      {isActive ? 'SEL' : 'USAR'}
                    </button>
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
