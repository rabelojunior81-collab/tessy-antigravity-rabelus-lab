import React from 'react';
import { X } from 'lucide-react';
import { useViewer } from '../../hooks/useViewer';
import { useLayout } from '../../hooks/useLayout';

interface ViewerPanelProps {
  title: string;
  children: React.ReactNode;
}

const ViewerPanel: React.FC<ViewerPanelProps> = ({ title, children }) => {
  const { viewerAberto, fecharViewer } = useViewer();
  const { larguraViewer } = useLayout();

  if (!viewerAberto) return null;

  const panelStyle = {
    width: window.innerWidth < 768 ? '100%' : `${larguraViewer}px`
  };

  const panelClasses = `
    fixed md:absolute top-0 left-0 md:left-[64px] h-full
    bg-bg-secondary border-r border-border-subtle z-[65] shadow-2xl 
    transition-[transform,opacity] duration-300 ease-in-out transform
    ${viewerAberto ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
  `;

  return (
    <div className={panelClasses} style={panelStyle}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between p-7 border-b border-border-subtle bg-bg-secondary/80 backdrop-blur-md shrink-0">
          <div className="flex flex-col">
            <h3 className="text-[14px] font-bold uppercase tracking-[0.05em] text-text-primary glow-text-blue">{title}</h3>
            <span className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest mt-1">Módulo Ativo</span>
          </div>
          <button 
            onClick={fecharViewer}
            className="p-3 text-text-tertiary hover:text-text-primary transition-all hover:bg-bg-tertiary rounded-none active:scale-90"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative bg-bg-secondary">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ViewerPanel;