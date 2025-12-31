import React, { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import FilePreview from './FilePreview';
import LoadingSpinner from './LoadingSpinner';
import { AttachedFile, ConversationTurn, Template, Factor, Conversation } from '../types';
import { exportToMarkdown, exportToHTML, exportToPDF, downloadFile } from '../services/exportService';

// Lazy load modals
const SavePromptModal = lazy(() => import('./SavePromptModal'));
const TemplateLibraryModal = lazy(() => import('./TemplateLibraryModal'));
const ShareModal = lazy(() => import('./ShareModal'));

interface CanvasProps {
  result: string;
  isLoading: boolean;
  isOptimizing: boolean;
  isUploadingFiles?: boolean;
  onSavePrompt: (title: string, description: string, tags: string[]) => void;
  onOptimize: () => void;
  attachedFiles: AttachedFile[];
  onRemoveFile: (id: string) => void;
  conversationHistory: ConversationTurn[];
  onNewConversation: () => void;
  inputText: string;
  setInputText: (text: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textInputRef: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInterpret: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  pendingUserMessage?: string | null;
  pendingFiles?: AttachedFile[];
  factors: Factor[];
  conversationTitle: string;
  conversationId: string;
  onImportSuccess?: (conv: Conversation) => void;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('video/')) return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
  );
  if (mimeType.startsWith('audio/')) return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
  );
  if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('javascript')) return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
  );
};

const Canvas: React.FC<CanvasProps> = ({ 
  result, isLoading, isOptimizing, isUploadingFiles, onSavePrompt, onOptimize, attachedFiles, onRemoveFile,
  conversationHistory, onNewConversation, inputText, setInputText, fileInputRef, textInputRef,
  handleFileUpload, handleInterpret, handleKeyDown, pendingUserMessage, pendingFiles,
  factors, conversationTitle, conversationId, onImportSuccess
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isPulsingCopy, setIsPulsingCopy] = useState(false);
  const [isPulsingExec, setIsPulsingExec] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [conversationHistory, isLoading, result, pendingUserMessage]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = useCallback(() => {
    const lastTurn = conversationHistory[conversationHistory.length - 1];
    const textToCopy = result || (lastTurn ? lastTurn.tessyResponse : "");
    if (!textToCopy) return;

    setIsPulsingCopy(true);
    setTimeout(() => setIsPulsingCopy(false), 300);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      const el = document.createElement('textarea');
      el.value = textToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result, conversationHistory]);

  const onExecClick = useCallback(() => {
    setIsPulsingExec(true);
    setTimeout(() => setIsPulsingExec(false), 200);
    handleInterpret();
  }, [handleInterpret]);

  const handleExportMarkdown = useCallback(() => {
    const content = exportToMarkdown(conversationHistory, factors, conversationTitle);
    downloadFile(content, `${conversationTitle.replace(/\s+/g, '_')}.md`, 'text/markdown');
    setShowExportMenu(false);
  }, [conversationHistory, factors, conversationTitle]);

  const handleExportHTML = useCallback(() => {
    const content = exportToHTML(conversationHistory, factors, conversationTitle);
    downloadFile(content, `${conversationTitle.replace(/\s+/g, '_')}.html`, 'text/html');
    setShowExportMenu(false);
  }, [conversationHistory, factors, conversationTitle]);

  const handleExportPDF = useCallback(async () => {
    const blob = await exportToPDF(conversationHistory, factors, conversationTitle);
    downloadFile(blob, `${conversationTitle.replace(/\s+/g, '_')}.pdf`, 'application/pdf');
    setShowExportMenu(false);
  }, [conversationHistory, factors, conversationTitle]);

  const handleSelectTemplate = useCallback((template: Template) => {
    setInputText(template.content);
    setIsTemplateModalOpen(false);
    setTimeout(() => textInputRef.current?.focus(), 100);
  }, [setInputText, textInputRef]);

  const hasContent = useMemo(() => conversationHistory.length > 0, [conversationHistory.length]);

  return (
    <div className="h-full flex flex-col p-3 sm:p-6 lg:p-8 bg-transparent overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-3 sm:mb-6 z-10 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter glow-text-green shrink-0">Canvas</h2>
          {hasContent && (
            <button onClick={onNewConversation} className="brutalist-button text-[8px] sm:text-[10px] px-2 py-1.5 sm:px-3 bg-red-600/10 text-red-600 font-black uppercase tracking-widest active:scale-95 hover:lg:-translate-y-0.5 transition-all shrink-0">
              Reiniciar
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button onClick={() => setIsTemplateModalOpen(true)} className="brutalist-button text-[8px] sm:text-[10px] px-2 py-2 sm:px-3 bg-emerald-600/10 text-emerald-600 font-black uppercase tracking-widest border-emerald-600/20 active:scale-95 hover:lg:-translate-y-0.5 transition-all">Templates</button>

          {(result || hasContent) && !isLoading && (
            <>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="brutalist-button text-[8px] sm:text-[10px] px-2 py-2 sm:px-3 bg-lime-600/10 text-lime-600 font-black uppercase tracking-widest border-lime-600/20 active:scale-95 hover:lg:-translate-y-0.5 transition-all"
              >
                Salvar
              </button>

              <button 
                onClick={onOptimize} 
                disabled={isOptimizing} 
                className={`brutalist-button text-[8px] sm:text-[10px] px-2 py-2 sm:px-3 font-black uppercase tracking-widest active:scale-95 hover:lg:-translate-y-0.5 relative overflow-hidden transition-all duration-300
                  ${isOptimizing 
                    ? 'bg-amber-500/50 text-white cursor-not-allowed border-amber-500 scale-95' 
                    : 'bg-amber-600/10 text-amber-600 border-amber-600/30 hover:bg-amber-500 hover:text-white lg:hover:shadow-[4px_4px_0_rgba(217,119,6,0.2)]'
                  }`}
              >
                {isOptimizing ? 'Otimizando' : 'Otimizar'}
              </button>
              
              <button onClick={handleCopy} className={`brutalist-button text-[8px] sm:text-[10px] px-2 py-2 sm:px-3 font-black uppercase tracking-widest transition-all hover:lg:-translate-y-0.5 ${isPulsingCopy ? 'animate-pulse-click' : ''} ${copied ? 'bg-emerald-500 text-white lg:shadow-[0_0_10px_#10b981]' : 'bg-emerald-600/10 text-emerald-600'}`}>
                {copied ? 'Copiado' : 'Copiar'}
              </button>

              <div className="relative" ref={exportDropdownRef}>
                <button onClick={() => setShowExportMenu(!showExportMenu)} disabled={!hasContent} className="brutalist-button text-[8px] sm:text-[10px] px-2 py-2 sm:px-3 bg-teal-600/10 text-teal-600 font-black uppercase tracking-widest active:scale-95 hover:lg:-translate-y-0.5 transition-all">Exportar</button>
                {showExportMenu && (
                  <div className="absolute top-full mt-2 right-0 glass-panel py-1 z-50 min-w-[140px] !rounded-none !bg-slate-900/95 !border-emerald-600 animate-fade-in lg:shadow-[10px_10px_0_rgba(0,0,0,0.5)]">
                    <button onClick={handleExportMarkdown} className="w-full text-left px-4 py-3 text-[9px] text-emerald-400 font-black hover:bg-emerald-600/20 uppercase tracking-widest border-b border-emerald-600/10">Markdown</button>
                    <button onClick={handleExportHTML} className="w-full text-left px-4 py-3 text-[9px] text-emerald-400 font-black hover:bg-emerald-600/20 uppercase tracking-widest border-b border-emerald-600/10">HTML</button>
                    <button onClick={handleExportPDF} className="w-full text-left px-4 py-3 text-[9px] text-emerald-400 font-black hover:bg-emerald-600/20 uppercase tracking-widest">PDF</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex-1 w-full glass-panel !rounded-none p-4 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col space-y-5 sm:space-y-8 bg-white/80 dark:bg-slate-900/40 lg:shadow-[12px_12px_0_rgba(16,185,129,0.05)] transition-shadow">
        {conversationHistory.length === 0 && !isLoading && !result && !pendingUserMessage && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 italic text-center px-4 sm:px-12 animate-fade-in">
            <div className="w-10 h-10 sm:w-16 sm:h-16 border-2 sm:border-4 border-emerald-600/20 mb-4 flex items-center justify-center text-emerald-600/25 font-black text-xl sm:text-4xl lg:shadow-[4px_4px_0_rgba(16,185,129,0.1)]">?</div>
            <p className="font-black uppercase tracking-widest text-[8px] sm:text-[10px]">Aguardando sequência de comando...</p>
          </div>
        )}

        {conversationHistory.map((turn) => (
          <div key={turn.id} className="flex flex-col space-y-3 sm:space-y-4 animate-fade-in">
            <div className="self-end max-w-[95%] sm:max-w-[85%] bg-emerald-600/10 border-2 border-emerald-600/20 p-3 sm:p-4 rounded-none text-[11px] sm:text-sm text-slate-800 dark:text-white shadow-[4px_4px_0_rgba(16,185,129,0.1)] lg:shadow-[6px_6px_0_rgba(16,185,129,0.15)]">
              <p className="whitespace-pre-wrap font-medium">{turn.userMessage}</p>
              {turn.attachedFiles && turn.attachedFiles.length > 0 && (
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                  {turn.attachedFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className="relative flex flex-col items-center p-1.5 sm:p-2 bg-white/60 dark:bg-slate-800/40 border border-emerald-600/20 hover:border-emerald-600/40 transition-all cursor-pointer group hover:lg:shadow-[4px_4px_0_rgba(16,185,129,0.2)]"
                      title={`${file.name} (${file.mimeType})`}
                    >
                      {file.mimeType.startsWith('image/') ? (
                        <img 
                          src={`data:${file.mimeType};base64,${file.data}`} 
                          alt={file.name} 
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover border border-emerald-600/20" 
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-emerald-600/5">
                          {getFileIcon(file.mimeType)}
                        </div>
                      )}
                      <span className="mt-1 text-[7px] sm:text-[8px] font-bold uppercase max-w-[48px] sm:max-w-[64px] truncate text-slate-700 dark:text-slate-300">
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="self-start max-w-[95%] sm:max-w-[85%] bg-white/90 dark:bg-slate-800/60 border-2 border-emerald-600/20 p-3.5 sm:p-5 rounded-none text-[11px] sm:text-sm text-slate-800 dark:text-emerald-50 leading-relaxed shadow-[6px_6px_0_rgba(16,185,129,0.1)] lg:shadow-[10px_10px_0_rgba(0,0,0,0.05)]">
              <div className="whitespace-pre-wrap mb-3 sm:mb-4">{turn.tessyResponse}</div>
              {turn.groundingChunks && turn.groundingChunks.length > 0 && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-emerald-600/5 border border-emerald-600/30 rounded-none lg:shadow-inner">
                  <div className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase mb-2">✓ Fontes Confirmadas</div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {turn.groundingChunks.map((chunk, idx) => chunk.web ? (
                      <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-[8px] sm:text-[9px] px-2 py-1 bg-slate-800 text-emerald-400 border border-emerald-600/40 font-bold uppercase truncate max-w-[120px] sm:max-w-[150px] lg:hover:shadow-[0_0_8px_#10b981] transition-shadow">{chunk.web.title}</a>
                    ) : null)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {pendingUserMessage && (
          <div className="flex flex-col space-y-3 sm:space-y-4 animate-fade-in">
            <div className="self-end max-w-[85%] bg-emerald-600/10 border-2 border-emerald-600/10 p-4 text-[11px] italic lg:shadow-[6px_6px_0_rgba(16,185,129,0.05)]">
              {pendingUserMessage}
            </div>
            <div className="self-start p-5 text-[10px] sm:text-xs text-emerald-600 font-black uppercase tracking-[0.2em] animate-pulse glow-text-green">Sincronizando...</div>
          </div>
        )}

        {result && !isLoading && (
           <div className="self-start max-w-[90%] bg-red-600/10 border-2 border-red-600/30 p-5 text-xs text-red-600 font-bold animate-fade-in lg:shadow-[10px_10px_0_rgba(220,38,38,0.1)]">
             <div className="uppercase font-black mb-1">Erro de Processamento</div>
             {result}
           </div>
        )}
      </div>

      <div className="mt-4 sm:mt-8 flex flex-col space-y-2 sm:space-y-3 shrink-0 z-10">
        {isUploadingFiles && (
          <div className="flex items-center gap-3 p-3 bg-emerald-600/10 border-2 border-emerald-600/30 animate-pulse brutalist-panel lg:shadow-[6px_6px_0_rgba(16,185,129,0.1)]">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent animate-spin"></div>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Processando arquivos...</span>
          </div>
        )}
        {attachedFiles.length > 0 && <FilePreview files={attachedFiles} onRemove={onRemoveFile} />}
        <div className="flex items-center gap-2 sm:gap-4 bg-white/90 dark:bg-slate-900/60 backdrop-blur-2xl p-2 sm:p-4 border-2 border-emerald-600/20 shadow-xl focus-within:border-emerald-600 transition-all focus-within:lg:shadow-[8px_8px_0_rgba(16,185,129,0.15)]">
          <button onClick={() => fileInputRef.current?.click()} className="p-2 sm:p-3 text-slate-500 hover:text-emerald-600 transition-all active:scale-90 lg:hover:scale-110 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
          <textarea
            ref={textInputRef as any} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Transmitir comando..."
            className="flex-1 bg-transparent border-none py-2 px-1 focus:outline-none text-[13px] sm:text-base text-slate-800 dark:text-white placeholder-emerald-900/20 font-bold resize-none h-[44px] sm:h-[60px] custom-scrollbar"
            disabled={isLoading || isUploadingFiles}
          />
          <button
            onClick={onExecClick} disabled={isLoading || isUploadingFiles || (!inputText.trim() && attachedFiles.length === 0)}
            className={`bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white text-[9px] sm:text-xs font-black uppercase tracking-widest px-4 sm:px-10 h-[44px] sm:h-[60px] brutalist-button active:scale-95 transition-all shrink-0 lg:shadow-[6px_6px_0_rgba(0,0,0,0.8)] hover:lg:-translate-y-0.5 hover:lg:shadow-[8px_8px_0_rgba(0,0,0,0.9)] ${isPulsingExec ? 'animate-pulse-click-small' : ''}`}
          >
            {isLoading ? '...' : 'Exec'}
          </button>
        </div>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        {isModalOpen && <SavePromptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onSavePrompt} />}
        {isTemplateModalOpen && <TemplateLibraryModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} onSelect={handleSelectTemplate} />}
        {isShareModalOpen && (
          <ShareModal 
            isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} 
            conversationId={conversationId} conversationTitle={conversationTitle} 
            onImportSuccess={onImportSuccess}
          />
        )}
      </Suspense>
    </div>
  );
};

export default React.memo(Canvas);