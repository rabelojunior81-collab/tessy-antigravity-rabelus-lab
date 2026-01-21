
import React, { useState, useEffect } from 'react';
import { db } from '../services/dbService';
import { Project } from '../types';


interface ProjectDashboardProps {
  projectId: string;
  onNewConversation: () => void;
  onOpenLibrary: () => void;
  onRefreshHistory: () => void;
  onEditProject: (id: string) => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projectId,
  onNewConversation,
  onOpenLibrary,
  onRefreshHistory,
  onEditProject
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState({ conversations: 0, library: 0, templates: 0 });

  const loadData = async () => {
    const p = await db.projects.get(projectId);
    if (p) {
      setProject(p);
      const convCount = await db.conversations.where('projectId').equals(projectId).count();
      const libCount = await db.library.where('projectId').equals(projectId).count();
      const tempCount = await db.templates.count(); // Global for now
      setStats({ conversations: convCount, library: libCount, templates: tempCount });
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (!project) return (
    <div className="p-8 text-center text-sm text-glass-muted animate-soft-pulse">
      Sincronizando...
    </div>
  );

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 overflow-y-auto custom-scrollbar animate-fade-in bg-transparent transition-all duration-300">
      {/* Active Project Card with LiquidGlass styling */}
      <div style={{ borderLeftColor: 'var(--glass-accent)' }} className="glass-card mb-4 p-4 relative overflow-hidden group border-l-4">
        {/* Background Visual Element */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none translate-x-12 -translate-y-12">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-[spin_40s_linear_infinite]">
            <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-glass-accent" />
            <rect x="25" y="25" width="50" height="50" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 2" className="text-glass-accent" />
          </svg>
        </div>

        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1 min-w-0 pr-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span style={{ backgroundColor: 'var(--glass-accent)' }} className="animate-ping absolute inline-flex h-full w-full opacity-75"></span>
                <span style={{ backgroundColor: 'var(--glass-accent)' }} className="relative inline-flex h-2 w-2"></span>
              </span>
              <span style={{ color: 'var(--glass-accent)' }} className="text-[10px] font-bold uppercase tracking-widest">Protocolo Ativo</span>
            </div>

            {/* Prominent Title */}
            <h2
              className="text-2xl font-black text-glass leading-none mb-2 group-hover:text-glass-accent transition-colors cursor-pointer truncate uppercase tracking-tight"
              onClick={() => onEditProject(projectId)}
            >
              {project.name}
            </h2>

            {/* Description Subtitle */}
            <p className="text-xs text-glass-secondary leading-tight line-clamp-2 max-w-[90%] font-mono">
              {project.description || 'Nenhuma diretriz definida.'}
            </p>

            {/* Visual Metadata Footer */}
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div style={{ backgroundColor: 'var(--glass-accent)' }} className="w-1 h-2"></div>
                <div style={{ backgroundColor: 'var(--glass-accent)', opacity: 0.6 }} className="w-1 h-2"></div>
                <div style={{ backgroundColor: 'var(--glass-accent)', opacity: 0.3 }} className="w-1 h-2"></div>
              </div>
              <span className="text-[9px] font-mono text-glass-muted uppercase tracking-widest">REF: {project.id.split('-')[0]}</span>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => onEditProject(projectId)}
            className="glass-button p-2 hover:text-white transition-all cursor-pointer active:scale-95"
            style={{ color: 'var(--glass-accent)' }}
            aria-label="Editar Protocolo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>

      {/* GitHub Integration Section */}
      {project.githubRepo && (
        <div className="glass-card mb-4 p-3 border-l-2 border-l-glass-border">
          <h4 className="text-[10px] font-bold text-glass-muted mb-1 flex items-center gap-2 uppercase tracking-wider">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            Integração GitHub
          </h4>
          <a
            href={project.githubRepo.startsWith('http') ? project.githubRepo : `https://github.com/${project.githubRepo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-glass-accent hover:underline font-mono truncate block"
          >
            {project.githubRepo}
          </a>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="glass-card p-3 flex flex-col items-start hover:bg-glass-panel/50 transition-colors">
          <span className="text-xl font-black text-glass-accent leading-none">{stats.conversations}</span>
          <span className="text-[9px] text-glass-muted mt-1 uppercase tracking-widest font-bold">Sessões</span>
        </div>
        <div className="glass-card p-3 flex flex-col items-start hover:bg-glass-panel/50 transition-colors">
          <span className="text-xl font-black text-glass-accent leading-none">{stats.library}</span>
          <span className="text-[9px] text-glass-muted mt-1 uppercase tracking-widest font-bold">Prompt base</span>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="mb-4">
        <h4 className="text-[9px] font-bold text-glass-muted mb-2 border-b border-glass-border pb-1 uppercase tracking-widest">Sistema</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onRefreshHistory}
            className="glass-button py-2 px-3 text-[10px] font-bold text-glass-secondary hover:text-glass transition-all active:scale-[0.98] uppercase tracking-wider"
          >
            Sessões
          </button>
          <button
            onClick={onOpenLibrary}
            className="glass-button py-2 px-3 text-[10px] font-bold text-glass-secondary hover:text-glass transition-all active:scale-[0.98] uppercase tracking-wider"
          >
            Biblioteca
          </button>
        </div>
      </div>

      {/* Ações do Core */}
      <div className="space-y-2 mt-auto">
        <button
          onClick={onNewConversation}
          className="glass-button-accent w-full py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-lg hover:shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Novo Protocolo
        </button>
        <button
          onClick={onOpenLibrary}
          className="glass-button w-full py-3 text-[10px] font-bold text-glass uppercase tracking-[0.2em] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
        >
          Biblioteca Geral
        </button>
      </div>

      {project.githubRepo && (
        <a
          href={project.githubRepo.startsWith('http') ? project.githubRepo : `https://github.com/${project.githubRepo}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 p-2 text-[9px] font-bold uppercase tracking-widest text-glass-muted hover:text-glass-accent transition-all active:scale-95 border border-transparent hover:border-glass-border"
        >
          Visualizar Repo Master
        </a>
      )}
    </div>
  );
};

export default ProjectDashboard;
