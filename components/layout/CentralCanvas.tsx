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
    <div className="flex-1 bg-bg-primary overflow-hidden flex flex-col relative">
      {!arquivoSelecionado ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40 animate-fade-in">
          <div className="w-16 h-16 border-2 border-accent-primary/20 mb-6 flex items-center justify-center rounded-lg">
            <span className="text-3xl font-black text-accent-primary/20">?</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">
            Selecione um arquivo no GitHub Sync para visualizar
          </p>
          <div className="mt-8 flex gap-4">
             <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center"><FileCode size={14} /></div>
                <span className="text-[7px] font-bold uppercase text-text-tertiary">Código</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center"><ImageIcon size={14} /></div>
                <span className="text-[7px] font-bold uppercase text-text-tertiary">Imagens</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center"><Eye size={14} /></div>
                <span className="text-[7px] font-bold uppercase text-text-tertiary">Preview</span>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in">
          <div className="px-6 py-3 border-b border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-accent-primary tracking-tighter truncate max-w-[300px]">{arquivoSelecionado.path}</span>
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded-sm">
                {arquivoSelecionado.language}
              </span>
            </div>
            <div className="flex items-center gap-4">
               {!isImage(arquivoSelecionado.language) && (
                 <button 
                   onClick={handleCopy}
                   className="text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-1.5"
                 >
                   {copied ? <Check size={14} className="text-accent-primary" /> : <Copy size={14} />}
                   <span className="text-[8px] font-bold uppercase">{copied ? 'Copiado' : 'Copiar'}</span>
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
          
          <div className="flex-1 overflow-auto custom-scrollbar bg-bg-primary/50 relative">
            {isImage(arquivoSelecionado.language) ? (
              <div className="w-full h-full flex items-center justify-center p-12">
                 <img 
                   src={`data:image/${arquivoSelecionado.language};base64,${arquivoSelecionado.content}`} 
                   alt={arquivoSelecionado.path}
                   className="max-w-full max-h-full object-contain shadow-2xl border border-border-subtle bg-bg-tertiary rounded-md" 
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
                  fontSize: '12px',
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