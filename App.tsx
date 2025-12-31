import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ProjectModal from './components/ProjectModal';
import { DateAnchor } from './components/DateAnchor';
import { db, migrateToIndexedDB } from './services/dbService';
import { RepositoryItem } from './types';

// Layout & Context Imports
import { LayoutProvider } from './contexts/LayoutContext';
import { GitHubProvider } from './contexts/GitHubContext';
import { ChatProvider, useChat } from './contexts/ChatContext';
import MainLayout from './components/layout/MainLayout';
import { useViewer } from './hooks/useViewer';

// Viewers
import HistoryViewer from './components/viewers/HistoryViewer';
import LibraryViewer from './components/viewers/LibraryViewer';
import ProjectsViewer from './components/viewers/ProjectsViewer';
import GitHubViewer from './components/viewers/GitHubViewer';
import GitHubTokenModal from './components/GitHubTokenModal';
import { Menu, Moon, Sun, X, Cpu } from 'lucide-react';
import { useLayoutContext } from './contexts/LayoutContext';

const TessyLogo = React.memo(() => (
  <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#logoGrad)" strokeWidth="0.5" strokeDasharray="4 4" className="animate-[spin_40s_linear_infinite]" />
      <path d="M25 25 H75 V35 H55 V85 H45 V35 H25 Z" fill="url(#logoGrad)" />
      <circle cx="50" cy="50" r="2" fill="#10b981" className="animate-pulse" />
    </svg>
  </div>
));

const MainContentWrapper: React.FC<{
  currentProjectId: string;
  handleNewConversation: () => void;
  handleSwitchProject: (id: string) => void;
  handleOpenProjectModal: (id?: string | null) => void;
}> = React.memo((props) => {
  const { viewerAberto, fecharViewer } = useViewer();
  const { currentConversation, loadConversation, deleteConversation, setInputText } = useChat();

  const handleSelectItem = useCallback((item: RepositoryItem) => {
    if (item.content) {
      setInputText(item.content);
      fecharViewer();
    }
  }, [setInputText, fecharViewer]);

  const viewerContent = useMemo(() => {
    switch (viewerAberto) {
      case 'history':
        return (
          <HistoryViewer 
            currentProjectId={props.currentProjectId} 
            activeId={currentConversation?.id || ''} 
            onLoad={(conv) => { loadConversation(conv); fecharViewer(); }} 
            onDelete={deleteConversation}
            onNew={() => { props.handleNewConversation(); fecharViewer(); }}
          />
        );
      case 'library':
        return (
          <LibraryViewer 
            currentProjectId={props.currentProjectId} 
            onSelectItem={handleSelectItem}
          />
        );
      case 'projects':
        return (
          <ProjectsViewer 
            currentProjectId={props.currentProjectId} 
            onSwitch={(id) => { props.handleSwitchProject(id); fecharViewer(); }}
            onOpenModal={() => props.handleOpenProjectModal()}
            onEditProject={(id) => props.handleOpenProjectModal(id)}
          />
        );
      case 'github':
        return <GitHubViewer />;
      default:
        return null;
    }
  }, [viewerAberto, props, currentConversation, loadConversation, deleteConversation, handleSelectItem, fecharViewer]);

  return <MainLayout viewerContent={viewerContent} />;
});

const AppContent: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentProjectId, setCurrentProjectId] = useState('default-project');
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useLayoutContext();
  
  const { newConversation, factors } = useChat();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [isGitHubTokenModalOpen, setIsGitHubTokenModalOpen] = useState(false);

  useEffect(() => {
    const boot = async () => {
      try {
        await migrateToIndexedDB();
        const themeSetting = await db.settings.get('tessy-theme');
        if (themeSetting) setTheme(themeSetting.value);
        const lastProjSetting = await db.settings.get('tessy-current-project');
        if (lastProjSetting) setCurrentProjectId(lastProjSetting.value);
      } catch (err) {
        console.error("Boot error:", err);
      } finally {
        setTimeout(() => setIsMigrating(false), 800);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    db.settings.put({ key: 'tessy-theme', value: theme });
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const handleSwitchProject = useCallback(async (id: string) => {
    setCurrentProjectId(id);
    db.settings.put({ key: 'tessy-current-project', value: id });
    newConversation();
  }, [newConversation]);

  const handleOpenProjectModal = useCallback((id: string | null = null) => {
    setEditingProjectId(id);
    setIsProjectModalOpen(true);
  }, []);

  const groundingStatus = useMemo(() => factors.find(f => f.id === 'grounding')?.enabled || false, [factors]);

  if (isMigrating) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-antigravity-bg">
        <div className="relative mb-8">
           <TessyLogo />
           <div className="absolute inset-0 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin scale-150"></div>
        </div>
        <p className="font-black uppercase tracking-[0.5em] text-[10px] text-emerald-500 animate-pulse-soft">Iniciando Protocolo Tessy...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-emerald-600/30 bg-antigravity-bg text-gray-100">
      <header className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-800 bg-[#0a0a0a]/90 backdrop-blur-xl z-[70] shrink-0">
        <div className="flex items-center space-x-3 sm:space-x-5 min-w-0">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-emerald-500 transition-colors border border-gray-800"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <TessyLogo />
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-xl font-black tracking-tighter leading-none text-white uppercase glow-text-green truncate">
              tessy <span className="text-emerald-500 font-light italic text-[9px] sm:text-xs tracking-widest lowercase opacity-60">alpha v3.1</span>
            </h1>
            <span className="hidden xs:inline text-[7px] font-black uppercase tracking-[0.3em] text-gray-600 mt-1">Rabelus Lab Engine</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-2 border border-emerald-500/10 px-4 py-1.5 bg-emerald-500/5">
             <Cpu size={12} className="text-emerald-500/60" />
             <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest">
                CORE_NUCLEUS_SYNCED
             </div>
          </div>
          <DateAnchor groundingEnabled={groundingStatus} />
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={toggleTheme} 
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-900 border border-gray-800 text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all rounded-sm active:scale-95"
            title="Alternar Tema"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={<LoadingSpinner />}>
          <MainContentWrapper 
            currentProjectId={currentProjectId}
            handleNewConversation={newConversation}
            handleSwitchProject={handleSwitchProject}
            handleOpenProjectModal={handleOpenProjectModal}
          />
        </Suspense>
      </div>

      <footer className="h-7 sm:h-8 border-t border-gray-800 bg-[#070707] px-4 sm:px-6 flex items-center justify-between text-[7px] sm:text-[8px] text-gray-600 font-black tracking-[0.2em] shrink-0 z-[70]">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <span className="uppercase hover:text-emerald-500 transition-colors cursor-default">© 2024 RABELUS LAB</span>
        </div>
        <div className="flex items-center space-x-4 sm:space-x-8">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="uppercase text-emerald-500/80 font-black hidden xs:inline">ANTIGRAVITY_KERNEL_V3.1</span>
          </div>
          <span className="uppercase border-l border-gray-800 pl-4">STATUS: STABLE</span>
        </div>
      </footer>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        projectId={editingProjectId}
        onSuccess={(id) => { handleSwitchProject(id); setIsProjectModalOpen(false); }}
      />
      <GitHubTokenModal 
        isOpen={isGitHubTokenModalOpen} 
        onClose={() => setIsGitHubTokenModalOpen(false)} 
        onSuccess={() => setIsGitHubTokenModalOpen(false)} 
      />
    </div>
  );
};

const App: React.FC = () => {
  const [currentProjectId, setCurrentProjectId] = useState('default-project');

  useEffect(() => {
    const loadProj = async () => {
      const lastProjSetting = await db.settings.get('tessy-current-project');
      if (lastProjSetting) setCurrentProjectId(lastProjSetting.value);
    };
    loadProj();
  }, []);

  return (
    <LayoutProvider>
      <GitHubProvider>
        <ChatProvider currentProjectId={currentProjectId}>
          <AppContent />
        </ChatProvider>
      </GitHubProvider>
    </LayoutProvider>
  );
};

export default App;