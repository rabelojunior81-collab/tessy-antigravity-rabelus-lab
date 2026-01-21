import React, { useState, useEffect } from 'react';
import { db } from '../../services/dbService';
import { Project } from '../../types';
import { X, Layout, Database, Github, Activity, FileText, Play, Library } from 'lucide-react';
import { projectDocService } from '../../services/projectDocService';

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDocMenu, setShowDocMenu] = useState(false);

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

  const handleGenerateDoc = async (type: 'readme' | 'changelog') => {
    setIsGenerating(true);
    setShowDocMenu(false);
    try {
      const content = type === 'readme'
        ? await projectDocService.generateReadme(projectId, 'standard')
        : await projectDocService.generateChangelog(projectId);
      await projectDocService.saveDocumentation(projectId, type, content);
      alert(`${type.toUpperCase()} gerado com sucesso!`);
      await loadData();
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar docs.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!project) return null;

  return (
    <div className="h-full flex flex-col glass-panel animate-fade-in relative overflow-hidden group">
      {/* Standard Header - Matching CoPilot/Sidebar */}
      <div className="flex items-center justify-between px-2 py-0.5 glass-header shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-glass-muted/40"></div>
          <h2 className="text-[9px] uppercase font-bold text-glass tracking-widest opacity-80">Detalhes do Projeto</h2>
        </div>
        <button
          onClick={onClose}
          className="p-0.5 text-glass-muted hover:text-glass-accent transition-all active:scale-95"
          title="Fechar"
        >
          <X size={12} />
        </button>
      </div>

      {/* Content - Top Aligned (No justify-center) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <div className="flex flex-col items-center justify-start text-center space-y-3">

          {/* Central Identity */}
          <div className="flex flex-col items-center mt-1">
            <div className="mb-3 relative">
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-glass-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-glass-accent"></span>
              </span>
              <div className="w-12 h-12 flex items-center justify-center bg-glass-accent/10 border border-glass-accent/30 text-glass-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]">
                <Activity size={24} />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-glass tracking-tight mb-1">{project.name}</h1>
            <p className="text-[10px] text-glass-muted/60 uppercase tracking-widest font-mono">REF: {project.id.substring(0, 8)}</p>
          </div>

          {/* Dense Stats Row */}
          <div className="flex items-center gap-4 text-[10px] text-glass-secondary font-mono border-t border-b border-glass-border/30 py-2 px-6 bg-black/10">
            <div className="flex items-center gap-1.5" title="Sessões">
              <Layout size={10} className="text-glass-accent" />
              <span className="font-bold">{stats.conversations}</span>
            </div>
            <div className="w-px h-3 bg-glass-border/30"></div>
            <div className="flex items-center gap-1.5" title="Biblioteca">
              <Database size={10} className="text-glass-accent" />
              <span className="font-bold">{stats.library}</span>
            </div>
            {project.githubRepo && (
              <>
                <div className="w-px h-3 bg-glass-border/30"></div>
                <a href={project.githubRepo.startsWith('http') ? project.githubRepo : `https://github.com/${project.githubRepo}`}
                  target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-glass-accent transition-colors truncate max-w-[120px]">
                  <Github size={10} />
                  <span className="truncate">{project.githubRepo.split('/').pop()}</span>
                </a>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-glass-muted max-w-sm line-clamp-4 leading-relaxed">
            {project.description || 'Nenhuma diretriz definida.'}
          </p>

          {/* Compact Action Toolbar */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onNewConversation}
              className="flex items-center gap-2 px-3 py-1.5 bg-glass-accent hover:brightness-110 text-white text-[10px] font-bold uppercase tracking-widest shadow-sm rounded-sm transition-all hover:scale-105 active:scale-95"
            >
              <Play size={10} fill="currentColor" />
              Iniciar
            </button>

            <button
              onClick={onOpenLibrary}
              className="flex items-center gap-2 px-3 py-1.5 glass-button hover:bg-white/5 text-glass text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all hover:scale-105 active:scale-95"
            >
              <Library size={10} />
              Lib
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDocMenu(!showDocMenu)}
                disabled={isGenerating}
                className="flex items-center justify-center w-7 h-7 glass-button hover:bg-white/5 text-glass-muted hover:text-glass rounded-sm transition-all active:scale-90"
                title="Gerar Docs"
              >
                <FileText size={12} className={isGenerating ? 'animate-pulse text-glass-accent' : ''} />
              </button>
              {showDocMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-24 glass-card border border-glass-border shadow-xl z-50 py-1">
                  <button onClick={() => handleGenerateDoc('readme')} className="w-full px-2 py-1 text-[8px] font-bold uppercase text-glass hover:bg-white/10 text-left">README</button>
                  <button onClick={() => handleGenerateDoc('changelog')} className="w-full px-2 py-1 text-[8px] font-bold uppercase text-glass hover:bg-white/10 text-left">CHANGELOG</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsViewer;
