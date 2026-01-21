import React, { useState } from 'react';
import { X, RefreshCw, ExternalLink, ShieldCheck, Database } from 'lucide-react';
import { autoDocService, DocTarget } from '../../services/autoDocService';

interface AutoDocModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AutoDocModal: React.FC<AutoDocModalProps> = ({ isOpen, onClose }) => {
    const [targets, setTargets] = useState<DocTarget[]>(autoDocService.getTargets());
    const [isSyncingAll, setIsSyncingAll] = useState(false);

    if (!isOpen) return null;

    const handleSync = async (name: string) => {
        // Atualiza status localmente para demonstração
        setTargets(prev => prev.map(t => t.name === name ? { ...t, status: 'syncing' } : t));

        const success = await autoDocService.syncTarget(name);

        setTargets(prev => prev.map(t => t.name === name ? {
            ...t,
            status: success ? 'success' : 'error',
            lastUpdated: new Date().toLocaleTimeString()
        } : t));
    };

    const syncAll = async () => {
        setIsSyncingAll(true);
        for (const target of targets) {
            await handleSync(target.name);
        }
        setIsSyncingAll(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-card max-w-2xl w-full p-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b glass-shell flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-primary/20 rounded-lg text-accent-primary">
                            <Database size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-glass">Auto-Documentation Engine</h2>
                            <p className="text-xs text-glass-muted">Sincronize o conhecimento do ecossistema Rabelus Lab</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-glass-overlay rounded-full transition-colors">
                        <X size={20} className="text-glass-muted" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-glass">Fontes Monitoradas</span>
                        <button
                            onClick={syncAll}
                            disabled={isSyncingAll}
                            className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-md text-xs font-semibold transition-all"
                        >
                            <RefreshCw size={14} className={isSyncingAll ? 'animate-spin' : ''} />
                            Sincronizar Tudo
                        </button>
                    </div>

                    <div className="grid gap-3">
                        {targets.map((target) => (
                            <div key={target.name} className="p-4 rounded-xl border border-glass-border hover:border-glass-accent/30 transition-all bg-glass-overlay/20 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${target.status === 'success' ? 'bg-green-500/20 text-green-400' :
                                            target.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                                'bg-glass-muted/20 text-glass-muted'
                                        }`}>
                                        <ShieldCheck size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-glass">{target.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <a href={target.url} target="_blank" rel="noreferrer" className="text-[10px] text-accent-primary flex items-center gap-1 hover:underline">
                                                {target.url.substring(0, 30)}... <ExternalLink size={10} />
                                            </a>
                                            {target.lastUpdated && (
                                                <span className="text-[10px] text-glass-muted">| Atualizado: {target.lastUpdated}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${target.status === 'syncing' ? 'text-accent-primary animate-pulse' :
                                            target.status === 'success' ? 'text-green-400' :
                                                target.status === 'error' ? 'text-red-400' : 'text-glass-muted'
                                        }`}>
                                        {target.status}
                                    </span>
                                    <button
                                        onClick={() => handleSync(target.name)}
                                        disabled={target.status === 'syncing'}
                                        className="p-2 hover:bg-glass-overlay rounded-lg text-glass-muted hover:text-glass-accent transition-colors"
                                    >
                                        <RefreshCw size={16} className={target.status === 'syncing' ? 'animate-spin' : ''} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-glass-overlay/30 text-center">
                    <p className="text-[10px] text-glass-muted uppercase tracking-widest font-medium">
                        Powering Tessy Antigravity Intelligence Core
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AutoDocModal;
