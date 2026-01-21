import React, { useState } from 'react';
import { X, Copy, Download, Check } from 'lucide-react';

interface MarkdownShareModalProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
}

const MarkdownShareModal: React.FC<MarkdownShareModalProps> = ({ isOpen, content, onClose }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tessy-response-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-panel  w-[90%] max-w-3xl max-h-[80vh] flex flex-col animate-zoom-in">
        <div className="px-4 py-2 glass-header flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={copyMarkdown}
              className="p-1.5 text-glass-muted hover:text-glass-accent transition-all"
              title="Copiar Markdown"
            >
              {isCopied ? <Check size={16} className="text-glass-accent" /> : <Copy size={16} />}
            </button>
            <button
              onClick={downloadMarkdown}
              className="p-1.5 text-glass-muted hover:text-glass-accent transition-all"
              title="Baixar como .md"
            >
              <Download size={16} />
            </button>
          </div>
          <button onClick={onClose} className="p-1 text-glass-muted hover:text-red-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-white/5 border-t border-glass/10">
          <pre className="text-sm text-glass font-mono whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MarkdownShareModal;
