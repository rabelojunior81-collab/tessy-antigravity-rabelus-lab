import React, { useCallback, useState } from 'react';
import { useLayout } from '../../hooks/useLayout';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import MonacoWrapper from '../editor/MonacoWrapper';
import { X, Copy, Check, Save, Loader2 } from 'lucide-react';
import ProjectDetailsViewer from '../viewers/ProjectDetailsViewer';
import LibraryDetailsViewer from '../viewers/LibraryDetailsViewer';
import { useChat } from '../../contexts/ChatContext';
import { useViewer } from '../../hooks/useViewer';
import { Template, RepositoryItem } from '../../types';

interface CentralCanvasProps {
  currentProjectId: string;
}

const CentralCanvas: React.FC<CentralCanvasProps> = ({
  currentProjectId
}) => {
  const {
    arquivoSelecionado, selecionarArquivo,
    projetoSelecionado: selectedProjectId,
    setProjetoSelecionado: setSelectedProjectId,
    itemBibliotecaSelecionado: selectedLibraryItem,
    setItemBibliotecaSelecionado: setSelectedLibraryItem
  } = useLayout();
  const { saveFile, directoryHandle } = useWorkspace();
  const { newConversation, setInputText } = useChat();
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);

  const handleCopy = () => {
    if (arquivoSelecionado?.content) {
      navigator.clipboard.writeText(arquivoSelecionado.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Check if this is a local file (has directoryHandle)
  const isLocalFile = !!directoryHandle;

  const handleSave = useCallback(async () => {
    if (!arquivoSelecionado || !isLocalFile) return;

    setIsSaving(true);
    const success = await saveFile(arquivoSelecionado.path, arquivoSelecionado.content);
    setIsSaving(false);

    if (success) {
      setIsModified(false);
    }
  }, [arquivoSelecionado, saveFile, isLocalFile]);

  const handleContentChange = useCallback((value: string | undefined) => {
    if (value !== undefined && arquivoSelecionado) {
      selecionarArquivo({ ...arquivoSelecionado, content: value });
      setIsModified(true);
    }
  }, [arquivoSelecionado, selecionarArquivo]);

  const isImage = (lang: string) => ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(lang.toLowerCase());

  // Prioritize rendering: 
  // 1. Selected File (GitHub)
  // 2. Selected Library Item (Templates/Prompts)
  // 3. Selected Project Details
  // 4. Empty State

  if (arquivoSelecionado) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col relative p-0">
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in glass-panel border border-glass-border">
          <div className="px-2 py-0.5 glass-header flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${isModified ? 'bg-orange-500' : 'bg-glass-muted/40'}`}></div>
              <h2 className="text-[9px] uppercase font-bold text-glass tracking-widest opacity-80 truncate max-w-[300px]">
                {arquivoSelecionado.path.split('/').pop()}
                {isModified && <span className="text-orange-400 ml-1">•</span>}
              </h2>
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-glass-accent/10 text-glass-accent border border-glass-accent/20 tracking-wide rounded-sm">
                {arquivoSelecionado.language}
              </span>
              {isLocalFile && (
                <span className="text-[7px] text-glass-muted/60 uppercase">local</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isLocalFile && !isImage(arquivoSelecionado.language) && (
                <button
                  onClick={handleSave}
                  disabled={!isModified || isSaving}
                  className={`p-0.5 transition-colors ${isModified ? 'text-glass-accent hover:text-white' : 'text-glass-muted/30 cursor-not-allowed'}`}
                  title={isSaving ? 'Salvando...' : isModified ? 'Salvar (Ctrl+S)' : 'Nenhuma alteração'}
                >
                  {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                </button>
              )}
              {!isImage(arquivoSelecionado.language) && (
                <button
                  onClick={handleCopy}
                  className="p-0.5 text-glass-muted hover:text-glass transition-colors"
                  title={copied ? 'Copiado' : 'Copiar'}
                >
                  {copied ? <Check size={12} className="text-glass-accent" /> : <Copy size={12} />}
                </button>
              )}
              <button
                onClick={() => selecionarArquivo(null)}
                className="p-0.5 text-glass-muted hover:text-red-400 transition-colors"
                title="Fechar"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar relative bg-black/20">
            {isImage(arquivoSelecionado.language) ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                <img
                  src={`data:image/${arquivoSelecionado.language};base64,${arquivoSelecionado.content}`}
                  alt={arquivoSelecionado.path}
                  className="max-w-full max-h-full object-contain border border-glass shadow-2xl"
                />
              </div>
            ) : (
              <MonacoWrapper
                language={arquivoSelecionado.language.toLowerCase()}
                value={arquivoSelecionado.content}
                className="h-full w-full"
                onChange={handleContentChange}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedLibraryItem || (selectedLibraryItem as any)?.isCreating) {
    const isCreating = (selectedLibraryItem as any)?.isCreating || false;
    return (
      <div className="flex-1 overflow-hidden flex flex-col relative p-0">
        <LibraryDetailsViewer
          item={isCreating ? null : selectedLibraryItem as any}
          isCreating={isCreating}
          currentProjectId={currentProjectId}
          onClose={() => setSelectedLibraryItem(null)}
          onSaveSuccess={() => {
            // Force refresh of library viewers is handled by selection state
            setSelectedLibraryItem(null);
          }}
          onSelect={(content) => {
            setInputText(content);
            setSelectedLibraryItem(null);
            // Optionally focus the copilot input via document focus or internal ref if exposed
            const textarea = document.querySelector('textarea[placeholder="Digite sua instrução..."]') as HTMLTextAreaElement;
            if (textarea) textarea.focus();
          }}
        />
      </div>
    );
  }

  if (selectedProjectId) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col relative p-0">
        <div className="flex-1 overflow-hidden">
          <ProjectDetailsViewer
            projectId={selectedProjectId}
            onClose={() => setSelectedProjectId(null)}
            onNewConversation={() => { newConversation(); setSelectedProjectId(null); }}
            onOpenLibrary={() => { }} // Library view handled via selection
          />
        </div>
      </div>
    );
  }

  // Empty State - Tessy Logo with identity
  return (
    <div className="flex-1 overflow-hidden flex flex-col items-center justify-center p-2 relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-radial from-glass-accent/15 to-transparent opacity-80 pointer-events-none" />

      <div className="flex flex-col items-center justify-center text-center animate-fade-in relative z-10">
        <div className="w-32 h-32 flex items-center justify-center mb-8 relative">
          {/* Logo Glow Effects */}
          <div className="absolute inset-0 bg-glass-accent/40 blur-[50px] rounded-full animate-pulse-slow"></div>

          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--glass-accent)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--glass-text)" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Main Delta Shape */}
            <path
              d="M50 15 L85 80 L15 80 Z"
              fill="none"
              stroke="url(#logoGradient)"
              strokeWidth="3"
              strokeLinecap="square"
              filter="url(#glow)"
              className="animate-[dash_60s_linear_infinite]"
              strokeDasharray="200"
              strokeDashoffset="0"
            />

            {/* Inner detail */}
            <path
              d="M50 28 L72 72 L28 72 Z"
              fill="var(--glass-accent)"
              fillOpacity="0.1"
              stroke="var(--glass-accent)"
              strokeWidth="0.5"
            />

            {/* Center Core */}
            <circle cx="50" cy="55" r="4" fill="var(--glass-accent)" className="animate-pulse" />
          </svg>
        </div>

        <h1 className="text-5xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50"
          style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.1)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
          }}>
          TESSY
        </h1>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-[1px] w-12 bg-glass-accent/50"></div>
          <p className="text-[10px] font-bold text-glass-accent uppercase tracking-[0.5em] shadow-black drop-shadow-sm">
            RABELUS LAB
          </p>
          <div className="h-[1px] w-12 bg-glass-accent/50"></div>
        </div>
      </div>
    </div>
  );
};

export default CentralCanvas;
