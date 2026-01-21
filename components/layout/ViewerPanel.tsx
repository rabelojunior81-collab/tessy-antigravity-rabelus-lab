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

  return (
    <div
      className="w-full h-full glass-panel flex flex-col z-[60] grow-0 overflow-hidden relative transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-0.5 glass-header shrink-0">
        <h3 style={{ color: 'var(--glass-accent)' }} className="text-[9px] uppercase font-bold tracking-widest">{title}</h3>
        <button
          onClick={fecharViewer}
          className="p-0.5 text-glass-muted hover:text-glass transition-all active:scale-90"
        >
          <X size={10} strokeWidth={3} />
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};

export default ViewerPanel;

