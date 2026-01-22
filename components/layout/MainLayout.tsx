import React from 'react';
import Sidebar from './Sidebar';
import ViewerPanel from './ViewerPanel';
import CentralCanvas from './CentralCanvas';
import RealTerminal from './RealTerminal';
import CoPilot from './CoPilot';
import { useViewer } from '../../hooks/useViewer';
import { useLayout } from '../../hooks/useLayout';
import { motion, AnimatePresence } from 'framer-motion';

interface MainLayoutProps {
  currentProjectId: string;
  viewerContent: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  currentProjectId,
  viewerContent
}) => {
  const { viewerAberto } = useViewer();
  const {
    larguraViewer, ajustarLarguraViewer,
    alturaTerminal, ajustarAlturaTerminal,
    larguraCoPilot, ajustarLarguraCoPilot
  } = useLayout();

  const [isTerminalCollapsed, setIsTerminalCollapsed] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);

  const getViewerTitle = () => {
    switch (viewerAberto) {
      case 'history': return 'Histórico';
      case 'library': return 'Biblioteca';
      case 'projects': return 'Projetos';
      case 'github': return 'GitHub Sync';
      default: return '';
    }
  };

  // Resize Handlers
  const handleViewerResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = larguraViewer;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + delta, 200), 400);
      ajustarLarguraViewer(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleTerminalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = isTerminalCollapsed ? 26 : alturaTerminal;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const rawHeight = startHeight + delta;

      if (rawHeight < 60) {
        if (!isTerminalCollapsed) setIsTerminalCollapsed(true);
      } else {
        if (isTerminalCollapsed) setIsTerminalCollapsed(false);
        const newHeight = Math.min(Math.max(rawHeight, 60), 600);
        ajustarAlturaTerminal(newHeight);
      }
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleCoPilotResize = (e: React.MouseEvent) => {
    e.preventDefault();

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(Math.max(window.innerWidth - moveEvent.clientX, 300), 600);
      ajustarLarguraCoPilot(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-row min-w-0 relative overflow-hidden">
        {/* Viewer Panel */}
        <AnimatePresence>
          {viewerAberto && (
            <>
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: larguraViewer, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-full shrink-0 flex flex-col overflow-hidden"
              >
                <ViewerPanel title={getViewerTitle()}>
                  {viewerContent}
                </ViewerPanel>
              </motion.div>
              {/* Viewer Resize Handle */}
              <motion.div
                onMouseDown={handleViewerResize}
                className="w-[1px] bg-glass-border hover:bg-accent-primary/50 cursor-col-resize transition-all duration-200 relative group shrink-0 z-[70]"
                title="Redimensionar painel"
              >
                <div className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize"></div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <CentralCanvas
              currentProjectId={currentProjectId}
            />
          </div>

          {/* Terminal Resize Handle */}
          <div
            onMouseDown={handleTerminalResize}
            onDoubleClick={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
            className={`h-[1px] bg-glass-border hover:bg-glass-accent/50 cursor-row-resize transition-all duration-300 relative group shrink-0 z-[70] ${isResizing ? 'bg-glass-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)]' : ''}`}
            title="Arraste para redimensionar ou duplo clique para colapsar"
          >
            <div className="absolute inset-x-0 -top-1 -bottom-1 z-10 cursor-row-resize"></div>
          </div>

          <div
            style={{ height: isTerminalCollapsed ? '26px' : `${alturaTerminal}px` }}
            className={`shrink-0 flex flex-col ${isResizing ? '' : 'transition-all duration-300 ease-in-out'}`}
          >
            <RealTerminal
              isCollapsed={isTerminalCollapsed}
              onToggleCollapse={() => setIsTerminalCollapsed(!isTerminalCollapsed)}
            />
          </div>
        </div>

        {/* CoPilot Resize Handle - Invisible Layout Overlay */}
        <div
          onMouseDown={handleCoPilotResize}
          className="w-[1px] bg-glass-border hover:bg-accent-primary/50 cursor-col-resize transition-all duration-200 relative z-[70] shrink-0 group"
          title="Redimensionar CoPilot"
        >
          <div className="absolute inset-y-0 -left-1 -right-1 z-10 cursor-col-resize"></div>
        </div>

        {/* CoPilot with dynamic width */}
        <div style={{ width: `${larguraCoPilot}px` }} className="h-full shrink-0 flex flex-col pointer-events-none z-[60]">
          <CoPilot />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
