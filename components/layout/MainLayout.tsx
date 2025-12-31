import React from 'react';
import Sidebar from './Sidebar';
import ViewerPanel from './ViewerPanel';
import CentralCanvas from './CentralCanvas';
import Terminal from './Terminal';
import CoPilot from './CoPilot';
import { useViewer } from '../../hooks/useViewer';

interface MainLayoutProps {
  viewerContent: React.ReactNode;
  chatContent: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ viewerContent, chatContent }) => {
  const { viewerAberto } = useViewer();

  const getViewerTitle = () => {
    switch(viewerAberto) {
      case 'history': return 'Histórico de Sessões';
      case 'library': return 'Biblioteca de Prompts';
      case 'projects': return 'Protocolos Ativos';
      case 'controllers': return 'Controladores de Sistema';
      case 'github': return 'GitHub Sync';
      default: return '';
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-antigravity-bg">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        <ViewerPanel title={getViewerTitle()}>
          {viewerContent}
        </ViewerPanel>
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <CentralCanvas />
          <Terminal />
        </div>
      </main>

      <CoPilot>
        {chatContent}
      </CoPilot>
    </div>
  );
};

export default MainLayout;
