
import React from 'react';
import { X } from 'lucide-react';
import { useViewer } from '../../hooks/useViewer';

interface ViewerPanelProps {
  title: string;
  children: React.ReactNode;
}

const ViewerPanel: React.FC<ViewerPanelProps> = ({ title, children }) => {
  const { viewerAberto, fecharViewer } = useViewer();

  if (!viewerAberto) return null;

  const panelClasses = `
    h-full w-full
    bg-bg-secondary/60 backdrop-blur-xl border-r border-border-subtle z-[65]
    flex flex-col animate-fade-in
  `;

  return (
    <div className={panelClasses}>
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md shrink-0">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.05em] text-text-primary glow-text-blue">{title}</h3>
        <button 
          onClick={fecharViewer}
          className="p-1.5 text-text-tertiary hover:text-text-primary transition-all active:scale-90"
        >
          <X size={16} strokeWidth={3} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden relative bg-transparent">
        {children}
      </div>
    </div>
  );
};

export default ViewerPanel;
