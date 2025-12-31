import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import ViewerPanel from './ViewerPanel';
import CentralCanvas from './CentralCanvas';
import Terminal from './Terminal';
import CoPilot from './CoPilot';
import { useViewer } from '../../hooks/useViewer';
import { useLayout } from '../../hooks/useLayout';

interface MainLayoutProps {
  viewerContent: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ viewerContent }) => {
  const { viewerAberto } = useViewer();
  const { 
    larguraViewer, 
    ajustarLarguraViewer, 
    larguraCoPilot, 
    ajustarLarguraCoPilot 
  } = useLayout();

  const [resizingType, setResizingType] = useState<'viewer' | 'copilot' | null>(null);

  const startResizing = (type: 'viewer' | 'copilot') => (e: React.MouseEvent) => {
    e.preventDefault();
    setResizingType(type);
  };

  const stopResizing = useCallback(() => {
    setResizingType(null);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!resizingType) return;

    if (resizingType === 'viewer') {
      // Calculate from the right edge of the sidebar (fixed at 48px now)
      const newWidth = e.clientX - 48;
      if (newWidth >= 250 && newWidth <= 600) {
        ajustarLarguraViewer(newWidth);
      }
    } else if (resizingType === 'copilot') {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 350 && newWidth <= 800) {
        ajustarLarguraCoPilot(newWidth);
      }
    }
  }, [resizingType, ajustarLarguraViewer, ajustarLarguraCoPilot]);

  useEffect(() => {
    if (resizingType) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resizingType, resize, stopResizing]);

  const getViewerTitle = () => {
    switch(viewerAberto) {
      case 'history': return 'Histórico de Sessões';
      case 'library': return 'Biblioteca de Prompts';
      case 'projects': return 'Protocolos Ativos';
      case 'github': return 'GitHub Sync';
      default: return '';
    }
  };

  return (
    <div className={`flex h-full w-full overflow-hidden bg-bg-primary ${resizingType ? 'cursor-col-resize select-none' : ''}`}>
      <Sidebar />
      
      <main className="flex-1 flex flex-row min-w-0 relative overflow-hidden">
        {/* Left Side: Viewer + Resizer */}
        <div className="relative flex flex-row h-full shrink-0">
          <ViewerPanel title={getViewerTitle()}>
            {viewerContent}
          </ViewerPanel>
          
          {viewerAberto && (
            <div 
              onMouseDown={startResizing('viewer')}
              className={`hidden md:block absolute top-0 bottom-0 right-0 w-1 cursor-col-resize z-[70] transition-colors hover:bg-accent-primary/50 ${resizingType === 'viewer' ? 'bg-accent-primary/80' : 'bg-transparent'}`}
              style={{ left: `${larguraViewer + 48}px`, transform: 'translateX(-50%)' }}
            />
          )}
        </div>
        
        {/* Center Side: Canvas + Terminal */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative border-r border-border-subtle">
          <CentralCanvas />
          <Terminal />

          {/* Right Handle for CoPilot */}
          <div 
            onMouseDown={startResizing('copilot')}
            className={`hidden lg:block absolute top-0 bottom-0 right-0 w-1 cursor-col-resize z-[70] transition-colors hover:bg-accent-primary/50 translate-x-1/2 ${resizingType === 'copilot' ? 'bg-accent-primary/80' : 'bg-transparent'}`}
          />
        </div>

        <CoPilot />
      </main>
    </div>
  );
};

export default MainLayout;