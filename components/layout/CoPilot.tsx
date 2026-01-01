
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { ArrowRight, Plus, RotateCcw, FileText, Wand2, Save, Share2, Settings2, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TemplateModal from '../modals/TemplateModal';
import OptimizeModal from '../modals/OptimizeModal';
import SaveModal from '../modals/SaveModal';
import ShareModal from '../modals/ShareModal';
import RestartModal from '../modals/RestartModal';
import ControllersModal from '../modals/ControllersModal';
import FilePreview from '../FilePreview';

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
    isUploadingFiles
  } = useChat();

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  const [isControllersModalOpen, setIsControllersModalOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 40), 200);
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

  const hasMessages = useMemo(() => (currentConversation?.turns.length || 0) > 0, [currentConversation]);

  const toolbarItems = [
    { icon: FileText, label: 'Templates', onClick: () => setIsTemplateModalOpen(true), disabled: false },
    { icon: Wand2, label: 'Otimizar', onClick: () => setIsOptimizeModalOpen(true), disabled: !inputText.trim() },
    { icon: Save, label: 'Salvar', onClick: () => setIsSaveModalOpen(true), disabled: !hasMessages },
    { icon: Share2, label: 'Partilhar', onClick: () => setIsShareModalOpen(true), disabled: !hasMessages },
    { icon: RotateCcw, label: 'Reiniciar', onClick: () => setIsRestartModalOpen(true), disabled: !hasMessages, color: 'text-red-400' },
  ];

  return (
    <aside className="w-[400px] h-full bg-bg-secondary/60 backdrop-blur-xl border-l border-border-subtle flex flex-col z-[60] shrink-0">
      <div className="h-16 flex items-center justify-between px-4 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 ${isLoading ? 'bg-accent-secondary animate-pulse shadow-[0_0_8px_#60A5FA]' : 'bg-accent-primary shadow-[0_0_8px_#3B82F6]'}`}></div>
          <h2 className="text-[12px] font-bold text-text-primary uppercase tracking-[0.05em]">CORE ASSISTANT</h2>
        </div>
        <button 
          onClick={() => setIsControllersModalOpen(true)}
          className="p-2 text-text-tertiary hover:text-accent-primary transition-all active:scale-95"
          title="Configurações"
        >
          <Settings2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-transparent relative">
        {/* MENSAGENS - Área scrollable */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 pb-4 relative">
          {currentConversation?.turns.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 animate-fade-in">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-tertiary">ready for instruction</p>
            </div>
          )}

          {currentConversation?.turns.map((turn) => (
            <div key={turn.id} className="space-y-4 animate-fade-in">
              <div className="flex flex-col items-start gap-1.5">
                <div className="w-full bg-bg-tertiary/60 backdrop-blur-lg border border-border-subtle p-4 text-[13px] text-text-primary leading-relaxed shadow-sm">
                  {turn.userMessage}
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5">
                <div className="flex items-center gap-2 mb-1 px-1">
                   <ChevronDown size={10} className="text-text-tertiary" />
                   <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest opacity-60">Thought process active</span>
                </div>
                <div className="w-full bg-bg-tertiary/40 backdrop-blur-lg border border-border-subtle p-4 prose prose-invert max-w-none shadow-sm">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter style={prismTheme as any} language={match[1]} PreTag="div" {...props} customStyle={{ margin: 0, padding: '12px', background: 'transparent' }}>
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>{children}</code>
                        );
                      }
                    }}
                  >
                    {turn.tessyResponse}
                  </ReactMarkdown>
                  
                  <div className="flex items-center gap-3 mt-4 border-t border-border-subtle pt-3">
                    <button className="text-[10px] font-semibold uppercase px-3 py-1.5 bg-bg-primary/50 border border-border-subtle text-text-tertiary hover:text-accent-primary transition-all flex items-center gap-2">
                       <ThumbsUp size={12} /> Positive
                    </button>
                    <button className="text-[10px] font-semibold uppercase px-3 py-1.5 bg-bg-primary/50 border border-border-subtle text-text-tertiary hover:text-accent-primary transition-all flex items-center gap-2">
                       <ThumbsDown size={12} /> Negative
                    </button>
                  </div>
                </div>
                
                {turn.groundingChunks && turn.groundingChunks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 px-1">
                    {turn.groundingChunks.map((chunk, idx) => chunk.web ? (
                      <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold uppercase px-2 py-1 bg-bg-primary/30 backdrop-blur-md border border-border-subtle text-accent-primary hover:border-accent-primary transition-all">
                        {chunk.web.title}
                      </a>
                    ) : null)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start gap-2 animate-pulse px-4">
              <div className="w-[80%] h-4 bg-bg-tertiary/40 border border-border-subtle"></div>
              <div className="w-[60%] h-4 bg-bg-tertiary/40 border border-border-subtle"></div>
            </div>
          )}
        </div>

        {/* ÁREA FIXA DE COMANDOS E INPUT - FORA DO SCROLL */}
        <div className="px-4 pb-4 pt-2 bg-transparent shrink-0">
          {/* ÍCONES DE AÇÃO - Agora fora do scroll e acima do input */}
          <div className="px-1 pb-2 flex items-center gap-3 z-10 bg-transparent">
            {toolbarItems.map((item, idx) => (
              <button 
                key={idx}
                onClick={item.onClick}
                disabled={item.disabled}
                title={item.label}
                className={`p-1 transition-all ${item.color || 'text-text-tertiary hover:text-accent-primary'} ${item.disabled ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 active:scale-90'}`}
              >
                <item.icon size={18} />
              </button>
            ))}
          </div>

          {/* File Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-4">
              <FilePreview files={attachedFiles} onRemove={removeFile} />
            </div>
          )}
          
          <div className="flex items-end gap-3 bg-bg-tertiary/80 backdrop-blur-xl border border-border-subtle p-4 focus-within:border-accent-primary transition-all shadow-2xl">
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="p-1 text-text-tertiary hover:text-accent-primary shrink-0 transition-colors"
              title="Anexar arquivo"
            >
              <Plus size={20} />
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && addFile(e.target.files[0])} className="hidden" />
            
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... (Shift+Enter for new line)"
              className="flex-1 bg-transparent border-none outline-none text-text-primary text-[13px] resize-none min-h-[40px] py-1 leading-relaxed placeholder:text-text-tertiary/60 custom-scrollbar transition-[height] duration-200"
            />
            
            <button 
              onClick={() => sendMessage()}
              disabled={isLoading || isUploadingFiles || (!inputText.trim() && attachedFiles.length === 0)}
              className={`p-1 transition-all ${(!inputText.trim() && attachedFiles.length === 0) ? 'text-text-tertiary opacity-30' : 'text-accent-primary hover:scale-110 active:scale-90'}`}
              title="Transmitir mensagem"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} onSelect={setInputText} />
      <OptimizeModal isOpen={isOptimizeModalOpen} inputText={inputText} onClose={() => setIsOptimizeModalOpen(false)} onApply={setInputText} />
      <SaveModal isOpen={isSaveModalOpen} conversation={currentConversation} onClose={() => setIsSaveModalOpen(false)} onSuccess={loadConversation} />
      <ShareModal isOpen={isShareModalOpen} conversation={currentConversation} onClose={() => setIsShareModalOpen(false)} />
      <RestartModal 
        isOpen={isRestartModalOpen} 
        onClose={() => setIsRestartModalOpen(false)} 
        onConfirm={newConversation} 
        onSave={() => { setIsRestartModalOpen(false); setIsSaveModalOpen(true); }} 
      />
      <ControllersModal isOpen={isControllersModalOpen} onClose={() => setIsControllersModalOpen(false)} />
    </aside>
  );
};

export default React.memo(CoPilot);
