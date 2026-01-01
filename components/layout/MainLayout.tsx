
import React, { useState, useEffect } from 'react';
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
    larguraViewer, ajustarLarguraViewer, 
    alturaTerminal, ajustarAlturaTerminal, 
    larguraCoPilot, ajustarLarguraCoPilot 
  } = useLayout();

  const getViewerTitle = () => {
    switch(viewerAberto) {
      case 'history': return 'Histórico';
      case 'library': return 'Biblioteca';
      case 'projects': return 'Protocolos';
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
    const startY = e.clientY;
    const startHeight = alturaTerminal;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeight + delta, 150), 400);
      ajustarAlturaTerminal(newHeight);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleCoPilotResize = (e: React.MouseEvent) => {
    e.preventDefault();

    const onMouseMove = (moveEvent: MouseEvent) => {
      // CoPilot is anchored to the right, so its width is window width minus mouse X
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
    <div className="flex h-full w-full overflow-hidden bg-bg-primary">
      <Sidebar />
      
      <main className="flex-1 flex flex-row min-w-0 relative overflow-hidden">
        {/* Viewer Panel with dynamic width */}
        {viewerAberto && (
          <>
            <div style={{ width: `${larguraViewer}px` }} className="h-full shrink-0 flex flex-col">
              <ViewerPanel title={getViewerTitle()}>
                {viewerContent}
              </ViewerPanel>
            </div>
            {/* Viewer Resize Handle */}
            <div 
              onMouseDown={handleViewerResize}
              className="w-1 bg-border-subtle hover:bg-accent-primary cursor-col-resize transition-colors relative group shrink-0 z-50"
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </>
        )}
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-bg-primary">
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <CentralCanvas />
          </div>

          {/* Terminal Resize Handle */}
          <div 
            onMouseDown={handleTerminalResize}
            className="h-1 bg-border-subtle hover:bg-accent-primary cursor-row-resize transition-colors relative group shrink-0 z-50"
          >
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>

          <div style={{ height: `${alturaTerminal}px` }} className="shrink-0 flex flex-col">
            <Terminal />
          </div>
        </div>

        {/* CoPilot Resize Handle */}
        <div 
          onMouseDown={handleCoPilotResize}
          className="w-1 bg-border-subtle hover:bg-accent-primary cursor-col-resize transition-colors relative group shrink-0 z-50"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-accent-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* CoPilot with dynamic width */}
        <div style={{ width: `${larguraCoPilot}px` }} className="h-full shrink-0 flex flex-col">
          <CoPilot />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
