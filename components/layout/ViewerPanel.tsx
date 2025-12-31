
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
    fixed md:absolute top-0 left-0 md:left-[60px] h-full w-full md:w-[380px] 
    bg-[#111111] border-r border-gray-800 z-[65] shadow-2xl 
    transition-all duration-300 ease-in-out transform
    ${viewerAberto ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
  `;

  return (
    <div className={panelClasses}>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
          <div className="flex flex-col">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500 glow-text-green">{title}</h3>
            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-0.5">Módulo Ativo</span>
          </div>
          <button 
            onClick={fecharViewer}
            className="p-2 text-gray-500 hover:text-white transition-all hover:bg-gray-800 active:scale-90"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative bg-[#0f0f0f]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ViewerPanel;
