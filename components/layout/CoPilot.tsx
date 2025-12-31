
import React, { useRef, useEffect } from 'react';
/* Added Globe to the imported icons list from lucide-react */
import { Send, Paperclip, MessageSquare, Bot, User, ChevronRight, Share2, FileText, Download, RotateCcw, Globe } from 'lucide-react';
import { useChat } from '../../contexts/ChatContext';
import ReactMarkdown from 'https://esm.sh/react-markdown@^9.0.1';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow as prismTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

  return (
    <aside className="w-[450px] h-full bg-[#111111] border-l border-gray-800 flex flex-col z-10 shrink-0">
      <div className="h-14 sm:h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-white uppercase tracking-tighter leading-none">Núcleo Tessy</h2>
            <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest mt-0.5">Operador Ativo: Alpha-01</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={newConversation}
            className="p-2 text-gray-500 hover:text-emerald-500 transition-all active:scale-90"
            title="Resetar Protocolo"
          >
            <RotateCcw size={16} />
          </button>
          <div className="h-4 w-px bg-gray-800"></div>
          <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">v3.1 Stable</span>
        </div>
      </div>
      
      {/* Componente de Controladores inserido aqui via children no App.tsx ou diretamente */}
      {children}

      <div className="flex-1 overflow-hidden flex flex-col relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          {currentConversation?.turns.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-8">
              <MessageSquare size={32} className="mb-4 text-emerald-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Aguardando Sequência de Comando...</p>
              <p className="text-[8px] font-medium text-gray-500 mt-2">O contexto do projeto e controladores afetarão a resposta final.</p>
            </div>
          )}

          {currentConversation?.turns.map((turn, i) => (
            <div key={turn.id} className="space-y-4 animate-fade-in">
              {/* User Message */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Você</span>
                   <User size={12} className="text-gray-600" />
                </div>
                <div className="max-w-[85%] bg-emerald-600/10 border border-emerald-500/20 p-3 text-[12px] text-gray-200 rounded-sm shadow-sm">
                  {turn.userMessage}
                </div>
                {turn.attachedFiles && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {turn.attachedFiles.map(f => (
                      <div key={f.id} className="text-[7px] font-black uppercase px-2 py-1 bg-gray-800 border border-gray-700 text-gray-500 flex items-center gap-1.5">
                        <Paperclip size={8} /> {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tessy Message */}
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2 mb-1">
                   <Bot size={12} className="text-emerald-500" />
                   <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Tessy</span>
                </div>
                <div className="max-w-[90%] bg-[#1a1a1a] border border-gray-800 p-4 text-[13px] text-gray-300 leading-relaxed shadow-lg prose prose-invert prose-emerald max-w-none">
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
                    <div className="mt-4 pt-4 border-t border-gray-800 space-y-2">
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Globe size={10} /> Fontes Verificadas
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {turn.groundingChunks.map((chunk, idx) => chunk.web ? (
                          <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[8px] font-black uppercase px-2 py-1 bg-[#0a0a0a] border border-emerald-500/20 text-emerald-500 hover:border-emerald-500 transition-all">
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
              <div className="flex items-center gap-2 mb-1">
                 <Bot size={12} className="text-amber-500" />
                 <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Sincronizando Resposta...</span>
              </div>
              <div className="w-[40%] h-8 bg-[#1a1a1a] border border-gray-800"></div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-5 bg-[#0a0a0a]/80 backdrop-blur-md border-t border-gray-800 space-y-3 shrink-0">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachedFiles.map(file => (
                <div key={file.id} className="relative group">
                  <div className="text-[8px] font-black uppercase px-2 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center gap-2">
                    <FileText size={10} /> {file.name}
                  </div>
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex items-end gap-3 bg-[#151515] border border-gray-800 p-3 focus-within:border-emerald-500/50 transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 text-gray-500 hover:text-emerald-500 transition-all active:scale-90 shrink-0 mb-1"
            >
              <Paperclip size={18} />
            </button>
            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" />
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Transmitir sequência de comando..."
              className="flex-1 bg-transparent border-none outline-none text-gray-200 text-sm font-medium resize-none max-h-32 custom-scrollbar py-1"
              rows={1}
              style={{ height: 'auto', minHeight: '24px' }}
            />
            
            <button 
              onClick={() => sendMessage()}
              disabled={isLoading || isUploadingFiles || (!inputText.trim() && attachedFiles.length === 0)}
              className={`p-1.5 transition-all active:scale-90 shrink-0 mb-1 ${
                (!inputText.trim() && attachedFiles.length === 0) ? 'text-gray-700' : 'text-emerald-500 hover:text-emerald-400'
              }`}
            >
              <Send size={18} strokeWidth={3} />
            </button>
          </div>
          
          <div className="flex items-center justify-between text-[7px] font-black text-gray-600 uppercase tracking-widest px-1">
            <div className="flex items-center gap-3">
              <span>STATUS: {statusMessage}</span>
              <span className="flex items-center gap-1"><ChevronRight size={8} /> {isLoading ? 'BUSY' : 'READY'}</span>
            </div>
            <span>AES-256 ENCRYPTED SSS</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CoPilot;
