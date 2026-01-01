
import React from 'react';
import { useLayout } from '../../hooks/useLayout';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Copy, Check } from 'lucide-react';
import ProjectDetailsViewer from '../viewers/ProjectDetailsViewer';
import LibraryDetailsViewer from '../viewers/LibraryDetailsViewer';
import { useChat } from '../../contexts/ChatContext';
import { useViewer } from '../../hooks/useViewer';
import { Template, RepositoryItem } from '../../types';

interface CentralCanvasProps {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  selectedLibraryItem: Template | RepositoryItem | null;
  setSelectedLibraryItem: (item: Template | RepositoryItem | null) => void;
}

const CentralCanvas: React.FC<CentralCanvasProps> = ({ 
  selectedProjectId, 
  setSelectedProjectId,
  selectedLibraryItem,
  setSelectedLibraryItem
}) => {
  const { arquivoSelecionado, selecionarArquivo } = useLayout();
  const { newConversation, setInputText } = useChat();
  const { abrirViewer } = useViewer();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (arquivoSelecionado?.content) {
      navigator.clipboard.writeText(arquivoSelecionado.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isImage = (lang: string) => ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(lang.toLowerCase());

  // Prioritize rendering: 
  // 1. Selected File (GitHub)
  // 2. Selected Library Item (Templates/Prompts)
  // 3. Selected Project Details
  // 4. Empty State

  if (arquivoSelecionado) {
    return (
      <div className="flex-1 bg-bg-secondary overflow-hidden flex flex-col relative p-6">
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in border border-border-visible bg-bg-tertiary/40 backdrop-blur-lg shadow-xl">
          <div className="px-4 py-2 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-accent-primary tracking-tighter truncate max-w-[300px]">{arquivoSelecionado.path}</span>
              <span className="text-[10px] font-medium uppercase px-2 py-0.5 bg-accent-subtle text-accent-primary border border-accent-primary/20 tracking-wide">
                {arquivoSelecionado.language}
              </span>
            </div>
            <div className="flex items-center gap-4">
               {!isImage(arquivoSelecionado.language) && (
                 <button 
                   onClick={handleCopy}
                   className="text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-2"
                 >
                   {copied ? <Check size={14} className="text-accent-primary" /> : <Copy size={14} />}
                   <span className="text-[10px] font-medium uppercase tracking-wide">{copied ? 'OK' : 'Copiar'}</span>
                 </button>
               )}
               <button 
                 onClick={() => selecionarArquivo(null)}
                 className="p-1 text-text-tertiary hover:text-red-400 transition-colors"
               >
                 <X size={16} />
               </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            {isImage(arquivoSelecionado.language) ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                 <img 
                   src={`data:image/${arquivoSelecionado.language};base64,${arquivoSelecionado.content}`} 
                   alt={arquivoSelecionado.path}
                   className="max-w-full max-h-full object-contain border border-border-visible shadow-2xl" 
                 />
              </div>
            ) : (
              <SyntaxHighlighter 
                language={arquivoSelecionado.language.toLowerCase()} 
                style={prismTheme as any}
                showLineNumbers={true}
                customStyle={{ 
                  margin: 0, 
                  padding: '24px',
                  backgroundColor: 'transparent',
                  fontSize: '13px',
                  fontFamily: '"JetBrains Mono", monospace'
                }}
                lineNumberStyle={{ color: '#2a4a6f', minWidth: '3em', paddingRight: '1em' }}
              >
                {arquivoSelecionado.content}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedLibraryItem) {
    return (
      <div className="flex-1 bg-bg-secondary overflow-hidden flex flex-col relative p-6">
        <LibraryDetailsViewer 
          item={selectedLibraryItem}
          onClose={() => setSelectedLibraryItem(null)}
          onSelect={(content) => {
            setInputText(content);
            setSelectedLibraryItem(null);
          }}
        />
      </div>
    );
  }

  if (selectedProjectId) {
    return (
      <div className="flex-1 bg-bg-secondary overflow-hidden flex flex-col relative p-6">
        <div className="flex-1 border border-border-visible overflow-hidden shadow-xl">
          <ProjectDetailsViewer 
            projectId={selectedProjectId} 
            onClose={() => setSelectedProjectId(null)}
            onNewConversation={() => { newConversation(); setSelectedProjectId(null); }}
            onOpenLibrary={() => abrirViewer('library')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-bg-secondary overflow-hidden flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-20 h-20 flex items-center justify-center mb-8 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_15px_rgba(74,158,255,0.3)]">
            <path d="M50 10 L90 90 L10 90 Z" fill="none" stroke="#4a9eff" strokeWidth="6" />
            <path d="M35 60 H65" fill="none" stroke="#4a9eff" strokeWidth="6" />
          </svg>
        </div>
        <h3 className="text-2xl font-light tracking-[0.2em] text-text-primary opacity-20">TESSY</h3>
        <p className="mt-2 text-[10px] font-medium text-text-tertiary opacity-20 uppercase tracking-[0.4em]">
          Rabelus Lab Nucleus
        </p>
      </div>
    </div>
  );
};

export default CentralCanvas;
