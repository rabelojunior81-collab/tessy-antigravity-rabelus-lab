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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-card max-w-3xl w-full p-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b glass-shell flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-primary/20 rounded-lg text-accent-primary">
                            <Database size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-glass">Auto-Documentation Engine</h2>
                            <p className="text-xs text-glass-muted">Sincronize conhecimento do ecossistema</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-glass-overlay rounded-full transition-colors">
                        <X size={20} className="text-glass-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-glass">
                            Fontes Monitoradas ({targets.filter(t => t.autoSync).length} auto-sync)
                        </span>
                        <button
                            onClick={syncAll}
                            disabled={isSyncingAll || isLoading}
                            className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-md text-xs font-semibold transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={isSyncingAll ? 'animate-spin' : ''} />
                            Sincronizar Tudo
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8 text-glass-muted">
                            <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                            <p className="text-xs">Carregando targets...</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {targets.map((target) => (
                                <div
                                    key={target.id}
                                    className="p-4 rounded-xl border border-glass-border hover:border-glass-accent/30 transition-all bg-glass-overlay/20"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`p-2 rounded-lg shrink-0 ${target.status === 'success' ? 'bg-green-500/20 text-green-400' :
                                                target.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                                    target.status === 'syncing' ? 'bg-accent-primary/20 text-accent-primary' :
                                                        'bg-glass-muted/20 text-glass-muted'
                                                }`}>
                                                <ShieldCheck size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-glass">{target.name}</h3>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <a
                                                        href={target.url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[10px] text-accent-primary flex items-center gap-1 hover:underline truncate max-w-xs"
                                                    >
                                                        {target.url.substring(0, 50)}... <ExternalLink size={10} />
                                                    </a>
                                                    {target.lastSynced && (
                                                        <span className="text-[10px] text-glass-muted">
                                                            | {new Date(target.lastSynced).toLocaleString('pt-BR')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={target.autoSync}
                                                            onChange={() => toggleAutoSync(target.id)}
                                                            className="w-3 h-3 accent-accent-primary"
                                                        />
                                                        <span className="text-[10px] text-glass-muted">Auto-sync on start</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${target.status === 'syncing' ? 'text-accent-primary animate-pulse' :
                                                target.status === 'success' ? 'text-green-400' :
                                                    target.status === 'error' ? 'text-red-400' :
                                                        'text-glass-muted'
                                                }`}>
                                                {target.status}
                                            </span>
                                            <button
                                                onClick={() => handleSync(target.id)}
                                                disabled={target.status === 'syncing'}
                                                className="p-2 hover:bg-glass-overlay rounded-lg text-glass-muted hover:text-glass-accent transition-colors disabled:opacity-50"
                                                title="Sync now"
                                            >
                                                <RefreshCw size={16} className={target.status === 'syncing' ? 'animate-spin' : ''} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-glass-overlay/30 border-t border-glass-border">
                    <p className="text-[10px] text-glass-muted uppercase tracking-widest font-medium text-center">
                        Powering Tessy Antigravity Intelligence Core
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AutoDocModal;
