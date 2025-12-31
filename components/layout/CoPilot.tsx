import React, { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, MessageSquare, Bot, User, RotateCcw, Globe, FileText, Wand2, Save, Share2 } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import ReactMarkdown from 'https://esm.sh/react-markdown@^9.0.1';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import TemplateModal from '../modals/TemplateModal';
import OptimizeModal from '../modals/OptimizeModal';

const CoPilot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    currentConversation, 
    isLoading, 
    inputText, 
    setInputText, 
    sendMessage, 
    newConversation,
    attachedFiles,
    addFile,
    removeFile,
    isUploadingFiles,
    statusMessage
  } = useChat();

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  
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
      sendMessage();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addFile(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toolbarItems = [
    { icon: FileText, label: 'Templates', onClick: () => setIsTemplateModalOpen(true) },
    { icon: Wand2, label: 'Otimizar Prompt', onClick: () => setIsOptimizeModalOpen(true) },
    { icon: Save, label: 'Salvar Conversa', onClick: () => console.log('Salvar') },
    { icon: Share2, label: 'Compartilhar', onClick: () => console.log('Compartilhar') },
    { icon: RotateCcw, label: 'Reiniciar Conversa', onClick: () => newConversation() },
  ];

  return (
    <aside className="fixed lg:relative bottom-0 right-0 w-full lg:w-[450px] lg:h-full h-[60vh] lg:h-full bg-[#111111] border-l border-gray-800 flex flex-col z-[60] shrink-0 transition-all duration-300">
      <div className="h-12 sm:h-14 flex items-center justify-between px-4 sm:px-6 border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
          <div className="flex flex-col">
            <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-tighter leading-none">Núcleo Tessy</h2>
            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-0.5">Operação Sincronizada</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest">STABLE</span>
        </div>
      </div>
      
      {children}

      <div className="flex-1 overflow-hidden flex flex-col relative bg-[#0f0f0f]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-6">
          {currentConversation?.turns.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-25 px-8">
              <MessageSquare size={32} className="mb-4 text-emerald-500" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Canal de Comunicação Aberto</p>
            </div>
          )}

          {currentConversation?.turns.map((turn) => (
            <div key={turn.id} className="space-y-4 animate-fade-in">
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2 mb-0.5">
                   <span className="text-[8px] font-black text-gray-600 uppercase">Operador</span>
                   <User size={10} className="text-gray-600" />
                </div>
                <div className="max-w-[85%] bg-emerald-600/5 border border-emerald-500/10 p-2.5 text-[12px] text-gray-300 rounded-sm">
                  {turn.userMessage}
                </div>
              </div>

              <div className="flex flex-col items-start gap-1.5">
                <div className="flex items-center gap-2 mb-0.5">
                   <Bot size={10} className="text-emerald-500" />
                   <span className="text-[8px] font-black text-emerald-500 uppercase">Tessy Alpha</span>
                </div>
                <div className="max-w-[95%] bg-[#151515] border border-gray-800 p-3.5 text-[13px] text-gray-300 leading-relaxed shadow-sm rounded-sm prose prose-invert prose-sm">
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
                  
                  {turn.groundingChunks && turn.groundingChunks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800/50">
                      <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <Globe size={10} /> Fontes
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {turn.groundingChunks.map((chunk, idx) => chunk.web ? (
                          <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[8px] font-black uppercase px-2 py-1 bg-black/40 border border-emerald-500/10 text-emerald-500 hover:border-emerald-500 transition-all">
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
            <div className="flex flex-col items-start gap-2 animate-pulse">
              <div className="flex items-center gap-2">
                 <Bot size={10} className="text-amber-500" />
                 <span className="text-[8px] font-black text-amber-500 uppercase">Gerando...</span>
              </div>
              <div className="w-[60%] h-4 bg-[#151515] border border-gray-800 rounded-sm"></div>
            </div>
          )}
        </div>

        {/* Toolbar Integration */}
        <div className="px-4 py-2 border-t border-gray-800 bg-[#0a0a0a] flex items-center justify-around shrink-0">
          {toolbarItems.map((item, idx) => (
            <button 
              key={idx}
              onClick={item.onClick}
              title={item.label}
              className="p-2 text-gray-500 hover:text-emerald-500 transition-all hover:bg-emerald-500/5 relative group"
            >
              <item.icon size={20} />
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black border border-gray-700 text-[7px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 bg-[#0a0a0a] border-t border-gray-800 space-y-3 shrink-0">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {attachedFiles.map(file => (
                <div key={file.id} className="relative group">
                  <div className="text-[8px] font-black uppercase px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5">
                    {file.name}
                    <button onClick={() => removeFile(file.id)} className="hover:text-red-500">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-2 bg-[#151515] border border-gray-800 p-2 focus-within:border-emerald-500/30 transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-500 hover:text-emerald-500 transition-all shrink-0"
            >
              <Paperclip size={18} />
            </button>
            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" />
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Transmitir..."
              className="flex-1 bg-transparent border-none outline-none text-gray-200 text-[13px] resize-none max-h-24 custom-scrollbar py-1"
              rows={1}
            />
            
            <button 
              onClick={() => sendMessage()}
              disabled={isLoading || isUploadingFiles || (!inputText.trim() && attachedFiles.length === 0)}
              className={`p-1.5 transition-all ${
                (!inputText.trim() && attachedFiles.length === 0) ? 'text-gray-700' : 'text-emerald-500 hover:text-emerald-400'
              }`}
            >
              <Send size={18} />
            </button>
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
    </aside>
  );
};

export default CoPilot;