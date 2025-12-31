
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { db } from '../services/dbService';
import { Project } from '../types';

const GitHubPanel = lazy(() => import('./GitHubPanel'));

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
    <div className="p-8 text-center text-[10px] font-black uppercase text-slate-500 animate-pulse">
      Sincronizando...
    </div>
  );

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto custom-scrollbar animate-fade-in bg-transparent transition-all duration-300">
      {/* Redesigned Active Project Card with proper hierarchy and aesthetics */}
      <div className="mb-6 sm:mb-8 p-5 sm:p-7 bg-emerald-500/10 dark:bg-emerald-500/5 border-4 border-emerald-500 shadow-[10px_10px_0_rgba(16,185,129,0.15)] relative overflow-hidden group">
        {/* Background Visual Element */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none translate-x-12 -translate-y-12">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-[spin_40s_linear_infinite]">
            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-emerald-600" />
            <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 2" className="text-emerald-600" />
          </svg>
        </div>

        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1 min-w-0 pr-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em] glow-text-green">Protocolo Ativo</span>
            </div>

            {/* Prominent Title - Largest and most focused element */}
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-[0.9] mb-3 group-hover:text-emerald-600 transition-colors cursor-pointer truncate"
              onClick={() => onEditProject(projectId)}
            >
              {project.name}
            </h2>

            {/* Description Subtitle */}
            <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-400 font-bold leading-tight italic line-clamp-2 max-w-[90%]">
              {project.description || 'Nenhuma diretriz definida para este protocolo.'}
            </p>

            {/* Visual Metadata Footer */}
            <div className="mt-5 flex items-center gap-3">
               <div className="flex items-center gap-1">
                 <div className="w-1.5 h-3 bg-emerald-500"></div>
                 <div className="w-1.5 h-3 bg-emerald-500/60"></div>
                 <div className="w-1.5 h-3 bg-emerald-500/30"></div>
               </div>
               <span className="text-[8px] font-mono font-black text-slate-400 uppercase tracking-widest">CORE REF: {project.id.split('-')[0]}</span>
            </div>
          </div>

          {/* Edit Button Aligned to the Right */}
          <button 
            onClick={() => onEditProject(projectId)}
            className="p-3.5 bg-white dark:bg-slate-900 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer active:scale-90 shadow-[5px_5px_0_rgba(16,185,129,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 shrink-0"
            aria-label="Editar Protocolo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>

      {/* GitHub Integration Section */}
      {project.githubRepo && (
        <div className="mb-6 sm:mb-8">
          <h4 className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 border-b border-slate-500/10 pb-2 flex items-center gap-2">
            Integração GitHub
          </h4>
          <Suspense fallback={<div className="h-32 border-2 border-dashed border-emerald-600/10 animate-pulse"></div>}>
            <GitHubPanel repoPath={project.githubRepo} />
          </Suspense>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-3 sm:p-4 bg-white/40 dark:bg-slate-900/20 border-2 border-emerald-600/10 flex flex-col items-start hover:border-emerald-600/40 transition-all shadow-[4px_4px_0_rgba(0,0,0,0.02)]">
          <span className="text-[18px] sm:text-[20px] font-black text-emerald-600 leading-none">{stats.conversations}</span>
          <span className="text-[7px] sm:text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">Sessões</span>
        </div>
        <div className="p-3 sm:p-4 bg-white/40 dark:bg-slate-900/20 border-2 border-emerald-600/10 flex flex-col items-start hover:border-emerald-600/40 transition-all shadow-[4px_4px_0_rgba(0,0,0,0.02)]">
          <span className="text-[18px] sm:text-[20px] font-black text-emerald-600 leading-none">{stats.library}</span>
          <span className="text-[7px] sm:text-[8px] font-black uppercase text-slate-500 tracking-widest mt-1">Prompt base</span>
        </div>
      </div>

      {/* Atalhos Rápidos */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 border-b border-slate-500/10 pb-2">Atalhos de Sistema</h4>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={onRefreshHistory}
            className="flex items-center justify-center gap-2 py-3 px-2 bg-white/50 dark:bg-slate-800/40 border border-emerald-600/10 hover:border-emerald-600/40 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-emerald-500/80 transition-all brutalist-button active:scale-95"
          >
            Sessões
          </button>
          <button 
            onClick={onOpenLibrary}
            className="flex items-center justify-center gap-2 py-3 px-2 bg-white/50 dark:bg-slate-800/40 border border-emerald-600/10 hover:border-emerald-600/40 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-600 dark:text-emerald-500/80 transition-all brutalist-button active:scale-95"
          >
            Biblioteca
          </button>
        </div>
      </div>

      {/* Ações do Core */}
      <div className="space-y-3 sm:space-y-4">
        <button 
          onClick={onNewConversation}
          className="w-full brutalist-button py-4 sm:py-5 bg-emerald-600 text-white font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer shadow-[6px_6px_0_rgba(16,185,129,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          Novo Protocolo
        </button>
        <button 
          onClick={onOpenLibrary}
          className="w-full brutalist-button py-4 sm:py-5 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 border-emerald-600/30 hover:bg-emerald-500/5 active:scale-95 transition-all cursor-pointer"
        >
          Biblioteca Geral
        </button>
      </div>

      {project.githubRepo && (
        <a 
          href={project.githubRepo.startsWith('http') ? project.githubRepo : `https://github.com/${project.githubRepo}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-8 flex items-center justify-center gap-2 p-3 border-2 border-emerald-600/20 text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest hover:bg-emerald-500/5 transition-all active:scale-95"
        >
          Visualizar Repositório Master
        </a>
      )}
    </div>
  );
};

export default ProjectDashboard;
