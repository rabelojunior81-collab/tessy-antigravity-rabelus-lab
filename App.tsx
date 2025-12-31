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
  <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#60A5FA', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M25 25 H75 V35 H55 V85 H45 V35 H25 Z" fill="url(#logoGrad)" />
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
        setTimeout(() => setIsMigrating(false), 500);
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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-primary/80 backdrop-blur-md">
        <TessyLogo />
        <p className="mt-4 font-bold uppercase tracking-[0.3em] text-[10px] text-accent-primary animate-pulse-soft">Sincronizando Nucleo...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-accent-primary/30 bg-bg-primary text-text-primary">
      <header className="h-16 flex items-center justify-between px-6 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md z-[70] shrink-0">
        <div className="flex items-center space-x-6 min-w-0">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-tertiary hover:text-accent-primary transition-colors border border-border-subtle bg-bg-tertiary/40 backdrop-blur-lg"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <TessyLogo />
          <div className="flex flex-col min-w-0">
            <h1 className="text-[16px] font-semibold tracking-tight leading-none text-text-primary uppercase glow-text-blue truncate">
              tessy <span className="text-accent-primary font-normal text-[10px] tracking-widest lowercase opacity-60">alpha v3.1</span>
            </h1>
            <span className="hidden xs:inline text-[11px] font-normal uppercase tracking-[0.1em] text-text-tertiary mt-1">Rabelus Lab Engine</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-9">
          <DateAnchor groundingEnabled={groundingStatus} />
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme} 
            className="w-10 h-10 flex items-center justify-center bg-bg-secondary/60 backdrop-blur-xl border border-border-subtle text-accent-primary hover:border-accent-primary transition-all active:scale-95"
            title="Alternar Tema"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
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

      <footer className="h-8 border-t border-border-subtle bg-bg-primary/80 backdrop-blur-md px-6 flex items-center justify-between text-[10px] text-text-tertiary font-semibold tracking-[0.2em] shrink-0 z-[70]">
        <span className="uppercase">© 2024 RABELUS LAB</span>
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-accent-primary animate-pulse"></div>
             <span className="uppercase text-accent-primary hidden xs:inline">STATUS: STABLE</span>
          </div>
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