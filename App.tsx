
import React, { useState, useRef, useEffect, useCallback, Suspense, lazy, useMemo } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import HistorySidebar from './components/HistorySidebar';
import Canvas from './components/Canvas';
import FactorPanel from './components/FactorPanel';
import ProjectSwitcher from './components/ProjectSwitcher';
import ProjectModal from './components/ProjectModal';
import { DateAnchor } from './components/DateAnchor';
import { interpretIntent, applyFactorsAndGenerate, optimizePrompt } from './services/geminiService';
import { db, migrateToIndexedDB, generateUUID, getGitHubToken } from './services/dbService';
import { Factor, RepositoryItem, AttachedFile, OptimizationResult, ConversationTurn, Conversation } from './types';

// Lazy Loaded Components
const RepositoryBrowser = lazy(() => import('./components/RepositoryBrowser'));
const OptimizationModal = lazy(() => import('./components/OptimizationModal'));
const ProjectDashboard = lazy(() => import('./components/ProjectDashboard'));
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
  <div className="relative w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
        </linearGradient>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#84cc16', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#84cc16', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#logoGrad)" strokeWidth="0.8" strokeDasharray="2 2" className="animate-[spin_25s_linear_infinite]" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="url(#logoGrad2)" strokeWidth="0.5" strokeDasharray="3 1" className="animate-[spin_18s_linear_infinite_reverse]" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#10b981" strokeWidth="0.3" strokeDasharray="1 3" className="animate-[spin_12s_linear_infinite]" />
      <circle cx="50" cy="50" r="10" fill="url(#centerGlow)" className="animate-pulse-soft" />
      <path d="M50 15 L50 25 M50 85 L50 80 M30 30 L45 35 M70 30 L55 35 M30 70 L45 75 M70 70 L55 75" stroke="#10b981" strokeWidth="0.3" strokeDasharray="1 2" opacity="0.4" className="animate-pulse" />
      <path d="M25 25 H75 V35 H55 V80 H45 V35 H25 Z" fill="url(#logoGrad)" />
      <circle cx="50" cy="15" r="3.5" fill="#84cc16" className="animate-pulse" />
      <circle cx="50" cy="85" r="3.5" fill="#14b8a6" className="animate-pulse" />
    </svg>
  </div>
));

const AccordionHeader = React.memo(({ title, isOpen, onClick }: { title: string, isOpen: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between px-6 py-5 bg-white/40 dark:bg-slate-900/40 hover:bg-emerald-500/10 transition-all duration-300 border-b-2 lg:border-b border-emerald-600/15 group cursor-pointer"
  >
    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
      {title}
    </span>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={`h-4 w-4 text-emerald-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
      fill="none" viewBox="0 0 24 24" stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
));

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

  const [expandedSections, setExpandedSections] = useState({
    history: true,
    library: false,
    projects: false
  });
  
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [isFactorsMobileOpen, setIsFactorsMobileOpen] = useState(false);
  
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

  const toggleSection = useCallback((section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
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
    setIsSidebarMobileOpen(false);
    setIsFactorsMobileOpen(false);
    setTimeout(() => textInputRef.current?.focus(), 10);
  }, [currentProjectId]);

  const handleSwitchProject = useCallback(async (id: string) => {
    setCurrentProjectId(id);
    db.settings.put({ key: 'tessy-current-project', value: id });
    
    // Check GitHub token for the new project
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

  // Debounced persistence for factors to avoid DB bottleneck during slider movement
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

    const maxSizeByType: Record<string, number> = {
      image: 20 * 1024 * 1024,
      document: 20 * 1024 * 1024,
      text: 20 * 1024 * 1024,
      audio: 20 * 1024 * 1024,
      video: 100 * 1024 * 1024,
      default: 20 * 1024 * 1024
    };

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

      let category = 'default';
      if (file.type.startsWith('image/')) category = 'image';
      else if (file.type.startsWith('video/')) category = 'video';
      else if (file.type.startsWith('audio/')) category = 'audio';
      else if (file.type.startsWith('text/') || file.type.includes('json') || file.type.includes('javascript')) category = 'text';
      else if (file.type.includes('pdf')) category = 'document';

      const maxSize = maxSizeByType[category] || maxSizeByType.default;

      if (file.size > maxSize) {
        showToast(`Arquivo muito grande: ${file.name}. Limite: ${maxSize / (1024 * 1024)}MB`, 'error');
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
    setIsSidebarMobileOpen(false);
  }, []);

  const handleLoadConversationFromHistory = useCallback((conversation: Conversation) => {
    setCurrentConversation(conversation);
    setResult('');
    setInputText('');
    setAttachedFiles([]);
    setStatusMessage('PRONTO');
    setIsSidebarMobileOpen(false);
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

  const handleEditProjectInDashboard = useCallback((id: string) => handleOpenProjectModal(id), [handleOpenProjectModal]);
  const handleOpenLibraryInDashboard = useCallback(() => setExpandedSections(p => ({...p, library: true})), []);
  const handleRefreshHistoryInDashboard = useCallback(() => setHistoryRefreshKey(p => p + 1), []);

  const renderAccordionContent = useCallback((section: keyof typeof expandedSections) => {
    switch (section) {
      case 'history':
        return <HistorySidebar currentProjectId={currentProjectId} activeId={currentConversation?.id || ''} onLoad={handleLoadConversationFromHistory} onDelete={handleDeleteConversationFromHistory} refreshKey={historyRefreshKey} onClose={() => setIsSidebarMobileOpen(false)} />;
      case 'library':
        return <RepositoryBrowser currentProjectId={currentProjectId} onSelectItem={handleSelectItem} refreshKey={refreshKey} onClose={() => setIsSidebarMobileOpen(false)} />;
      case 'projects':
        return <ProjectDashboard projectId={currentProjectId} onNewConversation={handleNewConversation} onOpenLibrary={handleOpenLibraryInDashboard} onRefreshHistory={handleRefreshHistoryInDashboard} onEditProject={handleEditProjectInDashboard} />;
      default:
        return null;
    }
  }, [currentProjectId, currentConversation?.id, handleLoadConversationFromHistory, handleDeleteConversationFromHistory, historyRefreshKey, handleSelectItem, refreshKey, handleNewConversation, handleOpenLibraryInDashboard, handleRefreshHistoryInDashboard, handleEditProjectInDashboard]);

  const groundingStatus = useMemo(() => factors.find(f => f.id === 'grounding')?.enabled || false, [factors]);

  if (isMigrating) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-emerald-500">
        <LoadingSpinner />
        <p className="mt-4 font-black uppercase tracking-widest text-xs animate-pulse">Migrando dados para IndexedDB...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-emerald-600/30">
      <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 lg:px-8 border-b-2 lg:border-b border-emerald-600/25 bg-white/85 dark:bg-slate-900/60 backdrop-blur-2xl z-40 shrink-0">
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
          <button 
            onClick={() => setIsSidebarMobileOpen(true)}
            className="md:hidden brutalist-button w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600/10 text-emerald-600 border-2 border-emerald-600/20 active:scale-95 transition-all flex items-center justify-center shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <TessyLogo />
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-xl lg:text-2xl font-black tracking-tight leading-none text-slate-800 dark:text-white uppercase glow-text-green truncate">
              tessy <span className="hidden xs:inline text-emerald-600 dark:text-emerald-400 font-light italic text-[10px] sm:text-sm lg:text-lg lowercase">by rabelus lab</span>
            </h1>
            <span className="text-[7px] sm:text-[9px] lg:text-[10px] font-black text-slate-600 dark:text-slate-400 tracking-[0.2em] uppercase mt-0.5 line-clamp-1 max-w-[100px] sm:max-w-[200px] lg:max-w-none">
              {currentConversation?.title || 'Carregando...'}
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 sm:gap-4 lg:gap-6">
          <ProjectSwitcher currentProjectId={currentProjectId} onSwitch={handleSwitchProject} onOpenModal={() => handleOpenProjectModal()} onEditProject={(id) => handleOpenProjectModal(id)} />
          <div className="hidden lg:block">
            <DateAnchor groundingEnabled={groundingStatus} />
          </div>
          
          <button 
            onClick={() => setIsGitHubTokenModalOpen(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center brutalist-button bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-all border-2 lg:border border-emerald-600/20 shrink-0"
            title="Configurações GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-3 lg:space-x-6">
          <div className="md:hidden">
             <ProjectSwitcher currentProjectId={currentProjectId} onSwitch={handleSwitchProject} onOpenModal={() => handleOpenProjectModal()} onEditProject={(id) => handleOpenProjectModal(id)} />
          </div>
          <button 
            onClick={() => setIsFactorsMobileOpen(true)}
            className="md:hidden brutalist-button w-9 h-9 sm:w-10 sm:h-10 bg-teal-600/10 text-teal-600 border-2 border-teal-600/20 active:scale-95 transition-all flex items-center justify-center shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
          <button onClick={toggleTheme} className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center brutalist-button bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border-2 lg:border border-emerald-600/25 active:scale-90 transition-all shrink-0 ${isRotatingTheme ? 'animate-rotate-theme' : ''}`}>
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>
          <div className="w-8 h-8 sm:w-11 sm:h-11 border-2 lg:border border-emerald-600/25 p-0.5 shadow-[4px_4px_0_rgba(16,185,129,0.15)] bg-white/85 dark:bg-slate-950/40 shrink-0 overflow-hidden hidden xs:block">
            <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=tessy-green&backgroundColor=10b981`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${isSidebarMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsSidebarMobileOpen(false)}></div>
          <div className={`absolute top-0 left-0 h-full w-[85%] max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ${isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-full flex flex-col overflow-hidden">
              <div className="p-5 border-b-2 border-emerald-600/15 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Protocolos</span>
                <button onClick={() => setIsSidebarMobileOpen(false)} className="p-2 text-slate-500 hover:text-red-500 transition-colors cursor-pointer active:scale-90"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <AccordionHeader title="Histórico" isOpen={expandedSections.history} onClick={() => toggleSection('history')} />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedSections.history ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  {renderAccordionContent('history')}
                </div>
                <AccordionHeader title="Biblioteca" isOpen={expandedSections.library} onClick={() => toggleSection('library')} />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedSections.library ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  {renderAccordionContent('library')}
                </div>
                <AccordionHeader title="Projetos" isOpen={expandedSections.projects} onClick={() => toggleSection('projects')} />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedSections.projects ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <Suspense fallback={<LoadingSpinner />}>
                    {renderAccordionContent('projects')}
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden md:flex flex-col w-[25%] lg:w-[18%] border-r-2 lg:border-r border-emerald-600/15 glass-panel !border-t-0 !border-b-0 overflow-y-auto custom-scrollbar">
          <AccordionHeader title="Histórico" isOpen={expandedSections.history} onClick={() => toggleSection('history')} />
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedSections.history ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {renderAccordionContent('history')}
          </div>
          <AccordionHeader title="Biblioteca" isOpen={expandedSections.library} onClick={() => toggleSection('library')} />
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedSections.library ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {renderAccordionContent('library')}
          </div>
          <AccordionHeader title="Projetos" isOpen={expandedSections.projects} onClick={() => toggleSection('projects')} />
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${expandedSections.projects ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <Suspense fallback={<LoadingSpinner />}>
              {renderAccordionContent('projects')}
            </Suspense>
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0">
          {currentConversation && (
            <Canvas 
              result={result} isLoading={isLoading} isOptimizing={isOptimizing} isUploadingFiles={isUploadingFiles}
              onSavePrompt={handleSaveToRepository} onOptimize={handleOptimize}
              attachedFiles={attachedFiles} onRemoveFile={handleRemoveFile}
              conversationHistory={currentConversation.turns}
              onNewConversation={handleNewConversation}
              inputText={inputText} setInputText={setInputText}
              fileInputRef={fileInputRef} textInputRef={textInputRef}
              handleFileUpload={handleFileUpload} handleInterpret={handleInterpret}
              handleKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleInterpret();
                }
              }}
              pendingUserMessage={pendingUserMessage}
              pendingFiles={pendingFiles}
              factors={factors}
              conversationTitle={currentConversation.title}
              conversationId={currentConversation.id}
              onImportSuccess={handleLoadConversationFromHistory}
            />
          )}
        </section>

        <div className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${isFactorsMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsFactorsMobileOpen(false)}></div>
          <div className={`absolute top-0 right-0 h-full w-[85%] max-w-[320px] bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ${isFactorsMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
             <div className="h-full flex flex-col overflow-hidden">
                <div className="p-5 border-b border-emerald-600/20 flex justify-between items-center bg-white/95 dark:bg-slate-900/95 shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Controles</span>
                  <button onClick={() => setIsFactorsMobileOpen(false)} className="p-2 text-slate-500 hover:text-red-500 transition-colors cursor-pointer active:scale-90"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                   <FactorPanel factors={factors} onToggle={handleToggleFactor} />
                </div>
             </div>
          </div>
        </div>
        <aside className="hidden md:block w-[30%] lg:w-[22%] border-l-2 lg:border-l border-emerald-600/15 glass-panel !border-t-0 !border-b-0 overflow-y-auto custom-scrollbar">
          <FactorPanel factors={factors} onToggle={handleToggleFactor} />
        </aside>
      </main>

      <footer className="h-8 sm:h-10 border-t-2 lg:border-t border-emerald-600/25 bg-white/85 dark:bg-slate-900/80 px-4 sm:px-8 flex items-center justify-between text-[7px] sm:text-[10px] text-slate-600 dark:text-slate-400 font-black tracking-[0.2em] shrink-0 z-40">
        <div className="flex items-center space-x-2 sm:space-x-6">
          <span className="hidden xs:inline uppercase">© 2024 RABELUS LAB</span>
          <span className="flex items-center space-x-2">
            <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 transition-all duration-500 ${isLoading || isUploadingFiles ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'}`}></span>
            <span className="uppercase text-slate-800 dark:text-white truncate max-w-[70px] xs:max-w-[100px] sm:max-w-none transition-colors duration-300">MOTOR: {isUploadingFiles ? 'CARREGANDO' : statusMessage}</span>
          </span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-8">
          <span className="hidden md:inline transition-opacity duration-300">PULSE PROTOCOL v3.2.0</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black">SEGURO</span>
        </div>
      </footer>

      {/* Toast Notification System */}
      {toastVisible && (
        <div className={`fixed bottom-12 left-4 right-4 sm:left-auto sm:right-4 z-[100] px-4 py-3 font-bold text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl border-2 animate-slide-in-right ${
          toastType === 'success' ? 'bg-emerald-600 text-white border-emerald-500' :
          toastType === 'error' ? 'bg-red-600 text-white border-red-500' :
          'bg-slate-800 text-white border-slate-700'
        }`}>
          <div className="flex items-center gap-2">
            {toastType === 'success' && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            {toastMessage}
          </div>
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

      {/* PROJECT MODAL INJECTED AT ROOT LEVEL FOR CORRECT Z-INDEX AND POSITIONING */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectId={editingProjectId}
        onSuccess={handleProjectSuccess}
      />
    </div>
  );
};

export default App;
