import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Send, Paperclip, MessageSquare, Bot, User, RotateCcw, Globe, FileText, Wand2, Save, Share2, Settings2, Trash2 } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import { useLayout } from '../../hooks/useLayout';
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

  const { larguraCoPilot } = useLayout();

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
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasMessages = useMemo(() => (currentConversation?.turns.length || 0) > 0, [currentConversation]);

  const toolbarItems = [
    { 
      icon: FileText, 
      label: 'Templates', 
      onClick: () => setIsTemplateModalOpen(true),
      disabled: false,
      color: 'text-text-tertiary hover:text-accent-primary'
    },
    { 
      icon: Wand2, 
      label: 'Otimizar', 
      onClick: () => setIsOptimizeModalOpen(true),
      disabled: !inputText.trim(),
      color: 'text-text-tertiary hover:text-accent-primary'
    },
    { 
      icon: Save, 
      label: 'Salvar', 
      onClick: () => setIsSaveModalOpen(true),
      disabled: !hasMessages,
      color: 'text-text-tertiary hover:text-accent-primary'
    },
    { 
      icon: Share2, 
      label: 'Partilhar', 
      onClick: () => setIsShareModalOpen(true),
      disabled: !hasMessages,
      color: 'text-text-tertiary hover:text-accent-primary'
    },
    { 
      icon: RotateCcw, 
      label: 'Reiniciar', 
      onClick: () => setIsRestartModalOpen(true),
      disabled: !hasMessages,
      color: 'text-red-400/50 hover:text-red-400'
    },
  ];

  const panelStyle = {
    width: window.innerWidth < 1024 ? '100%' : `${larguraCoPilot}px`
  };

  return (
    <aside 
      className="fixed lg:relative bottom-0 right-0 w-full h-[60vh] lg:h-full bg-bg-secondary border-l border-border-subtle flex flex-col z-[60] shrink-0 transition-all duration-300"
      style={panelStyle}
    >
      <div className="h-16 sm:h-20 flex items-center justify-between px-6 sm:px-9 border-b border-border-subtle bg-bg-primary/90 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className={`w-2.5 h-2.5 rounded-none ${isLoading ? 'bg-amber-400 animate-pulse' : 'bg-accent-primary shadow-[0_0_10px_#3B82F6]'}`}></div>
          <div className="flex flex-col">
            <h2 className="text-[14px] font-bold text-text-primary uppercase tracking-[0.05em] leading-none">Célula de Inteligência</h2>
            <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mt-1.5">Operador Sincronizado</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsControllersModalOpen(true)}
            className="flex items-center gap-3 px-5 py-2.5 bg-accent-primary/5 border border-border-subtle text-text-tertiary text-[10px] font-semibold uppercase tracking-widest hover:border-accent-primary/50 hover:text-accent-primary transition-all active:scale-95 rounded-none"
          >
            <Settings2 size={14} />
            Parâmetros
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative bg-bg-secondary">
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-9 space-y-12 pb-14">
          {currentConversation?.turns.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-10 px-16 animate-fade-in">
              <MessageSquare size={56} className="mb-9 text-text-primary" />
              <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-text-primary">Pronto para Transmissão</p>
            </div>
          )}

          {currentConversation?.turns.map((turn) => (
            <div key={turn.id} className="space-y-9 animate-fade-in">
              {/* User message */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-3 opacity-40">
                   <span className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary">Operador</span>
                   <User size={12} className="text-text-secondary" />
                </div>
                <div className="max-w-[90%] bg-accent-primary/5 border border-border-subtle p-5 text-[13px] text-text-primary leading-[1.6] font-normal rounded-none">
                  {turn.userMessage}
                </div>
                {turn.attachedFiles && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {turn.attachedFiles.map(f => (
                      <span key={f.id} className="text-[10px] font-semibold uppercase px-3 py-1.5 bg-bg-tertiary border border-border-subtle text-text-tertiary rounded-none">{f.name}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Model message */}
              <div className="flex flex-col items-start gap-3">
                <div className="flex items-center gap-3">
                   <Bot size={12} className="text-accent-primary" />
                   <span className="text-[10px] font-semibold text-accent-primary uppercase tracking-widest">Tessy Core</span>
                </div>
                <div className="max-w-full w-full bg-bg-tertiary/40 border border-border-subtle p-6 sm:p-8 shadow-lg rounded-none">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={prismTheme as any}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {turn.tessyResponse}
                    </ReactMarkdown>
                  </div>
                  
                  {turn.groundingChunks && turn.groundingChunks.length > 0 && (
                    <div className="mt-9 pt-6 border-t border-accent-primary/10">
                      <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest flex items-center gap-3 mb-4">
                        <Globe size={14} className="text-accent-primary/40" /> Referências de Pesquisa
                      </span>
                      <div className="flex flex-wrap gap-3">
                        {turn.groundingChunks.map((chunk, idx) => chunk.web ? (
                          <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold uppercase px-4 py-2 bg-bg-primary border border-accent-primary/10 text-accent-primary/70 hover:text-accent-primary hover:border-accent-primary/30 transition-all flex items-center gap-3 rounded-none">
                            {chunk.web.title}
                          </a>
                        ) : null)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex flex-col items-start gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                 <Bot size={12} className="text-accent-secondary" />
                 <span className="text-[10px] font-semibold text-accent-secondary uppercase tracking-widest">Interpretando Protocolo...</span>
              </div>
              <div className="w-[70%] h-5 bg-bg-tertiary/20 border border-border-subtle rounded-none"></div>
              <div className="w-[50%] h-5 bg-bg-tertiary/20 border border-border-subtle rounded-none"></div>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2 border-t border-border-subtle bg-bg-primary/50 flex items-center justify-around shrink-0">
          {toolbarItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={item.onClick}
              disabled={item.disabled}
              title={item.label}
              className={`p-3 transition-all relative group flex flex-col items-center gap-2 ${item.color} ${item.disabled ? 'opacity-20 cursor-not-allowed' : 'hover:scale-110'}`}
            >
              <item.icon size={20} />
              <span className="text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-bg-primary border-t border-border-subtle space-y-6 shrink-0">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-2 animate-slide-in-right">
              {attachedFiles.map(file => (
                <div key={file.id} className="relative group">
                  <div className="text-[10px] font-semibold uppercase px-4 py-2 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center gap-3 rounded-none">
                    {file.name}
                    <button 
                      onClick={() => removeFile(file.id)} 
                      className="hover:text-red-400 p-1"
                      title="Remover arquivo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-5 bg-bg-secondary border border-border-subtle p-5 focus-within:border-accent-primary/40 transition-all group shadow-inner rounded-none">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-text-tertiary hover:text-accent-primary transition-all shrink-0 active:scale-90"
              title="Anexar arquivos"
            >
              <Paperclip size={24} />
            </button>
            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" />
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua diretriz..."
              className="flex-1 bg-transparent border-none outline-none text-text-primary text-[13px] font-normal resize-none max-h-48 min-h-[28px] custom-scrollbar py-1 leading-[1.6] placeholder:text-text-tertiary"
              rows={1}
            />
            
            <button 
              onClick={() => sendMessage()}
              disabled={isLoading || isUploadingFiles || (!inputText.trim() && attachedFiles.length === 0)}
              className={`p-2 transition-all rounded-none flex items-center justify-center ${
                (!inputText.trim() && attachedFiles.length === 0) 
                  ? 'text-text-tertiary opacity-30' 
                  : 'text-accent-primary hover:bg-accent-primary/10 active:scale-95'
              }`}
              title="Enviar Transmissão"
            >
              <Send size={24} />
            </button>
          </div>
          
          <div className="flex items-center justify-between text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
             <span>ENTER PARA ENVIAR</span>
             <span className="flex items-center gap-2">
                {isLoading ? 'EXECUTANDO...' : 'SISTEMA PRONTO'}
                <div className={`w-1.5 h-1.5 rounded-none ${isLoading ? 'bg-accent-secondary' : 'bg-accent-primary'}`}></div>
             </span>
          </div>
        </div>
      </div>

      <TemplateModal 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)}
        onSelect={(content) => {
          setInputText(content);
        }}
      />

      <OptimizeModal 
        isOpen={isOptimizeModalOpen}
        inputText={inputText}
        onClose={() => setIsOptimizeModalOpen(false)}
        onApply={(optimized) => {
          setInputText(optimized);
        }}
      />

      <SaveModal 
        isOpen={isSaveModalOpen}
        conversation={currentConversation}
        onClose={() => setIsSaveModalOpen(false)}
        onSuccess={(updated) => loadConversation(updated)}
      />

      <ShareModal 
        isOpen={isShareModalOpen}
        conversation={currentConversation}
        onClose={() => setIsShareModalOpen(false)}
      />

      <RestartModal 
        isOpen={isRestartModalOpen}
        onClose={() => setIsRestartModalOpen(false)}
        onConfirm={() => newConversation()}
      />

      <ControllersModal 
        isOpen={isControllersModalOpen}
        onClose={() => setIsControllersModalOpen(false)}
      />
    </aside>
  );
};

export default React.memo(CoPilot);