
import React, { useState, useEffect } from 'react';
import { db } from '../../services/dbService';
import { Project } from '../../types';
import { X, Folder, Layout, Database, Github, ChevronRight, Activity } from 'lucide-react';

interface ProjectDetailsViewerProps {
  projectId: string;
  onClose: () => void;
  onNewConversation: () => void;
  onOpenLibrary: () => void;
}

const ProjectDetailsViewer: React.FC<ProjectDetailsViewerProps> = ({ 
  projectId, 
  onClose,
  onNewConversation,
  onOpenLibrary
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState({ conversations: 0, library: 0 });

  const loadData = async () => {
    const p = await db.projects.get(projectId);
    if (p) {
      setProject(p);
      const convCount = await db.conversations.where('projectId').equals(projectId).count();
      const libCount = await db.library.where('projectId').equals(projectId).count();
      setStats({ conversations: convCount, library: libCount });
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  if (!project) return null;

  return (
    <div className="h-full flex flex-col bg-bg-secondary animate-fade-in overflow-hidden">
      {/* Header - Compact py-2, icon 16 */}
      <div className="px-4 py-2 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Folder size={16} className="text-accent-primary" />
          <h2 className="text-xs font-medium tracking-normal text-text-primary">Detalhes do Protocolo</h2>
        </div>
        <button onClick={onClose} className="p-1 text-text-tertiary hover:text-text-primary transition-all active:scale-90">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        {/* Active Project Card */}
        <div className="mb-10 p-8 bg-bg-tertiary/80 border border-border-visible relative overflow-hidden group shadow-md">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
                </span>
                <span className="text-xs font-medium text-accent-primary uppercase tracking-wide glow-text-blue">Protocolo Ativo</span>
              </div>

              <h1 className="text-3xl font-medium text-text-primary tracking-normal mb-4 truncate">
                {project.name}
              </h1>

              <p className="text-base text-text-secondary leading-relaxed font-normal mb-6">
                {project.description || 'Nenhuma diretriz definida para este protocolo.'}
              </p>

              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1">
                   <div className="w-1.5 h-3 bg-accent-primary"></div>
                   <div className="w-1.5 h-3 bg-accent-primary/60"></div>
                   <div className="w-1.5 h-3 bg-accent-primary/30"></div>
                 </div>
                 <span className="text-xs font-mono font-normal text-text-tertiary uppercase tracking-wide">REF: {project.id.substring(0, 8)}</span>
              </div>
            </div>

            <div className="w-12 h-12 flex items-center justify-center bg-accent-subtle/30 border border-accent-primary/20 text-accent-primary shrink-0">
              <Activity size={24} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-6 bg-bg-tertiary/80 border border-border-visible flex flex-col items-start shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Layout size={14} className="text-accent-primary/60" />
              <span className="text-xs font-medium uppercase text-text-tertiary tracking-wide">Sessões</span>
            </div>
            <span className="text-4xl font-normal text-text-primary">{stats.conversations}</span>
          </div>
          <div className="p-6 bg-bg-tertiary/80 border border-border-visible flex flex-col items-start shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Database size={14} className="text-accent-primary/60" />
              <span className="text-xs font-medium uppercase text-text-tertiary tracking-wide">Biblioteca</span>
            </div>
            <span className="text-4xl font-normal text-text-primary">{stats.library}</span>
          </div>
        </div>

        {/* GitHub Integration */}
        {project.githubRepo && (
          <div className="mb-10">
            <h4 className="text-xs font-medium text-text-tertiary uppercase tracking-wide mb-4 border-b border-border-visible pb-2 flex items-center gap-2">
              Integração GitHub
            </h4>
            <a 
              href={project.githubRepo.startsWith('http') ? project.githubRepo : `https://github.com/${project.githubRepo}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-bg-tertiary/80 border border-border-visible hover:border-accent-primary/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Github size={18} className="text-text-secondary group-hover:text-accent-primary transition-colors" />
                <span className="text-sm font-mono text-text-secondary group-hover:text-text-primary font-normal">{project.githubRepo}</span>
              </div>
              <ChevronRight size={16} className="text-text-tertiary" />
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4 pt-4 border-t border-border-visible">
          <button 
            onClick={onNewConversation}
            className="w-full py-4 bg-accent-primary hover:bg-accent-secondary text-white font-medium text-sm tracking-normal transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            Iniciar Nova Sessão
          </button>
          <button 
            onClick={onOpenLibrary}
            className="w-full py-4 bg-bg-tertiary border border-border-visible text-text-primary hover:bg-bg-elevated font-medium text-sm tracking-normal transition-all flex items-center justify-center gap-3"
          >
            Acessar Biblioteca
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsViewer;
