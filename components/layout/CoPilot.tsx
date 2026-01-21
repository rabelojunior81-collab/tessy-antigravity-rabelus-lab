import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ArrowRight, Plus, RotateCcw, FileText, Wand2, Save, Share2, Settings2, ThumbsUp, ThumbsDown, ChevronDown, Copy, Download } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import OptimizeModal from '../modals/OptimizeModal';
import SaveModal from '../modals/SaveModal';
import ShareModal from '../modals/ShareModal';
import RestartModal from '../modals/RestartModal';
import ControllersModal from '../modals/ControllersModal';
import MarkdownShareModal from '../modals/MarkdownShareModal';
import FilePreview from '../FilePreview';
import { useViewer } from '../../hooks/useViewer';
import { TypewriterText } from './TypewriterText';

const CoPilot: React.FC = () => {
  const {
    currentConversation,
    isLoading,
    inputText,
    setInputText,
    sendMessage,
    newConversation,
    loadConversation,
    attachedFiles,
    addFile,
    removeFile,
    isUploadingFiles,
    sendFeedback
  } = useChat();

  const { abrirViewer } = useViewer();

  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [isControllersModalOpen, setIsControllersModalOpen] = useState(false);
  const [isMarkdownModalOpen, setIsMarkdownModalOpen] = useState(false);
  const [selectedMarkdownContent, setSelectedMarkdownContent] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 32), 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [inputText]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [currentConversation?.turns.length, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && !isUploadingFiles && (inputText.trim() || attachedFiles.length > 0)) {
        sendMessage();
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const openMarkdownModal = (content: string) => {
    setSelectedMarkdownContent(content);
    setIsMarkdownModalOpen(true);
  };

  const hasMessages = useMemo(() => (currentConversation?.turns.length || 0) > 0, [currentConversation]);

  const toolbarItems = [
    { icon: FileText, label: 'Biblioteca', onClick: () => abrirViewer('library'), disabled: false },
    { icon: Wand2, label: 'Otimizar', onClick: () => setIsOptimizeModalOpen(true), disabled: !inputText.trim() },
    { icon: Save, label: 'Salvar', onClick: () => setIsSaveModalOpen(true), disabled: !hasMessages },
    { icon: Share2, label: 'Partilhar', onClick: () => setIsShareModalOpen(true), disabled: !hasMessages },
    { icon: RotateCcw, label: 'Reiniciar', onClick: () => setIsRestartModalOpen(true), disabled: !hasMessages, color: 'text-red-400' },
  ];

  return (
    <aside className="w-full h-full glass-panel flex flex-col z-[60] grow-0 pointer-events-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-0.5 glass-header shrink-0">
        <div className="flex items-center gap-1.5">
          <div style={{ backgroundColor: isLoading ? 'var(--glass-accent)' : undefined }} className={`w-1.5 h-1.5 ${isLoading ? 'animate-soft-pulse' : 'bg-glass-muted/40'}`}></div>
          <h2 className="text-[9px] uppercase font-bold text-glass tracking-widest opacity-80">Tessy CoPilot</h2>
        </div>
        <button
          onClick={() => setIsControllersModalOpen(true)}
          className="p-0.5 text-glass-muted hover:text-glass-accent transition-all active:scale-95"
          title="Parâmetros"
        >
          <Settings2 size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 pb-2 relative">
          {currentConversation?.turns.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 animate-fade-in">
              <p className="text-[11px] font-normal tracking-wider italic text-glass-muted">READY FOR INSTRUCTION</p>
            </div>
          )}

          {currentConversation?.turns.map((turn) => (
            <div key={turn.id} className="space-y-1 animate-fade-in">
              {/* User Message */}
              <div className="flex flex-col items-start gap-0.5">
                <div className="w-full glass-card px-3 py-2 text-sm text-glass leading-relaxed font-normal border-l-2 border-l-glass-muted/30">
                  {turn.userMessage}
                </div>
              </div>

              {/* Tessy Response */}
              <div className="flex flex-col items-start gap-0.5">
                <div className="w-full glass-card px-3 py-2 prose max-w-none font-normal min-h-[40px] border-l-2 border-l-glass-accent/50">
                  {(() => {
                    const isLast = turn.id === currentConversation?.turns[currentConversation.turns.length - 1].id;
                    if (isLast && isLoading && !turn.tessyResponse) {
                      return (
                        <div className="flex items-center gap-1.5 py-2 px-1">
                          <div className="w-1.5 h-1.5 bg-glass-accent animate-soft-pulse"></div>
                          <div className="w-1.5 h-1.5 bg-glass-accent animate-soft-pulse [animation-delay:200ms]"></div>
                          <div className="w-1.5 h-1.5 bg-glass-accent animate-soft-pulse [animation-delay:400ms]"></div>
                        </div>
                      );
                    }

                    if (!turn.tessyResponse) return null;

                    const markdownRenderer = (content: string) => (
                      <ReactMarkdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <SyntaxHighlighter style={prismTheme as any} language={match[1]} PreTag="div" {...props} customStyle={{ margin: '0.5rem 0', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '0', border: '1px solid var(--glass-border)', fontSize: '12px' }}>
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className="bg-glass-accent/20 px-1 text-glass-accent font-normal" {...props}>{children}</code>
                            );
                          }
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    );

                    // Apenas aplica o efeito de digitação na última resposta recebida
                    if (isLast && !isLoading) {
                      const handleAutoScroll = () => {
                        if (scrollRef.current) {
                          scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'auto' });
                        }
                      };
                      return (
                        <TypewriterText
                          text={turn.tessyResponse}
                          onTick={handleAutoScroll}
                          renderFinal={markdownRenderer}
                        />
                      );
                    }

                    // Respostas anteriores já finalizadas renderizam diretamente
                    return markdownRenderer(turn.tessyResponse);
                  })()}

                  {turn.tessyResponse && (
                    <div className="flex items-center justify-end gap-2 mt-2 border-t border-glass pt-2">
                      <button
                        onClick={() => copyToClipboard(turn.tessyResponse)}
                        className="p-1 text-glass-muted hover:text-glass-accent transition-all hover:scale-105 active:scale-95"
                        title="Copiar texto"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => openMarkdownModal(turn.tessyResponse)}
                        className="p-1 text-glass-muted hover:text-glass-accent transition-all hover:scale-105 active:scale-95"
                        title="Compartilhar em Markdown"
                      >
                        <Download size={12} />
                      </button>
                      <button
                        onClick={() => sendFeedback(turn.id, 'positive')}
                        className={`p-1 transition-all ${turn.feedback === 'positive' ? 'text-glass-accent scale-105' : 'text-glass-muted hover:text-glass-accent hover:scale-105 active:scale-95'}`}
                        title="Feedback positivo"
                      >
                        <ThumbsUp size={12} fill={turn.feedback === 'positive' ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => sendFeedback(turn.id, 'negative')}
                        className={`p-1 transition-all ${turn.feedback === 'negative' ? 'text-red-400 scale-105' : 'text-glass-muted hover:text-red-400 hover:scale-105 active:scale-95'}`}
                        title="Feedback negativo"
                      >
                        <ThumbsDown size={12} fill={turn.feedback === 'negative' ? "currentColor" : "none"} />
                      </button>
                    </div>
                  )}
                </div>

                {turn.groundingChunks && turn.groundingChunks.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1 px-1">
                    {turn.groundingChunks.map((chunk, idx) => chunk.web ? (
                      <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-medium uppercase px-2 py-0.5 glass-card text-glass-accent hover:border-glass-accent transition-all tracking-wide">
                        {chunk.web.title}
                      </a>
                    ) : null)}
                  </div>
                )}
              </div>
            </div>
          ))}


        </div>

        <div className="px-3 pb-3 pt-1 shrink-0">
          <div className="px-1 pb-2 flex items-center gap-3">
            {toolbarItems.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                disabled={item.disabled}
                title={item.label}
                className={`p-1 transition-all ${item.color || 'text-glass-muted hover:text-glass-accent'} ${item.disabled ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
              >
                <item.icon size={16} />
              </button>
            ))}
          </div>

          {attachedFiles.length > 0 && (
            <div className="mb-3">
              <FilePreview files={attachedFiles} onRemove={removeFile} />
            </div>
          )}

          <div className="flex items-end gap-0 glass-input p-0 focus-within:border-glass-accent transition-all">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua instrução..."
              className="flex-1 bg-transparent border-none outline-none text-glass text-sm font-normal resize-none min-h-[24px] py-1 pl-1 leading-relaxed placeholder:text-glass-muted/50 custom-scrollbar transition-[height] duration-200"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 text-glass-muted hover:text-glass-accent shrink-0 transition-colors"
              title="Anexar arquivo"
            >
              <Plus size={16} />
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && addFile(e.target.files[0])} className="hidden" />

            <button
              onClick={() => sendMessage()}
              disabled={isLoading || isUploadingFiles || (!inputText.trim() && attachedFiles.length === 0)}
              className={`p-1 transition-all ${(!inputText.trim() && attachedFiles.length === 0) ? 'text-glass-muted opacity-20' : 'text-glass-accent hover:scale-110 active:scale-90'}`}
              title="Transmitir"
            >
              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <OptimizeModal isOpen={isOptimizeModalOpen} inputText={inputText} onClose={() => setIsOptimizeModalOpen(false)} onApply={setInputText} />
      <SaveModal isOpen={isSaveModalOpen} conversation={currentConversation} onClose={() => setIsSaveModalOpen(false)} onSuccess={loadConversation} />
      <ShareModal isOpen={isShareModalOpen} conversation={currentConversation} onClose={() => setIsShareModalOpen(false)} />
      <RestartModal
        isOpen={isRestartModalOpen}
        onClose={() => setIsRestartModalOpen(false)}
        onConfirm={() => newConversation(true)}
        onSave={() => { setIsRestartModalOpen(false); setIsSaveModalOpen(true); }}
      />
      <ControllersModal isOpen={isControllersModalOpen} onClose={() => setIsControllersModalOpen(false)} />
      <MarkdownShareModal
        isOpen={isMarkdownModalOpen}
        content={selectedMarkdownContent}
        onClose={() => setIsMarkdownModalOpen(false)}
      />
    </aside>
  );
};

export default React.memo(CoPilot);
