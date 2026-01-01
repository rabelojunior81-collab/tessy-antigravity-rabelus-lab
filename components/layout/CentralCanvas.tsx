
import React from 'react';
import { useLayout } from '../../hooks/useLayout';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Copy, Check, FileCode } from 'lucide-react';

const CentralCanvas: React.FC = () => {
  const { arquivoSelecionado, selecionarArquivo } = useLayout();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (arquivoSelecionado?.content) {
      navigator.clipboard.writeText(arquivoSelecionado.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isImage = (lang: string) => ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(lang.toLowerCase());

  return (
    <div className="flex-1 bg-bg-primary overflow-hidden flex flex-col relative rounded-none p-6">
      {!arquivoSelecionado ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="w-16 h-16 flex items-center justify-center mb-6 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M50 10 L90 90 L10 90 Z" fill="none" stroke="#3B82F6" strokeWidth="8" />
              <path d="M35 60 H65" fill="none" stroke="#3B82F6" strokeWidth="8" />
            </svg>
          </div>
          <p className="text-[12px] font-black uppercase tracking-[0.4em] text-text-tertiary opacity-40">
            TESSY by Rabelus Lab
          </p>
          <p className="mt-2 text-[10px] font-medium text-text-tertiary opacity-20 uppercase tracking-widest">
            Nucleus Intelligence System
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in border border-border-subtle bg-bg-secondary/40 backdrop-blur-lg">
          <div className="px-4 py-2 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-accent-primary tracking-tighter truncate max-w-[300px]">{arquivoSelecionado.path}</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
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
                   <span className="text-[10px] font-semibold uppercase tracking-widest">{copied ? 'Ok' : 'Copiar'}</span>
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
                   className="max-w-full max-h-full object-contain border border-border-subtle shadow-2xl" 
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
                lineNumberStyle={{ color: '#2b3b4b', minWidth: '3em', paddingRight: '1em' }}
              >
                {arquivoSelecionado.content}
              </SyntaxHighlighter>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralCanvas;
