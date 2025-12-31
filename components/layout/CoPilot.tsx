import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Send, Paperclip, MessageSquare, Bot, User, RotateCcw, Globe, FileText, Wand2, Save, Share2, Settings2, Trash2 } from 'lucide-react';
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
    <aside className="w-[400px] h-full bg-bg-secondary border-l border-border-subtle flex flex-col z-[60] shrink-0">
      <div className="h-16 flex items-center justify-between px-6 border-b border-border-subtle bg-bg-primary shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 ${isLoading ? 'bg-accent-secondary animate-pulse' : 'bg-accent-primary shadow-[0_0_8px_#3B82F6]'}`}></div>
          <h2 className="text-[12px] font-bold text-text-primary uppercase tracking-[0.05em]">Célula IA</h2>
        </div>
        <button 
          onClick={() => setIsControllersModalOpen(true)}
          className="p-2 text-text-tertiary hover:text-accent-primary transition-all active:scale-95"
        >
          <Settings2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col bg-bg-secondary">
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-10">
          {currentConversation?.turns.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 animate-fade-in">
              <MessageSquare size={32} className="mb-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Sistema Pronto</p>
            </div>
          )}

          {currentConversation?.turns.map((turn) => (
            <div key={turn.id} className="space-y-4 animate-fade-in">
              <div className="flex flex-col items-end gap-1.5">
                <div className="bg-accent-primary/10 border border-accent-primary/20 p-3 text-[13px] text-text-primary leading-relaxed max-w-[90%]">
                  {turn.userMessage}
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5">
                <div className="flex items-center gap-2 mb-1">
                   <Bot size={12} className="text-accent-primary" />
                   <span className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">Tessy</span>
                </div>
                <div className="w-full bg-bg-tertiary/30 border border-border-subtle p-4 prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter style={prismTheme as any} language={match[1]} PreTag="div" {...props}>
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
                </div>
                
                {turn.groundingChunks && turn.groundingChunks.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {turn.groundingChunks.map((chunk, idx) => chunk.web ? (
                      <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold uppercase px-2 py-1 bg-bg-primary border border-border-subtle text-accent-primary hover:border-accent-primary transition-all">
                        {chunk.web.title}
                      </a>
                    ) : null)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start gap-2 animate-pulse">
              <div className="w-[60%] h-4 bg-bg-tertiary/40 border border-border-subtle"></div>
              <div className="w-[40%] h-4 bg-bg-tertiary/40 border border-border-subtle"></div>
            </div>
          )}
        </div>

        <div className="px-4 py-1 border-t border-border-subtle bg-bg-primary/50 flex items-center justify-around shrink-0">
          {toolbarItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={item.onClick}
              disabled={item.disabled}
              title={item.label}
              className={`p-2 transition-all ${item.color || 'text-text-tertiary hover:text-accent-primary'} ${item.disabled ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110 active:scale-90'}`}
            >
              <item.icon size={18} />
            </button>
          ))}
        </div>

        <div className="p-4 bg-bg-primary border-t border-border-subtle shrink-0">
          <div className="flex items-end gap-3 bg-bg-tertiary border border-border-subtle p-3 focus-within:border-accent-primary transition-all">
            <button onClick={() => fileInputRef.current?.click()} className="p-1 text-text-tertiary hover:text-accent-primary shrink-0">
              <Paperclip size={20} />
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && addFile(e.target.files[0])} className="hidden" />
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite..."
              className="flex-1 bg-transparent border-none outline-none text-text-primary text-[13px] resize-none max-h-32 min-h-[20px] py-0.5 leading-relaxed placeholder:text-text-tertiary"
              rows={1}
            />
            
            <button 
              onClick={() => sendMessage()}
              disabled={isLoading || isUploadingFiles || (!inputText.trim() && attachedFiles.length === 0)}
              className={`p-1 transition-all ${(!inputText.trim() && attachedFiles.length === 0) ? 'text-text-tertiary opacity-30' : 'text-accent-primary hover:scale-110 active:scale-90'}`}
            >
              <Send size={20} />
            </button>
          </div>
          
          <div className="flex items-center justify-between text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mt-2 px-1">
             <span>Shift+Enter para linha</span>
             <div className={`w-1 h-1 ${isLoading ? 'bg-accent-secondary' : 'bg-accent-primary'}`}></div>
          </div>
        </div>
      </div>

      <TemplateModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} onSelect={setInputText} />
      <OptimizeModal isOpen={isOptimizeModalOpen} inputText={inputText} onClose={() => setIsOptimizeModalOpen(false)} onApply={setInputText} />
      <SaveModal isOpen={isSaveModalOpen} conversation={currentConversation} onClose={() => setIsSaveModalOpen(false)} onSuccess={loadConversation} />
      <ShareModal isOpen={isShareModalOpen} conversation={currentConversation} onClose={() => setIsShareModalOpen(false)} />
      <RestartModal isOpen={isRestartModalOpen} onClose={() => setIsRestartModalOpen(false)} onConfirm={newConversation} />
      <ControllersModal isOpen={isControllersModalOpen} onClose={() => setIsControllersModalOpen(false)} />
    </aside>
  );
};

export default React.memo(CoPilot);