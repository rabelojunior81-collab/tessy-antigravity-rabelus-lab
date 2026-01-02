import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ProjectModal from './components/ProjectModal';
import { DateAnchor } from './components/DateAnchor';
import { db, migrateToIndexedDB } from './services/dbService';
import { RepositoryItem, Template } from './types';

// Layout & Context Imports
import { LayoutProvider, useLayoutContext } from './contexts/LayoutContext';
import { GitHubProvider } from './contexts/GitHubContext';
import { ChatProvider, useChat } from './contexts/ChatContext';
import MainLayout from './components/layout/MainLayout';
import { useLayout } from './hooks/useLayout';
import { useProjects } from './hooks/useProjects';
import { useViewerRouter } from './hooks/useViewerRouter';

// Modals & Icons
import GitHubTokenModal from './components/GitHubTokenModal';
import { Menu, Moon, Sun, X } from 'lucide-react';

const TessyLogo = React.memo(() => (
  <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(74,158,255,0.5)]">
      <path d="M50 10 L90 90 L10 90 Z" fill="none" stroke="#4a9eff" strokeWidth="8" />
      <path d="M35 60 H65" fill="none" stroke="#4a9eff" strokeWidth="8" />
    </svg>
  </div>
));

const AppContent: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<Template | RepositoryItem | null>(null);
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useLayoutContext();
  const { selecionarArquivo } = useLayout();
  const { newConversation, factors } = useChat();
  const [isGitHubTokenModalOpen, setIsGitHubTokenModalOpen] = useState(false);

  // Hook customizado para gerenciar projetos
  const { 
    currentProjectId, 
    switchProject, 
    isProjectModalOpen, 
    editingProjectId, 
    openProjectModal, 
    closeProjectModal 
  } = useProjects(newConversation);

  useEffect(() => {
    const boot = async () => {
      try {
        await migrateToIndexedDB();
        const themeSetting = await db.settings.get('tessy-theme');
        if (themeSetting) setTheme(themeSetting.value);
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

  const handleProjectSelected = useCallback((id: string) => {
    selecionarArquivo(null);
    setSelectedLibraryItem(null);
    setSelectedProjectId(id || null);
  }, [selecionarArquivo]);

  const handleLibraryItemSelected = useCallback((item: RepositoryItem | Template) => {
    setSelectedLibraryItem(item);
    setSelectedProjectId(null);
    selecionarArquivo(null);
  }, [selecionarArquivo]);

  // Hook customizado para gerenciar o roteamento do painel lateral (viewer)
  const viewerContent = useViewerRouter({
    currentProjectId,
    onProjectSelected: handleProjectSelected,
    onLibraryItemSelected: handleLibraryItemSelected,
    onNewConversation: newConversation,
    onOpenProjectModal: openProjectModal,
    handleSwitchProject: switchProject
  });

  const groundingStatus = useMemo(() => factors.find(f => f.id === 'grounding')?.enabled || false, [factors]);

  if (isMigrating) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-primary">
        <div className="w-12 h-12 flex items-center justify-center animate-pulse">
           <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M50 10 L90 90 L10 90 Z" fill="none" stroke="#4a9eff" strokeWidth="8" />
          </svg>
        </div>
        <p className="mt-6 font-medium uppercase tracking-wide text-[10px] text-accent-primary animate-pulse-soft shadow-sutil">Purging Ghost Components...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-accent-primary/30 bg-bg-primary text-text-primary">
      <header className="h-11 flex items-center justify-between px-6 border-b border-border-visible bg-bg-primary/80 backdrop-blur-md z-[70] shrink-0">
        <div className="flex items-center space-x-4 min-w-0">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-tertiary hover:text-accent-primary transition-colors border border-border-visible bg-bg-secondary/40"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-3">
            <TessyLogo />
            <div className="flex flex-col">
              <h1 className="text-2xl font-light tracking-wide leading-none text-text-primary glow-text-blue shadow-suave">
                tessy
              </h1>
              <span className="text-[10px] font-normal text-text-tertiary mt-0.5 whitespace-nowrap uppercase tracking-wide opacity-60 shadow-sutil">by Rabelus Lab</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-9">
          <DateAnchor groundingEnabled={groundingStatus} />
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme} 
            className="w-10 h-10 flex items-center justify-center bg-bg-secondary border border-border-visible text-accent-primary hover:border-accent-primary transition-all active:scale-95"
            title="Alternar Tema"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={<LoadingSpinner />}>
          <MainLayout 
            currentProjectId={currentProjectId}
            viewerContent={viewerContent} 
            selectedProjectId={selectedProjectId} 
            setSelectedProjectId={setSelectedProjectId} 
            selectedLibraryItem={selectedLibraryItem}
            setSelectedLibraryItem={setSelectedLibraryItem}
          />
        </Suspense>
      </div>

      <footer className="h-5 border-t border-border-visible bg-bg-primary/80 backdrop-blur-md px-6 flex items-center justify-between text-[9px] text-text-tertiary font-normal tracking-wide shrink-0 z-[70]">
        <span className="opacity-40 uppercase shadow-sutil">© 2025 Rabelus Lab System</span>
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-accent-primary animate-pulse shadow-[0_0_8px_#4a9eff]"></div>
             <span className="uppercase text-accent-primary hidden xs:inline shadow-sutil">Nucleus v3.2.1-antigravity Stable</span>
          </div>
        </div>
      </footer>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={closeProjectModal}
        projectId={editingProjectId}
        onSuccess={(id) => { switchProject(id); closeProjectModal(); }}
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
  // O ChatProvider precisa do currentProjectId inicial. Como o boot de configuração é assíncrono,
  // mantemos um estado básico aqui que é atualizado pelo AppContent se necessário,
  // mas o useProjects lidará com a persistência real.
  const [initialProjectId, setInitialProjectId] = useState('default-project');

  useEffect(() => {
    const loadProj = async () => {
      const lastProjSetting = await db.settings.get('tessy-current-project');
      if (lastProjSetting) setInitialProjectId(lastProjSetting.value);
    };
    loadProj();
  }, []);

  return (
    <LayoutProvider>
      <GitHubProvider>
        <ChatProvider currentProjectId={initialProjectId}>
          <AppContent />
        </ChatProvider>
      </GitHubProvider>
    </LayoutProvider>
  );
};

export default App;