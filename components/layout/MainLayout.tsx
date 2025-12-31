import React from 'react';
import Sidebar from './Sidebar';
import ViewerPanel from './ViewerPanel';
import CentralCanvas from './CentralCanvas';
import Terminal from './Terminal';
import CoPilot from './CoPilot';
import { useViewer } from '../../hooks/useViewer';

interface MainLayoutProps {
  viewerContent: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ viewerContent }) => {
  const { viewerAberto } = useViewer();

  const getViewerTitle = () => {
    switch(viewerAberto) {
      case 'history': return 'Histórico';
      case 'library': return 'Biblioteca';
      case 'projects': return 'Protocolos';
      case 'github': return 'GitHub Sync';
      default: return '';
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-primary">
      <Sidebar />
      
      <main className="flex-1 flex flex-row min-w-0 relative overflow-hidden">
        <ViewerPanel title={getViewerTitle()}>
          {viewerContent}
        </ViewerPanel>
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative border-r border-border-subtle">
          <CentralCanvas />
          <Terminal />
        </div>

        <CoPilot />
      </main>
    </div>
  );
};

export default MainLayout;