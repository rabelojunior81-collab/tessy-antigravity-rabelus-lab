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
    <div className="flex-1 bg-bg-primary overflow-hidden flex flex-col relative rounded-none">
      {!arquivoSelecionado ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40 animate-fade-in">
          <div className="w-20 h-20 border border-accent-primary/20 mb-9 flex items-center justify-center rounded-none">
            <span className="text-4xl font-black text-accent-primary/20">?</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-text-secondary">
            Selecione um arquivo no GitHub Sync para visualizar
          </p>
          <div className="mt-12 flex gap-9">
             <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-none border border-border-subtle flex items-center justify-center"><FileCode size={18} /></div>
                <span className="text-[10px] font-semibold uppercase text-text-tertiary tracking-widest">Código</span>
             </div>
             <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-none border border-border-subtle flex items-center justify-center"><ImageIcon size={18} /></div>
                <span className="text-[10px] font-semibold uppercase text-text-tertiary tracking-widest">Imagens</span>
             </div>
             <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-none border border-border-subtle flex items-center justify-center"><Eye size={18} /></div>
                <span className="text-[10px] font-semibold uppercase text-text-tertiary tracking-widest">Preview</span>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden animate-fade-in">
          <div className="px-9 py-4 border-b border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
            <div className="flex items-center gap-5">
              <span className="text-[12px] font-mono text-accent-primary tracking-tighter truncate max-w-[400px]">{arquivoSelecionado.path}</span>
              <span className="text-[10px] font-semibold uppercase px-3 py-1 bg-accent-primary/10 text-accent-primary border border-accent-primary/20 rounded-none">
                {arquivoSelecionado.language}
              </span>
            </div>
            <div className="flex items-center gap-6">
               {!isImage(arquivoSelecionado.language) && (
                 <button 
                   onClick={handleCopy}
                   className="text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-2.5"
                 >
                   {copied ? <Check size={16} className="text-accent-primary" /> : <Copy size={16} />}
                   <span className="text-[10px] font-semibold uppercase tracking-widest">{copied ? 'Copiado' : 'Copiar'}</span>
                 </button>
               )}
               <button 
                 onClick={() => selecionarArquivo(null)}
                 className="p-2 text-text-tertiary hover:text-red-400 transition-colors rounded-none"
               >
                 <X size={20} />
               </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar bg-bg-primary/50 relative">
            {isImage(arquivoSelecionado.language) ? (
              <div className="w-full h-full flex items-center justify-center p-12">
                 <img 
                   src={`data:image/${arquivoSelecionado.language};base64,${arquivoSelecionado.content}`} 
                   alt={arquivoSelecionado.path}
                   className="max-w-full max-h-full object-contain shadow-2xl border border-border-subtle bg-bg-tertiary rounded-none" 
                 />
              </div>
            ) : (
              <SyntaxHighlighter 
                language={arquivoSelecionado.language.toLowerCase()} 
                style={prismTheme as any}
                showLineNumbers={true}
                customStyle={{ 
                  margin: 0, 
                  padding: '36px', /* 50% increase from 24px */
                  backgroundColor: 'transparent',
                  fontSize: '13px',
                  fontFamily: '"JetBrains Mono", monospace'
                }}
                lineNumberStyle={{ color: '#2b3b4b', minWidth: '3.5em', paddingRight: '1.5em' }}
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