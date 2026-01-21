
import React from 'react';
import { X, Check, Trash2, Github, Clock, ShieldAlert, Loader2 } from 'lucide-react';
import { useGitHub } from '../../contexts/GitHubContext';

const PendingActionsModal: React.FC = () => {
  const { pendingActions, approveAction, rejectAction, isActionsModalOpen, setIsActionsModalOpen, isLoading } = useGitHub();

  if (!isActionsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsActionsModalOpen(false)}>
      <div className="w-full max-w-2xl glass-panel  flex flex-col animate-zoom-in overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header minimalista */}
        {/* Header minimalista */}
        <div className="px-4 py-2 glass-header flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-glass-accent" size={14} />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-glass">Aprovação de Operações Críticas</h2>
          </div>
          <button
            onClick={() => setIsActionsModalOpen(false)}
            className="p-1 text-glass-muted hover:text-glass transition-all"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 min-h-[300px] max-h-[70vh]">
          {pendingActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-20">
              <Github size={48} strokeWidth={1} />
              <p className="mt-4 text-[10px] font-bold uppercase tracking-widest">Nenhuma ação pendente</p>
            </div>
          ) : (
            pendingActions.map((action) => (
              <div key={action.id} className="p-2 glass-card hover:border-glass-accent/40 transition-all flex flex-col gap-2 group">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-accent-subtle/20 text-accent-primary border border-accent-primary/10">
                      <Github size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary uppercase tracking-tight">{action.type}</h4>
                      <div className="flex items-center gap-2 text-[9px] text-text-tertiary opacity-60">
                        <Clock size={10} />
                        <span>{new Date(action.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => rejectAction(action.id)}
                      disabled={isLoading}
                      className="p-1.5 bg-red-900/10 text-red-400 border border-red-900/20 hover:bg-red-900/20 transition-all disabled:opacity-30"
                      title="Rejeitar ação"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      onClick={() => approveAction(action.id)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-glass-accent hover:bg-glass-accent/80 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} strokeWidth={3} />
                      )}
                      Aprovar
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-black/20 border border-glass-border text-[11px] font-mono text-glass-secondary whitespace-pre-wrap leading-relaxed">
                  {action.description}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/5 bg-bg-primary/80 text-[10px] text-text-tertiary flex items-center justify-between">
          <span className="uppercase tracking-widest font-bold opacity-40">Pendências: {pendingActions.length}</span>
          <button
            onClick={() => setIsActionsModalOpen(false)}
            className="text-accent-primary font-bold uppercase tracking-widest hover:underline disabled:opacity-30"
            disabled={isLoading}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingActionsModal;
