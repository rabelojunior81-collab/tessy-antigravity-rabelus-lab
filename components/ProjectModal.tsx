import React, { useState, useEffect } from 'react';
import { db, generateUUID } from '../services/dbService';
import { Project } from '../types';
import { X, FolderOpen, GitBranch, Loader2 } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string | null;
  onSuccess: (projectId: string) => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, projectId, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isClosing, setIsClosing] = useState(false);

  const {
    currentWorkspace,
    isSupported,
    isLoading: workspaceLoading,
    selectDirectory,
    loadWorkspace
  } = useWorkspace();

  useEffect(() => {
    if (isOpen && projectId) {
      db.projects.get(projectId).then(project => {
        if (project) {
          setName(project.name);
          setDescription(project.description || '');
          setGithubRepo(project.githubRepo || '');
          setColor(project.color || '#3B82F6');
        }
      });
      // Load workspace for this project
      loadWorkspace(projectId);
    } else if (isOpen) {
      setName(''); setDescription(''); setGithubRepo(''); setColor('#3B82F6');
    }
    setIsClosing(false);
  }, [isOpen, projectId, loadWorkspace]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = projectId || generateUUID();
    const now = Date.now();
    const projectData: Project = { id, name: name.trim(), description: description.trim(), githubRepo: githubRepo.trim(), color, createdAt: projectId ? (await db.projects.get(projectId))?.createdAt || now : now, updatedAt: now };
    await db.projects.put(projectData);
    onSuccess(id);
    handleClose();
  };

  const handleSelectDirectory = async () => {
    if (!projectId) {
      // Create project first, then select directory
      const id = generateUUID();
      const now = Date.now();
      const projectData: Project = { id, name: name.trim() || 'Novo Projeto', description: '', githubRepo: '', color: '#3B82F6', createdAt: now, updatedAt: now };
      await db.projects.put(projectData);
      await selectDirectory(id);
      onSuccess(id);
    } else {
      await selectDirectory(projectId);
    }
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
      <div className={`w-full max-w-xs glass-modal bg-[#0a0a0f]/95 flex flex-col ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        {/* Standard Glass Header */}
        <div className="px-3 py-2 glass-header border-b border-glass-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <div className="w-1.5 h-1.5 bg-glass-muted/40" />
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-glass opacity-90">{projectId ? 'Editar Protocolo' : 'Novo Protocolo'}</h2>
          </div>
          <button onClick={handleClose} className="p-0.5 text-glass-muted hover:text-glass transition-all active:scale-95"><X size={14} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-glass-muted uppercase tracking-widest">Identificação</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="NOME..."
              className="w-full glass-input p-2 text-[10px] font-bold text-glass focus:border-glass-accent outline-none uppercase placeholder:text-glass-muted/30"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-glass-muted uppercase tracking-widest">Diretriz</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="OBJETIVO..."
              className="w-full h-16 glass-input p-2 text-[10px] font-medium text-glass-secondary outline-none focus:border-glass-accent resize-none custom-scrollbar placeholder:text-glass-muted/30"
            />
          </div>

          {/* Workspace Section */}
          {isSupported && (
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-glass-muted uppercase tracking-widest flex items-center gap-1">
                <FolderOpen size={10} />
                Workspace Local
              </label>
              <div className="glass-input p-2 flex items-center justify-between">
                {currentWorkspace ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${currentWorkspace.status === 'connected' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                    <span className="text-[9px] font-mono text-glass truncate">{currentWorkspace.localPath}</span>
                    {currentWorkspace.githubCloneUrl && (
                      <GitBranch size={10} className="text-glass-accent shrink-0" />
                    )}
                  </div>
                ) : (
                  <span className="text-[9px] text-glass-muted">Nenhum diretório vinculado</span>
                )}
                <button
                  type="button"
                  onClick={handleSelectDirectory}
                  disabled={workspaceLoading}
                  className="ml-2 px-2 py-1 text-[8px] font-bold uppercase tracking-wider bg-glass-accent/20 hover:bg-glass-accent/30 text-glass-accent transition-all"
                >
                  {workspaceLoading ? <Loader2 size={10} className="animate-spin" /> : 'Vincular'}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-glass-muted uppercase tracking-widest">GitHub</label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="USR/REPO"
                className="w-full glass-input p-2 text-[9px] font-mono text-glass focus:border-glass-accent outline-none uppercase placeholder:text-glass-muted/30"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-glass-muted uppercase tracking-widest">Cor</label>
              <div className="flex items-center gap-2 glass-input px-1 py-1 h-[34px] focus-within:border-glass-accent">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-full bg-transparent cursor-pointer border-none p-0 opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 glass-button text-glass-muted font-bold uppercase tracking-widest text-[9px] hover:text-glass transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2 bg-glass-accent hover:brightness-110 text-white font-bold uppercase tracking-widest text-[9px] transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
