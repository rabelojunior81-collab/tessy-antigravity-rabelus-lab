import React, { useState, useEffect } from 'react';
import { db, generateUUID } from '../services/dbService';
import { Project } from '../types';
import { X } from 'lucide-react';

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
    } else if (isOpen) {
      setName(''); setDescription(''); setGithubRepo(''); setColor('#3B82F6');
    }
    setIsClosing(false);
  }, [isOpen, projectId]);

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

  return (
    <div className={`fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
      <div className={`w-full max-w-md bg-bg-secondary border border-border-visible flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border-subtle bg-bg-primary flex items-center justify-between">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-text-primary">{projectId ? 'Editar Protocolo' : 'Novo Protocolo'}</h2>
          <button onClick={handleClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Identificação</label>
            <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="NOME..." className="w-full bg-bg-tertiary border border-border-subtle p-3 text-[11px] font-bold text-text-primary focus:border-accent-primary outline-none uppercase" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Diretriz</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="OBJETIVO..." className="w-full h-24 bg-bg-tertiary border border-border-subtle p-3 text-[11px] font-medium text-text-secondary outline-none focus:border-accent-primary resize-none custom-scrollbar" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">GitHub</label>
              <input type="text" value={githubRepo} onChange={(e) => setGithubRepo(e.target.value)} placeholder="USR/REPO" className="w-full bg-bg-tertiary border border-border-subtle p-3 text-[10px] font-mono text-text-primary focus:border-accent-primary outline-none uppercase" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest">Cor</label>
              <div className="flex items-center gap-2 bg-bg-tertiary p-1.5 border border-border-subtle h-[42px]">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-full bg-transparent cursor-pointer border-none p-0" />
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={handleClose} className="flex-1 py-3 bg-bg-tertiary text-text-tertiary font-bold uppercase tracking-widest text-[10px]">Cancelar</button>
            <button type="submit" disabled={!name.trim()} className="flex-1 py-3 bg-accent-primary hover:bg-accent-secondary text-white font-bold uppercase tracking-widest text-[10px]">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;