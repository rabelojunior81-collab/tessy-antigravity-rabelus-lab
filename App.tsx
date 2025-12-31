import React, { useState, useRef, useEffect, useCallback, Suspense, lazy, useMemo } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import Canvas from './components/Canvas';
import FactorPanel from './components/FactorPanel';
import ProjectSwitcher from './components/ProjectSwitcher';
import ProjectModal from './components/ProjectModal';
import { DateAnchor } from './components/DateAnchor';
import { interpretIntent, applyFactorsAndGenerate, optimizePrompt } from './services/geminiService';
import { db, migrateToIndexedDB, generateUUID, getGitHubToken } from './services/dbService';
import { Factor, RepositoryItem, AttachedFile, OptimizationResult, ConversationTurn, Conversation } from './types';

// Layout Imports
import { LayoutProvider } from './contexts/LayoutContext';
import { GitHubProvider } from './contexts/GitHubContext';
import MainLayout from './components/layout/MainLayout';
import { useViewer } from './hooks/useViewer';

// Viewers
import HistoryViewer from './components/viewers/HistoryViewer';
import LibraryViewer from './components/viewers/LibraryViewer';
import ProjectsViewer from './components/viewers/ProjectsViewer';
import GitHubViewer from './components/viewers/GitHubViewer';

// Lazy Loaded Components
const OptimizationModal = lazy(() => import('./components/OptimizationModal'));
const GitHubTokenModal = lazy(() => import('./components/GitHubTokenModal'));

const INITIAL_FACTORS: Factor[] = [
  { id: 'prof', type: 'toggle', label: 'Tom Profissional', enabled: false },
  { id: 'flash', type: 'toggle', label: 'Modelo Flash', enabled: true },
  { id: 'code', type: 'toggle', label: 'Formatação de Código', enabled: false },
  { id: 'grounding', type: 'toggle', label: 'Busca em Tempo Real', enabled: true },
  { id: 'detail_level', type: 'slider', label: 'Nível de Detalhe', enabled: true, value: 3, min: 1, max: 5 },
  { id: 'audience', type: 'dropdown', label: 'Público-Alvo', enabled: true, value: 'intermediario', options: ['iniciante', 'intermediario', 'avancado', 'especialista'] },
  { id: 'context', type: 'text', label: 'Contexto Adicional', enabled: true, value: '' },
];

const TessyLogo = React.memo(() => (
  <div className="relative w-8 h-8 sm:w-10 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#logoGrad)" strokeWidth="1" strokeDasharray="2 2" className="animate-[spin_25s_linear_infinite]" />
      <path d="M25 25 H75 V35 H55 V80 H45 V35 H25 Z" fill="url(#logoGrad)" />
    </svg>
  </div>
));

// Wrapper to inject context-dependent content into MainLayout
const MainContentWrapper: React.FC<{
  currentProjectId: string;
  currentConversation: Conversation | null;
  handleLoadConversationFromHistory: (conv: Conversation) => void;
  handleDeleteConversationFromHistory: (id: string) => void;
  handleSelectItem: (item: RepositoryItem) => void;
  handleNewConversation: () => void;
  handleSwitchProject: (id: string) => void;
  handleOpenProjectModal: (id?: string | null) => void;
  factors: Factor[];
  handleToggleFactor: (id: string, value?: any) => void;
  // Canvas Props
  result: string;
  isLoading: boolean;
  isOptimizing: boolean;
  isUploadingFiles: boolean;
  handleSaveToRepository: any;
  handleOptimize: any;
  attachedFiles: any;
  handleRemoveFile: any;
  inputText: string;
  setInputText: any;
  fileInputRef: any;
  textInputRef: any;
  handleFileUpload: any;
  handleInterpret: any;
  handleKeyDown: any;
  pendingUserMessage: any;
  pendingFiles: any;
}> = (props) => {
  const { viewerAberto } = useViewer();

  const viewerContent = useMemo(() => {
    switch (viewerAberto) {
      case 'history':
        return (
          <HistoryViewer 
            currentProjectId={props.currentProjectId} 
            activeId={props.currentConversation?.id || ''} 
            onLoad={props.handleLoadConversationFromHistory} 
            onDelete={props.handleDeleteConversationFromHistory}
            onNew={props.handleNewConversation}
          />
        );
      case 'library':
        return (
          <LibraryViewer 
            currentProjectId={props.currentProjectId} 
            onSelectItem={props.handleSelectItem}
          />
        );
      case 'projects':
        return (
          <ProjectsViewer 
            currentProjectId={props.currentProjectId} 
            onSwitch={props.handleSwitchProject}
            onOpenModal={() => props.handleOpenProjectModal()}
            onEditProject={(id) => props.handleOpenProjectModal(id)}
          />
        );
      case 'controllers':
        return <FactorPanel factors={props.factors} onToggle={props.handleToggleFactor} />;
      case 'github':
        return <GitHubViewer />;
      default:
        return null;
    }
  }, [viewerAberto, props]);

  const chatContent = props.currentConversation ? (
    <Canvas 
      result={props.result} isLoading={props.isLoading} isOptimizing={props.isOptimizing} isUploadingFiles={props.isUploadingFiles}
      onSavePrompt={props.handleSaveToRepository} onOptimize={props.handleOptimize}
      attachedFiles={props.attachedFiles} onRemoveFile={props.handleRemoveFile}
      conversationHistory={props.currentConversation.turns}
      onNewConversation={props.handleNewConversation}
      inputText={props.inputText} setInputText={props.setInputText}
      fileInputRef={props.fileInputRef} textInputRef={props.textInputRef}
      handleFileUpload={props.handleFileUpload} handleInterpret={props.handleInterpret}
      handleKeyDown={props.handleKeyDown}
      pendingUserMessage={props.pendingUserMessage}
      pendingFiles={props.pendingFiles}
      factors={props.factors}
      conversationTitle={props.currentConversation.title}
      conversationId={props.currentConversation.id}
      onImportSuccess={props.handleLoadConversationFromHistory}
    />
  ) : <LoadingSpinner />;

  return <MainLayout viewerContent={viewerContent} chatContent={chatContent} />;
};

const App: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentProjectId, setCurrentProjectId] = useState('default-project');
  const [isRotatingTheme, setIsRotatingTheme] = useState(false);
  
  // Toast System
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'info' | 'error' | 'success'>('info');

  const showToast = useCallback((message: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  }, []);

  // Modals Global State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isGitHubTokenModalOpen, setIsGitHubTokenModalOpen] = useState(false);

  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [statusMessage, setStatusMessage] = useState('PRONTO');
  const [refreshKey, setRefreshKey] = useState(0);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptModalOpen, setIsOptModalOpen] = useState(false);
  const [lastInterpretation, setLastInterpretation] = useState<any>(null);
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<AttachedFile[]>([]);
  
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [factors, setFactors] = useState<Factor[]>(INITIAL_FACTORS);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    const boot = async () => {
      try {
        await migrateToIndexedDB();
        const themeSetting = await db.settings.get('tessy-theme');
        if (themeSetting) setTheme(themeSetting.value);
        const factorsSetting = await db.settings.get('tessy-factors');
        if (factorsSetting) setFactors(factorsSetting.value);
        const lastProjSetting = await db.settings.get('tessy-current-project');
        let projId = currentProjectId;
        if (lastProjSetting) {
          projId = lastProjSetting.value;
          setCurrentProjectId(projId);
        }
        
        // GitHub Token Logic
        const proj = await db.projects.get(projId);
        if (proj?.githubRepo) {
          const token = await getGitHubToken();
          if (!token) setIsGitHubTokenModalOpen(true);
        }

        const lastConvIdSetting = await db.settings.get('tessy_last_conv_id');
        let lastConv = null;
        if (lastConvIdSetting) {
          lastConv = await db.conversations.get(lastConvIdSetting.value);
        }
        if (lastConv) {
          setCurrentConversation(lastConv);
        } else {
          handleNewConversation();
        }
      } catch (err) {
        console.error("Boot error:", err);
      } finally {
        setIsMigrating(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    db.settings.put({ key: 'tessy-theme', value: theme });
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setIsRotatingTheme(true);
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    setTimeout(() => setIsRotatingTheme(false), 300);
  }, []);

  const handleNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: generateUUID(),
      projectId: currentProjectId,
      title: 'Nova Conversa',
      turns: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setCurrentConversation(newConv);
    setResult('');
    setInputText('');
    setAttachedFiles([]);
    setPendingUserMessage(null);
    setPendingFiles([]);
    setStatusMessage('PRONTO');
    setHistoryRefreshKey(p => p + 1);
    setTimeout(() => textInputRef.current?.focus(), 10);
  }, [currentProjectId]);

  const handleSwitchProject = useCallback(async (id: string) => {
    setCurrentProjectId(id);
    db.settings.put({ key: 'tessy-current-project', value: id });
    const proj = await db.projects.get(id);
    if (proj?.githubRepo) {
      const token = await getGitHubToken();
      if (!token) setIsGitHubTokenModalOpen(true);
    }
    handleNewConversation();
    setRefreshKey(p => p + 1);
    setHistoryRefreshKey(p => p + 1);
  }, [handleNewConversation]);

  const handleOpenProjectModal = useCallback((id: string | null = null) => {
    setEditingProjectId(id);
    setIsProjectModalOpen(true);
  }, []);

  const handleProjectSuccess = useCallback((id: string) => {
    handleSwitchProject(id);
    setIsProjectModalOpen(false);
    setRefreshKey(p => p + 1);
    showToast('Projeto salvo com sucesso!', 'success');
  }, [handleSwitchProject, showToast]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      if (isCtrlOrMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        textInputRef.current?.focus();
      }
      if (isCtrlOrMeta && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [handleNewConversation]);

  useEffect(() => {
    if (!isMigrating) {
      const timer = setTimeout(() => {
        db.settings.put({ key: 'tessy-factors', value: factors });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [factors, isMigrating]);

  useEffect(() => {
    if (!isMigrating && currentConversation) {
      db.conversations.put(currentConversation);
      db.settings.put({ key: 'tessy_last_conv_id', value: currentConversation.id });
      setHistoryRefreshKey(p => p + 1);
    }
  }, [currentConversation?.turns.length, currentConversation?.updatedAt, currentConversation?.id, isMigrating]);

  const handleInterpret = useCallback(async (forcedText?: string) => {
    if (!currentConversation) return;
    const textToUse = forcedText ?? inputText;
    if (!textToUse.trim() && attachedFiles.length === 0) return;
    const currentInput = textToUse;
    const currentFiles = [...attachedFiles];
    setPendingUserMessage(currentInput);
    setPendingFiles(currentFiles);
    setInputText('');
    setAttachedFiles([]);
    setIsLoading(true);
    setStatusMessage('INTERPRETANDO...');
    setResult('');
    try {
      const activeProject = await db.projects.get(currentProjectId);
      const repoPath = activeProject?.githubRepo;
      const githubToken = await getGitHubToken();

      const interpretation = await interpretIntent(currentInput, currentFiles, currentConversation.turns);
      setLastInterpretation(interpretation);
      if (!interpretation) {
        setResult("Não foi possível processar a intenção.");
        setStatusMessage('ERRO');
        return;
      }
      const groundingEnabled = factors.find(f => f.id === 'grounding')?.enabled ?? true;
      setStatusMessage('GERANDO RESPOSTA...');
      const generationResult = await applyFactorsAndGenerate(
        interpretation, 
        factors, 
        currentFiles, 
        currentConversation.turns, 
        groundingEnabled,
        repoPath,
        githubToken
      );
      const newTurn: ConversationTurn = {
        id: generateUUID(),
        userMessage: currentInput,
        tessyResponse: generationResult.text,
        timestamp: Date.now(),
        attachedFiles: currentFiles.length > 0 ? currentFiles : undefined,
        groundingChunks: generationResult.groundingChunks
      };
      setCurrentConversation(prev => {
        if (!prev) return null;
        const isFirstMessage = prev.turns.length === 0;
        let newTitle = prev.title;
        if (isFirstMessage) {
          const rawTitle = currentInput.trim();
          newTitle = rawTitle.substring(0, 50) + (rawTitle.length > 50 ? '...' : '');
        }
        return { ...prev, title: newTitle, turns: [...prev.turns, newTurn], updatedAt: Date.now() };
      });
      setStatusMessage('PRONTO');
    } catch (error) {
      console.error(error);
      setResult("Erro no processamento. Verifique sua conexão.");
      setStatusMessage('ERRO');
      showToast('Falha na sincronização com o núcleo.', 'error');
    } finally {
      setIsLoading(false);
      setPendingUserMessage(null);
      setPendingFiles([]);
    }
  }, [inputText, attachedFiles, currentConversation, factors, currentProjectId, showToast]);

  const handleOptimize = useCallback(async () => {
    if (!currentConversation || currentConversation.turns.length === 0) return;
    const lastTurn = currentConversation.turns[currentConversation.turns.length - 1];
    setIsOptimizing(true);
    try {
      const optimization = await optimizePrompt(lastTurn.userMessage, lastInterpretation, lastTurn.tessyResponse);
      setOptimizationResult(optimization);
      setIsOptModalOpen(true);
    } catch (error) {
      console.error(error);
      showToast('Erro ao otimizar prompt.', 'error');
    } finally {
      setIsOptimizing(false);
    }
  }, [currentConversation, lastInterpretation, showToast]);

  const handleApplyOptimization = useCallback((optimizedPrompt: string) => {
    setIsOptModalOpen(false);
    handleInterpret(optimizedPrompt);
  }, [handleInterpret]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif', 'image/bmp', 'image/svg+xml',
      'application/pdf', 'text/plain', 'text/html', 'text/css', 'text/javascript', 'text/markdown', 'application/json',
      'application/x-python', 'application/x-typescript', 'application/x-java', 'application/x-cpp',
      'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/aac', 'audio/ogg', 'audio/flac',
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm'
    ];

    setIsUploadingFiles(true);
    const fileArray: File[] = Array.from(files);
    let processedCount = 0;

    const checkDone = () => {
      processedCount++;
      if (processedCount === fileArray.length) {
        setIsUploadingFiles(false);
      }
    };

    fileArray.forEach((file: File) => {
      if (!allowedTypes.includes(file.type)) {
        showToast(`Formato não suportado: ${file.name}`, 'error');
        checkDone();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        setAttachedFiles(prev => [...prev, {
          id: generateUUID(),
          projectId: currentProjectId,
          name: file.name,
          mimeType: file.type,
          data: base64Data,
          size: file.size,
          blob: file 
        }]);
        checkDone();
      };
      reader.onerror = () => {
        showToast(`Erro ao ler arquivo: ${file.name}`, 'error');
        checkDone();
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [currentProjectId, showToast]);

  const handleRemoveFile = useCallback((id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleToggleFactor = useCallback((id: string, value?: any) => {
    setFactors(prev => prev.map(f => 
      f.id === id 
        ? { ...f, enabled: value !== undefined ? true : !f.enabled, value: value !== undefined ? value : f.value }
        : f
    ));
  }, []);

  const handleSelectItem = useCallback((item: RepositoryItem) => {
    if (!item.content) return;
    if (item.factors) setFactors(item.factors);
    const newTurn: ConversationTurn = {
      id: generateUUID(),
      userMessage: item.title,
      tessyResponse: item.content,
      timestamp: item.timestamp || Date.now()
    };
    setCurrentConversation(prev => ({
      ...prev!,
      turns: [...prev!.turns, newTurn],
      updatedAt: Date.now()
    }));
    setInputText('');
    setStatusMessage('PRONTO');
  }, []);

  const handleLoadConversationFromHistory = useCallback((conversation: Conversation) => {
    setCurrentConversation(conversation);
    setResult('');
    setInputText('');
    setAttachedFiles([]);
    setStatusMessage('PRONTO');
    db.settings.put({ key: 'tessy_last_conv_id', value: conversation.id });
  }, []);

  const handleDeleteConversationFromHistory = useCallback((id: string) => {
    if (currentConversation?.id === id) handleNewConversation();
    setHistoryRefreshKey(p => p + 1);
    showToast('Conversa excluída.', 'info');
  }, [currentConversation?.id, handleNewConversation, showToast]);

  const handleSaveToRepository = useCallback(async (title: string, description: string, tags: string[]) => {
    if (!currentConversation) return;
    const lastTurn = currentConversation.turns[currentConversation.turns.length - 1];
    const newPrompt: RepositoryItem = {
      id: generateUUID(),
      projectId: currentProjectId,
      title, 
      description,
      content: lastTurn?.tessyResponse || result,
      factors: [...factors],
      tags: tags,
      timestamp: Date.now()
    };
    await db.library.put(newPrompt);
    setRefreshKey(prev => prev + 1);
    showToast('Salvo na Biblioteca!', 'success');
  }, [currentConversation, result, factors, currentProjectId, showToast]);

  const groundingStatus = useMemo(() => factors.find(f => f.id === 'grounding')?.enabled || false, [factors]);

  if (isMigrating) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-antigravity-bg text-emerald-500">
        <LoadingSpinner />
        <p className="mt-4 font-black uppercase tracking-widest text-[10px] animate-pulse">Iniciando Núcleo Antigravity...</p>
      </div>
    );
  }

  return (
    <LayoutProvider>
      <GitHubProvider>
        <div className="h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-emerald-600/30 bg-antigravity-bg text-gray-100">
          <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-xl z-[60] shrink-0">
            <div className="flex items-center space-x-4 min-w-0">
              <TessyLogo />
              <div className="flex flex-col min-w-0">
                <h1 className="text-base sm:text-lg font-black tracking-tight leading-none text-white uppercase glow-text-green truncate">
                  tessy <span className="hidden xs:inline text-emerald-500 font-light italic text-[10px] sm:text-xs lowercase">by rabelus lab</span>
                </h1>
                <span className="text-[7px] sm:text-[9px] font-black text-gray-500 tracking-[0.2em] uppercase mt-0.5 line-clamp-1">
                  {currentConversation?.title || 'Protocolo...'}
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <ProjectSwitcher currentProjectId={currentProjectId} onSwitch={handleSwitchProject} onOpenModal={() => handleOpenProjectModal()} onEditProject={(id) => handleOpenProjectModal(id)} />
              <DateAnchor groundingEnabled={groundingStatus} />
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsGitHubTokenModalOpen(true)}
                className="w-8 h-8 flex items-center justify-center bg-gray-900 text-gray-500 hover:text-emerald-500 border border-gray-800 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              <button onClick={toggleTheme} className={`w-8 h-8 flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 active:scale-90 transition-all ${isRotatingTheme ? 'animate-rotate-theme' : ''}`}>
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
                )}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            <MainContentWrapper 
              currentProjectId={currentProjectId}
              currentConversation={currentConversation}
              handleLoadConversationFromHistory={handleLoadConversationFromHistory}
              handleDeleteConversationFromHistory={handleDeleteConversationFromHistory}
              handleSelectItem={handleSelectItem}
              handleNewConversation={handleNewConversation}
              handleSwitchProject={handleSwitchProject}
              handleOpenProjectModal={handleOpenProjectModal}
              factors={factors}
              handleToggleFactor={handleToggleFactor}
              result={result}
              isLoading={isLoading}
              isOptimizing={isOptimizing}
              isUploadingFiles={isUploadingFiles}
              handleSaveToRepository={handleSaveToRepository}
              handleOptimize={handleOptimize}
              attachedFiles={attachedFiles}
              handleRemoveFile={handleRemoveFile}
              inputText={inputText}
              setInputText={setInputText}
              fileInputRef={fileInputRef}
              textInputRef={textInputRef}
              handleFileUpload={handleFileUpload}
              handleInterpret={handleInterpret}
              handleKeyDown={(e: any) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleInterpret();
                }
              }}
              pendingUserMessage={pendingUserMessage}
              pendingFiles={pendingFiles}
            />
          </div>

          <footer className="h-8 border-t border-gray-800 bg-[#0a0a0a] px-6 flex items-center justify-between text-[8px] text-gray-500 font-black tracking-[0.2em] shrink-0 z-[60]">
            <div className="flex items-center space-x-6">
              <span className="uppercase">© 2024 RABELUS LAB</span>
              <span className="flex items-center space-x-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isLoading || isUploadingFiles ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'}`}></span>
                <span className="uppercase text-white truncate">MOTOR: {isUploadingFiles ? 'CARREGANDO' : statusMessage}</span>
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <span className="uppercase text-emerald-500 font-black">NÚCLEO ATIVO</span>
            </div>
          </footer>

          {/* Global Overlays */}
          {toastVisible && (
            <div className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 font-bold text-[10px] uppercase tracking-widest shadow-2xl border border-emerald-500/20 bg-[#111111] animate-fade-in ${
              toastType === 'success' ? 'text-emerald-400' :
              toastType === 'error' ? 'text-red-400' :
              'text-blue-400'
            }`}>
              {toastMessage}
            </div>
          )}

          <Suspense fallback={<LoadingSpinner />}>
            {isOptModalOpen && optimizationResult && (
              <OptimizationModal isOpen={isOptModalOpen} result={optimizationResult} onClose={() => setIsOptModalOpen(false)} onApply={handleApplyOptimization} />
            )}
            <GitHubTokenModal 
              isOpen={isGitHubTokenModalOpen} 
              onClose={() => setIsGitHubTokenModalOpen(false)} 
              onSuccess={() => { setRefreshKey(k => k + 1); showToast('Token GitHub atualizado!', 'success'); }} 
            />
          </Suspense>

          <ProjectModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            projectId={editingProjectId}
            onSuccess={handleProjectSuccess}
          />
        </div>
      </GitHubProvider>
    </LayoutProvider>
  );
};

export default App;
