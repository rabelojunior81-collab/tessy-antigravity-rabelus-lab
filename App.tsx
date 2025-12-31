
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ProjectSwitcher from './components/ProjectSwitcher';
import ProjectModal from './components/ProjectModal';
import { DateAnchor } from './components/DateAnchor';
import { db, migrateToIndexedDB, getGitHubToken } from './services/dbService';
import { RepositoryItem, Conversation } from './types';

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
import FactorPanel from './components/FactorPanel';
import GitHubTokenModal from './components/GitHubTokenModal';

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
  handleNewConversation: () => void;
  handleSwitchProject: (id: string) => void;
  handleOpenProjectModal: (id?: string | null) => void;
}> = (props) => {
  const { viewerAberto } = useViewer();
  const { currentConversation, loadConversation, deleteConversation, setInputText } = useChat();

  const handleSelectItem = useCallback((item: RepositoryItem) => {
    if (item.content) {
      setInputText(item.content);
    }
  }, [setInputText]);

  const viewerContent = useMemo(() => {
    switch (viewerAberto) {
      case 'history':
        return (
          <HistoryViewer 
            currentProjectId={props.currentProjectId} 
            activeId={currentConversation?.id || ''} 
            onLoad={loadConversation} 
            onDelete={deleteConversation}
            onNew={props.handleNewConversation}
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
            onSwitch={props.handleSwitchProject}
            onOpenModal={() => props.handleOpenProjectModal()}
            onEditProject={(id) => props.handleOpenProjectModal(id)}
          />
        );
      case 'controllers':
        // Legacy FactorPanel if needed, but we now have Controllers.tsx in CoPilot
        return <div className="p-8 text-[10px] font-black uppercase text-gray-500 tracking-widest">Os controladores foram movidos para o painel lateral direito (CoPilot).</div>;
      case 'github':
        return <GitHubViewer />;
      default:
        return null;
    }
  }, [viewerAberto, props, currentConversation, loadConversation, deleteConversation, handleSelectItem]);

  return <MainLayout viewerContent={viewerContent} />;
};

const AppContent: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentProjectId, setCurrentProjectId] = useState('default-project');
  const [isRotatingTheme, setIsRotatingTheme] = useState(false);
  
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
      <div className="h-screen w-full flex flex-col items-center justify-center bg-antigravity-bg text-emerald-500">
        <LoadingSpinner />
        <p className="mt-4 font-black uppercase tracking-widest text-[10px] animate-pulse">Iniciando Núcleo Antigravity...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-emerald-600/30 bg-antigravity-bg text-gray-100">
      <header className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-xl z-[60] shrink-0">
        <div className="flex items-center space-x-4 min-w-0">
          <TessyLogo />
          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-black tracking-tight leading-none text-white uppercase glow-text-green truncate">
              tessy <span className="hidden xs:inline text-emerald-500 font-light italic text-[10px] sm:text-xs lowercase">by rabelus lab</span>
            </h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <ProjectSwitcher currentProjectId={currentProjectId} onSwitch={handleSwitchProject} onOpenModal={() => handleOpenProjectModal()} onEditProject={(id) => handleOpenProjectModal(id)} />
          <DateAnchor groundingEnabled={groundingStatus} />
        </div>
        
        <div className="flex items-center space-x-3">
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
          handleNewConversation={newConversation}
          handleSwitchProject={handleSwitchProject}
          handleOpenProjectModal={handleOpenProjectModal}
        />
      </div>

      <footer className="h-8 border-t border-gray-800 bg-[#0a0a0a] px-6 flex items-center justify-between text-[8px] text-gray-500 font-black tracking-[0.2em] shrink-0 z-[60]">
        <div className="flex items-center space-x-6">
          <span className="uppercase">© 2024 RABELUS LAB</span>
        </div>
        <div className="flex items-center space-x-8">
          <span className="uppercase text-emerald-500 font-black">NÚCLEO ANTIGRAVITY ATIVO</span>
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
