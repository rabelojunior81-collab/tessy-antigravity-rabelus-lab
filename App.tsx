import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import ProjectModal from './components/ProjectModal';
import { DateAnchor } from './components/DateAnchor';
import { db, migrateToIndexedDB } from './services/dbService';
import { RepositoryItem, Template } from './types';
import { autoDocScheduler } from './services/autoDocScheduler';

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
import GeminiTokenModal from './components/modals/GeminiTokenModal';
import PendingActionsModal from './components/modals/PendingActionsModal';
import VisualSettingsModal from './components/modals/VisualSettingsModal';
import AuthPanel from './components/modals/AuthPanel';
import { Menu, Moon, Sun, X, Settings, Palette, BookOpen, Key } from 'lucide-react';
import { VisualProvider, useVisual } from './contexts/VisualContext';
import AutoDocModal from './components/modals/AutoDocModal';

const TessyLogo = React.memo(() => (
  <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 8px var(--glass-accent))' }}>
      <path d="M50 10 L90 90 L10 90 Z" fill="none" stroke="var(--glass-accent)" strokeWidth="8" />
      <path d="M35 60 H65" fill="none" stroke="var(--glass-accent)" strokeWidth="8" />
    </svg>
  </div>
));

const AppContent: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setSelectedProjectId,
    setSelectedLibraryItem,
    isGeminiModalOpen,
    setIsGeminiModalOpen
  } = useLayoutContext();
  const { selecionarArquivo } = useLayout();
  const { newConversation, factors } = useChat();
  const { setIsVisualModalOpen } = useVisual();
  const [isGitHubTokenModalOpen, setIsGitHubTokenModalOpen] = useState(false);
  const [isAutoDocModalOpen, setIsAutoDocModalOpen] = useState(false);
  const [isAuthPanelOpen, setIsAuthPanelOpen] = useState(false);

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

        // Initialize Auto-Documentation Scheduler (on-start sync)
        await autoDocScheduler.initialize();

        const themeSetting = await db.settings.get('tessy-theme');
        if (themeSetting) setTheme(themeSetting.value);
      } catch (err) {
        console.error("Boot error context:", err);
      } finally {
        setTimeout(() => setIsMigrating(false), 800);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    db.settings.put({ key: 'tessy-theme', value: theme }).catch(() => { });
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const handleProjectSelected = useCallback((id: string) => {
    selecionarArquivo(null);
    setSelectedLibraryItem(null);
    setSelectedProjectId(id || null);
  }, [selecionarArquivo, setSelectedLibraryItem, setSelectedProjectId]);

  const handleLibraryItemSelected = useCallback((item: RepositoryItem | Template) => {
    setSelectedLibraryItem(item);
    selecionarArquivo(null);
    // REMOVED: setSelectedProjectId(null) to prevent ChatContext (and input text) from resetting
  }, [selecionarArquivo, setSelectedLibraryItem]);

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
            <path d="M50 10 L90 90 L10 90 Z" fill="none" stroke="var(--glass-accent)" strokeWidth="8" />
          </svg>
        </div>
        <p className="mt-6 font-medium uppercase tracking-widest text-[10px] text-accent-primary animate-pulse-soft">Initializing Nucleus Core...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden font-sans relative">
      {/* Wallpaper Background Layer */}
      <div className="wallpaper-layer" />

      {/* Header - Glass Shell Level */}
      <header className="h-11 flex items-center justify-between pl-0 pr-6 border-b glass-shell z-sticky shrink-0 relative">
        <div className="flex items-center space-x-2 min-w-0">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-glass-muted hover:text-glass-accent transition-colors glass-button"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-1.5 ml-4 md:ml-6">
            <TessyLogo />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight leading-none text-glass">
                tessy
              </h1>
              <span className="text-[9px] font-medium text-glass-muted uppercase tracking-widest opacity-60">Rabelus Lab</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-9">
          <DateAnchor groundingEnabled={groundingStatus} />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsVisualModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center glass-button text-glass-accent"
            title="Configuração Visual"
          >
            <Palette size={16} />
          </button>

          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center glass-button text-glass-accent"
            title="Alternar Tema"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setIsAutoDocModalOpen(true)}
            className="w-8 h-8 flex items-center justify-center glass-button text-glass-accent"
            title="Auto-Documentation"
          >
            <BookOpen size={16} />
          </button>

          <button
            onClick={() => setIsAuthPanelOpen(true)}
            className="w-8 h-8 flex items-center justify-center glass-button text-glass-accent"
            title="Central de Autenticação"
          >
            <Key size={16} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={<LoadingSpinner />}>
          <MainLayout
            currentProjectId={currentProjectId}
            viewerContent={viewerContent}
          />
        </Suspense>
      </div>

      <footer className="h-5 border-t border-border-visible bg-bg-primary/80 backdrop-blur-md px-6 flex items-center justify-between text-[9px] text-text-tertiary font-normal tracking-wide shrink-0 z-sticky">
        <span className="opacity-40 uppercase">© 2025 Rabelus Lab System</span>
        <div className="flex items-center space-x-6">
          <div className="flex items-center gap-2">
            <div style={{ backgroundColor: 'var(--glass-accent)' }} className="w-1.5 h-1.5 animate-pulse"></div>
            <span style={{ color: 'var(--glass-accent)' }} className="uppercase hidden xs:inline">Stable Build v3.2.1</span>
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
      <GeminiTokenModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        onSuccess={() => setIsGeminiModalOpen(false)}
      />
      <PendingActionsModal />
      <VisualSettingsModal />
      <AutoDocModal
        isOpen={isAutoDocModalOpen}
        onClose={() => setIsAutoDocModalOpen(false)}
      />
      <AuthPanel
        isOpen={isAuthPanelOpen}
        onClose={() => setIsAuthPanelOpen(false)}
      />
    </div >
  );
};

const App: React.FC = () => {
  const [initialProjectId, setInitialProjectId] = useState('default-project');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadProj = async () => {
      try {
        const lastProjSetting = await db.settings.get('tessy-current-project');
        if (lastProjSetting) setInitialProjectId(lastProjSetting.value);
      } catch (e) { } finally {
        setIsReady(true);
      }
    };
    loadProj();
  }, []);

  if (!isReady) return null;

  return (
    <VisualProvider>
      <LayoutProvider>
        <GitHubProvider>
          <ChatProvider currentProjectId={initialProjectId}>
            <AppContent />
          </ChatProvider>
        </GitHubProvider>
      </LayoutProvider>
    </VisualProvider>
  );
};

export default App;