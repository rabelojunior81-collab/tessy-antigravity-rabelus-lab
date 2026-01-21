import React, { useState, useEffect } from 'react';
import { db } from '../../services/dbService';
import { Project } from '../../types';
import { X, Folder, Layout, Database, Github, ChevronRight, Activity, FileText, ChevronDown } from 'lucide-react';
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
      let content = '';
      if (type === 'readme') {
        content = await projectDocService.generateReadme(projectId, 'standard');
      } else {
        content = await projectDocService.generateChangelog(projectId);
      }

      await projectDocService.saveDocumentation(projectId, type, content);

      // Show success feedback
      alert(`${type === 'readme' ? 'README' : 'CHANGELOG'}.md gerado com sucesso!\nSalvo na biblioteca do projeto.`);

      // Reload stats
      await loadData();
    } catch (error) {
      console.error('Error generating documentation:', error);
      alert('Erro ao gerar documentação');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!project) return null;

  return (
    <div className="h-full flex flex-col glass-panel animate-fade-in overflow-hidden">
      {/* Header - Compact py-0.5, icon 16 */}
      <div className="px-4 py-2 border-b border-glass-border glass-header flex items-center justify-between shrink-0 relative">
        <div className="flex items-center gap-2">
          <Folder size={16} className="text-glass-accent" />
          <h2 className="text-xs font-medium tracking-normal text-glass">Detalhes do Protocolo</h2>
        </div>

        <div className="flex items-center gap-1">
          {/* Documentation Menu Trigger - Compact */}
          <div className="relative">
            <button
              onClick={() => setShowDocMenu(!showDocMenu)}
              disabled={isGenerating}
              className={`p-1 transition-all ${isGenerating ? 'text-accent-primary animate-pulse' : 'text-glass-muted hover:text-glass hover:bg-white/5'} rounded-md`}
              title="Gerar Documentação"
            >
              <FileText size={16} />
            </button>

            {showDocMenu && (
              <div className="absolute top-full right-0 mt-1 w-40 glass-card border border-glass-border shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => handleGenerateDoc('readme')}
                  className="w-full px-3 py-2 text-left text-[10px] font-bold uppercase text-glass hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <FileText size={12} />
                  README.md
                </button>
                <button
                  onClick={() => handleGenerateDoc('changelog')}
                  className="w-full px-3 py-2 text-left text-[10px] font-bold uppercase text-glass hover:bg-white/10 transition-colors flex items-center gap-2 border-t border-glass-border"
                >
                  <Activity size={12} />
                  CHANGELOG.md
                </button>
              </div>
            )}
          </div>

          <button onClick={onClose} className="p-1 text-glass-muted hover:text-glass transition-all active:scale-90">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {/* Active Project Card */}
        <div className="mb-6 p-3 glass-card relative overflow-hidden group shadow-md">
          <div className="flex justify-between items-start relative z-10">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-glass-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-glass-accent"></span>
                </span>
                <span className="text-xs font-medium text-glass-accent uppercase tracking-wide glow-accent">Protocolo Ativo</span>
              </div>

              <h1 className="text-3xl font-medium text-glass tracking-normal mb-4 truncate">
                {project.name}
              </h1>

              <p className="text-base text-glass-secondary leading-relaxed font-normal mb-6">
                {project.description || 'Nenhuma diretriz definida para este protocolo.'}
              </p>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-3 bg-glass-accent"></div>
                  <div className="w-1.5 h-3 bg-glass-accent/60"></div>
                  <div className="w-1.5 h-3 bg-glass-accent/30"></div>
                </div>
                <span className="text-xs font-mono font-normal text-glass-muted uppercase tracking-wide">REF: {project.id.substring(0, 8)}</span>
              </div>
            </div>

            <div className="w-12 h-12 flex items-center justify-center bg-glass-accent/10 border border-glass-accent/30 text-glass-accent shrink-0">
              <Activity size={24} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="p-3 glass-card flex flex-col items-start shadow-sm hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Layout size={14} className="text-glass-accent/60" />
              <span className="text-xs font-medium uppercase text-glass-muted tracking-wide">Sessões</span>
            </div>
            <span className="text-4xl font-normal text-glass">{stats.conversations}</span>
          </div>
          <div className="p-3 glass-card flex flex-col items-start shadow-sm hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <Database size={14} className="text-glass-accent/60" />
              <span className="text-xs font-medium uppercase text-glass-muted tracking-wide">Biblioteca</span>
            </div>
            <span className="text-4xl font-normal text-glass">{stats.library}</span>
          </div>
        </div>

        {/* GitHub Integration */}
        {project.githubRepo && (
          <div className="mb-10">
            <h4 className="text-xs font-medium text-glass-muted uppercase tracking-wide mb-4 border-b border-glass-border pb-2 flex items-center gap-2">
              Integração GitHub
            </h4>
            <a
              href={project.githubRepo.startsWith('http') ? project.githubRepo : `https://github.com/${project.githubRepo}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-3 glass-card hover:border-glass-accent/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Github size={18} className="text-glass-secondary group-hover:text-glass-accent transition-colors" />
                <span className="text-sm font-mono text-glass-secondary group-hover:text-glass font-normal">{project.githubRepo}</span>
              </div>
              <ChevronRight size={16} className="text-glass-muted" />
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-glass-border">
          <button
            onClick={onNewConversation}
            className="w-full py-2.5 bg-glass-accent hover:brightness-110 text-white font-medium text-sm tracking-normal transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            Iniciar Nova Sessão
          </button>
          <button
            onClick={onOpenLibrary}
            className="w-full py-2.5 glass-button text-glass hover:bg-white/10 font-medium text-sm tracking-normal transition-all flex items-center justify-center gap-3"
          >
            Acessar Biblioteca
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsViewer;
