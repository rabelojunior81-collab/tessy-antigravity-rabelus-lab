/**
 * ProjectDocModal - Sprint 1.3 Part B
 * 
 * UI for generating project-level documentation (README, CHANGELOG, API docs)
 * from code analysis and customizable templates.
 */

import React, { useState, useEffect } from 'react';
import { X, FileText, Settings2, Download, RotateCcw, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { projectDocService } from '../../services/projectDocService';
import { db } from '../../services/dbService';
import type { Project } from '../../types';

interface ProjectDocModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type DocType = 'readme' | 'changelog' | 'api';

interface GenerationStatus {
    type: DocType;
    status: 'idle' | 'generating' | 'success' | 'error';
    content?: string;
    error?: string;
}

export const ProjectDocModal: React.FC<ProjectDocModalProps> = ({ isOpen, onClose }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [readmeStyle, setReadmeStyle] = useState<'minimal' | 'standard' | 'detailed'>('standard');
    const [isClosing, setIsClosing] = useState(false);

    const [statuses, setStatuses] = useState<Record<DocType, GenerationStatus>>({
        readme: { type: 'readme', status: 'idle' },
        changelog: { type: 'changelog', status: 'idle' },
        api: { type: 'api', status: 'idle' },
    });

    useEffect(() => {
        if (isOpen) {
            loadProjects();
        }
    }, [isOpen]);

    const loadProjects = async () => {
        const allProjects = await db.projects.toArray();
        setProjects(allProjects);
        if (allProjects.length > 0 && !selectedProject) {
            setSelectedProject(allProjects[0].id);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 150);
    };

    const generateDoc = async (type: DocType) => {
        if (!selectedProject) return;

        setStatuses(prev => ({
            ...prev,
            [type]: { type, status: 'generating' }
        }));

        try {
            let content = '';
            switch (type) {
                case 'readme':
                    content = await projectDocService.generateReadme(selectedProject, readmeStyle);
                    break;
                case 'changelog':
                    content = await projectDocService.generateChangelog(selectedProject);
                    break;
                case 'api':
                    content = await projectDocService.generateApiDocs(selectedProject);
                    break;
            }

            setStatuses(prev => ({
                ...prev,
                [type]: { type, status: 'success', content }
            }));
        } catch (error) {
            setStatuses(prev => ({
                ...prev,
                [type]: { type, status: 'error', error: (error as Error).message }
            }));
        }
    };

    const saveDoc = async (type: DocType) => {
        if (!selectedProject) return;
        const status = statuses[type];
        if (!status.content) return;

        try {
            await projectDocService.saveDocumentation(selectedProject, type, status.content);
        } catch (error) {
            console.error('Error saving documentation:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-sm glass-modal flex flex-col ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Compact */}
                <div className="px-3 py-2 glass-header flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Settings2 className="text-glass-accent" size={12} />
                        <h2 className="text-[10px] font-bold tracking-widest text-glass uppercase">Gerador de Docs</h2>
                    </div>
                    <button onClick={handleClose} className="p-0.5 text-glass-muted hover:text-glass transition-all">
                        <X size={12} />
                    </button>
                </div>

                {/* Content - Compact spacing */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-3 max-h-[60vh]">

                    {/* Project Selection */}
                    <div className="space-y-1">
                        <label className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">Projeto Alvo</label>
                        <div className="relative">
                            <select
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                className="w-full glass-input py-1.5 px-2 text-[10px] font-medium uppercase appearance-none cursor-pointer text-glass hover:bg-white/5 transition-colors focus:border-glass-accent focus:outline-none"
                            >
                                {projects.map(p => (
                                    <option key={p.id} value={p.id} className="bg-bg-primary">{p.name.toUpperCase()}</option>
                                ))}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown size={10} className="text-glass-muted" />
                            </div>
                        </div>
                    </div>

                    {/* README Style */}
                    <div className="space-y-1">
                        <label className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">Estilo do README</label>
                        <div className="flex gap-1">
                            {(['minimal', 'standard', 'detailed'] as const).map(style => (
                                <button
                                    key={style}
                                    onClick={() => setReadmeStyle(style)}
                                    className={`flex-1 py-1 text-[9px] font-medium uppercase tracking-wide transition-all border ${readmeStyle === style
                                            ? 'bg-glass-accent/10 border-glass-accent text-glass-accent'
                                            : 'bg-white/5 border-transparent text-glass-muted hover:text-glass hover:bg-white/10'
                                        }`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-glass/10 my-1" />

                    {/* Generation Actions */}
                    <div className="space-y-2">
                        {[
                            { id: 'readme', label: 'README.md', icon: FileText },
                            { id: 'changelog', label: 'CHANGELOG.md', icon: RotateCcw },
                            { id: 'api', label: 'API Docs', icon: Settings2 }
                        ].map((item) => {
                            const status = statuses[item.id as DocType];
                            return (
                                <div key={item.id} className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <item.icon size={12} className="text-glass-muted" />
                                            <span className="text-[10px] font-bold text-glass uppercase tracking-wider">{item.label}</span>
                                        </div>

                                        {/* Status Indicator */}
                                        {status.status === 'generating' && <Loader2 size={10} className="text-glass-accent animate-spin" />}
                                        {status.status === 'success' && <CheckCircle2 size={10} className="text-green-400" />}
                                        {status.status === 'error' && <AlertCircle size={10} className="text-red-400" />}
                                    </div>

                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => generateDoc(item.id as DocType)}
                                            disabled={status.status === 'generating'}
                                            className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-[9px] font-bold text-glass uppercase tracking-widest transition-all disabled:opacity-50"
                                        >
                                            {status.status === 'generating' ? 'Gerando...' : 'Gerar'}
                                        </button>
                                        {status.status === 'success' && (
                                            <button
                                                onClick={() => saveDoc(item.id as DocType)}
                                                className="px-3 py-1.5 bg-glass-accent hover:brightness-110 text-white transition-all"
                                                title="Salvar Arquivo"
                                            >
                                                <Download size={10} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Error Message */}
                                    {status.status === 'error' && (
                                        <p className="text-[8px] text-red-400 px-1">{status.error}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer - Compact */}
                <div className="px-3 py-2 glass-header flex items-center justify-between shrink-0">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-glass-muted opacity-50">Sprint 1.3 // Rabelus Lab</span>
                </div>
            </div>
        </div>
    );
};
