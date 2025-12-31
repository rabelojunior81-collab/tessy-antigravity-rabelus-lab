
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/dbService';
import { Project } from '../types';

interface ProjectSwitcherProps {
  currentProjectId: string;
  onSwitch: (id: string) => void;
  onOpenModal: () => void;
  onEditProject: (id: string) => void;
}

const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({ currentProjectId, onSwitch, onOpenModal, onEditProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadProjects = async () => {
      const all = await db.projects.toArray();
      const sorted = all.sort((a, b) => b.updatedAt - a.updatedAt);
      setProjects(sorted);
      
      const current = sorted.find(p => p.id === currentProjectId);
      setCurrentProject(current || null);
    };
    loadProjects();
    const interval = setInterval(loadProjects, 5000);
    return () => clearInterval(interval);
  }, [currentProjectId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onEditProject(id);
    setIsOpen(false);
  };

  const handleCreate = () => {
    onOpenModal();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 sm:px-5 sm:py-2.5 bg-white/90 dark:bg-slate-900/80 border-2 lg:border border-emerald-600/40 hover:border-emerald-600 transition-all duration-300 shadow-[4px_4px_0_rgba(16,185,129,0.2)] lg:shadow-[6px_6px_0_rgba(16,185,129,0.25)] hover:lg:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer group"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft hidden xs:block"></div>
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-0.5 hidden sm:block">Protocolo</span>
          <span className="text-[10px] sm:text-sm font-black uppercase text-slate-800 dark:text-white tracking-tighter max-w-[80px] sm:max-w-[180px] truncate leading-none">
            {currentProject?.name || 'Selecionar Projeto'}
          </span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border-4 border-emerald-600 shadow-2xl lg:shadow-[12px_12px_0_rgba(0,0,0,0.6)] z-50 animate-fade-in transition-all">
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {projects.length === 0 ? (
              <div className="p-6 text-center text-[9px] font-black uppercase text-slate-400 italic">Nenhum protocolo ativo</div>
            ) : (
              projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => { onSwitch(project.id); setIsOpen(false); }}
                  className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-colors border-b border-emerald-600/10 group ${
                    project.id === currentProjectId ? 'bg-emerald-600/15' : 'hover:bg-emerald-600/5'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden flex-1">
                    <div className="w-3 h-3 rounded-full shrink-0 shadow-inner border border-black/10 dark:border-white/10" style={{ backgroundColor: project.color || '#10b981', boxShadow: project.id === currentProjectId ? `0 0 10px ${project.color || '#10b981'}` : 'none' }} />
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[11px] font-black uppercase tracking-tight truncate transition-colors ${
                        project.id === currentProjectId ? 'text-emerald-600 glow-text-green' : 'text-slate-700 dark:text-slate-300'
                      }`}>
                        {project.name}
                      </span>
                      {project.description && (
                        <span className="text-[8px] font-bold text-slate-400 uppercase truncate italic">{project.description}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleEdit(e, project.id)}
                    className="p-2 ml-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-500/10 transition-all cursor-pointer active:scale-90 shrink-0 z-10 border-2 border-transparent hover:border-emerald-500/20"
                    title="Editar Protocolo"
                    aria-label="Editar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
          <button
            onClick={handleCreate}
            className="w-full py-5 px-5 flex items-center justify-center gap-3 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-700 transition-all border-t-4 border-black dark:border-white cursor-pointer active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Criar Novo Protocolo
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectSwitcher;
