import React from 'react';
import { useLayout } from '../../hooks/useLayout';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Copy, Check, FileCode, ImageIcon, Eye } from 'lucide-react';

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
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 animate-fade-in">
          <FileCode size={48} className="mb-4 text-accent-primary" />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">
            Selecione um arquivo para visualizar
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in border border-border-subtle bg-bg-secondary">
          <div className="px-4 py-2 border-b border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
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
          
          <div className="flex-1 overflow-auto custom-scrollbar bg-bg-primary/30 relative">
            {isImage(arquivoSelecionado.language) ? (
              <div className="w-full h-full flex items-center justify-center p-8">
                 <img 
                   src={`data:image/${arquivoSelecionado.language};base64,${arquivoSelecionado.content}`} 
                   alt={arquivoSelecionado.path}
                   className="max-w-full max-h-full object-contain border border-border-subtle" 
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