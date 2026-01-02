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
      <div className="bg-bg-secondary border border-border-visible w-[90%] max-w-3xl max-h-[80vh] flex flex-col shadow-2xl animate-zoom-in">
        <div className="px-4 py-0.5 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={copyMarkdown}
              className="p-1.5 text-text-tertiary hover:text-accent-primary transition-all"
              title="Copiar Markdown"
            >
              {isCopied ? <Check size={16} className="text-accent-primary" /> : <Copy size={16} />}
            </button>
            <button
              onClick={downloadMarkdown}
              className="p-1.5 text-text-tertiary hover:text-accent-primary transition-all"
              title="Baixar como .md"
            >
              <Download size={16} />
            </button>
          </div>
          <button onClick={onClose} className="p-1 text-text-tertiary hover:text-red-400 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-bg-tertiary/20">
          <pre className="text-sm text-text-primary font-mono whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MarkdownShareModal;