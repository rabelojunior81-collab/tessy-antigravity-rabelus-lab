/**
 * AutoDocModal - Tessy Antigravity Core
 * Sprint 1.3: Auto-Documentation Engine
 * 
 * UI for managing documentation sync targets
 */

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ExternalLink, ShieldCheck, Database, Plus, Trash2 } from 'lucide-react';
import { autoDocScheduler, DocTarget } from '../../services/autoDocScheduler';

interface AutoDocModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AutoDocModal: React.FC<AutoDocModalProps> = ({ isOpen, onClose }) => {
    const [targets, setTargets] = useState<DocTarget[]>([]);
    const [isSyncingAll, setIsSyncingAll] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    // Load targets on mount
    useEffect(() => {
        if (isOpen) {
            loadTargets();
        }
    }, [isOpen]);

    // Register sync completion callback
    useEffect(() => {
        const handleSyncComplete = (targetId: string, success: boolean) => {
            // Reload targets to get updated status
            loadTargets();
        };

        autoDocScheduler.onSyncComplete(handleSyncComplete);
    }, []);

    const loadTargets = async () => {
        setIsLoading(true);
        try {
            const loadedTargets = await autoDocScheduler.getTargets();
            setTargets(loadedTargets);
        } catch (err) {
            console.error('Failed to load targets:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async (id: string) => {
        // Update UI optimistically
        setTargets(prev => prev.map(t => t.id === id ? { ...t, status: 'syncing' } : t));

        // Trigger sync with notification
        await autoDocScheduler.syncTarget(id, true);

        // Reload to get final status
        await loadTargets();
    };

    const syncAll = async () => {
        setIsSyncingAll(true);
        for (const target of targets) {
            if (target.autoSync) {
                await handleSync(target.id);
            }
        }
        setIsSyncingAll(false);
    };

    const toggleAutoSync = async (id: string) => {
        const target = targets.find(t => t.id === id);
        if (!target) return;

        // Note: Would need to add updateTarget method to scheduler
        // For now, just update local state
        setTargets(prev => prev.map(t =>
            t.id === id ? { ...t, autoSync: !t.autoSync } : t
        ));
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 150);
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
                        <Database size={12} className="text-glass-accent" />
                        <h2 className="text-[10px] font-bold tracking-widest text-glass uppercase">Auto-Doc Engine</h2>
                    </div>
                    <button onClick={handleClose} className="p-0.5 text-glass-muted hover:text-glass transition-all">
                        <X size={12} />
                    </button>
                </div>

                {/* Content - Compact spacing */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-3 max-h-[60vh]">
                    <div className="flex items-center justify-between border-b border-glass/10 pb-1">
                        <span className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">
                            Fontes ({targets.filter(t => t.autoSync).length})
                        </span>
                        <button
                            onClick={syncAll}
                            disabled={isSyncingAll || isLoading}
                            className="flex items-center gap-1.5 px-2 py-1 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-sm text-[8px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={8} className={isSyncingAll ? 'animate-spin' : ''} />
                            Sync All
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-4 text-glass-muted">
                            <RefreshCw size={16} className="animate-spin mx-auto mb-1" />
                            <p className="text-[8px] uppercase tracking-widest">Carregando...</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {targets.map((target) => (
                                <div
                                    key={target.id}
                                    className="space-y-1 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className={`shrink-0 ${target.status === 'success' ? 'text-green-400' :
                                                target.status === 'error' ? 'text-red-400' :
                                                    target.status === 'syncing' ? 'text-accent-primary animate-pulse' :
                                                        'text-glass-muted'
                                                }`}>
                                                <ShieldCheck size={12} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-[10px] font-bold text-glass uppercase tracking-wider truncate">{target.name}</h3>
                                                    <a
                                                        href={target.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-glass-muted hover:text-accent-primary transition-colors"
                                                    >
                                                        <ExternalLink size={8} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handleSync(target.id)}
                                                disabled={target.status === 'syncing'}
                                                className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 transition-all ${target.status === 'syncing' ? 'text-accent-primary' :
                                                        'text-glass-muted hover:text-glass hover:bg-white/5'
                                                    }`}
                                            >
                                                {target.status === 'syncing' ? 'Sync...' : 'Sync'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pl-5">
                                        <label className="flex items-center gap-1.5 cursor-pointer group/check">
                                            <div className={`w-2 h-2 border border-glass-muted/50 transition-all ${target.autoSync ? 'bg-accent-primary border-accent-primary' : 'group-hover/check:border-glass-muted'}`}>
                                                {target.autoSync && <div className="w-full h-full bg-accent-primary" />}
                                            </div>
                                            <span className="text-[8px] text-glass-muted uppercase tracking-widest opacity-60 group-hover/check:opacity-100 transition-opacity">Auto-Sync</span>
                                            <input
                                                type="checkbox"
                                                checked={target.autoSync}
                                                onChange={() => toggleAutoSync(target.id)}
                                                className="hidden"
                                            />
                                        </label>

                                        {target.lastSynced && (
                                            <span className="text-[8px] text-glass-muted opacity-40 font-mono">
                                                {new Date(target.lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="h-px bg-white/5 w-full mt-1" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Compact */}
                <div className="px-3 py-2 glass-header flex items-center justify-between shrink-0">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-glass-muted opacity-50">Rabelus Lab // Ecosystem</span>
                </div>
            </div>
        </div>
    );
};

export default AutoDocModal;
