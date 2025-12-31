import React from 'react';
import { X } from 'lucide-react';
import { useViewer } from '../../hooks/useViewer';

interface ViewerPanelProps {
  title: string;
  children: React.ReactNode;
}

const ViewerPanel: React.FC<ViewerPanelProps> = ({ title, children }) => {
  const { viewerAberto, fecharViewer } = useViewer();

  return (
    <div 
      className={`absolute top-0 left-[60px] h-full w-[300px] bg-[#111111] border-r border-gray-800 z-40 shadow-2xl transition-transform duration-300 ease-in-out ${
        viewerAberto ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0a0a0a]/50">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">{title}</h3>
          <button 
            onClick={fecharViewer}
            className="p-1 text-gray-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ViewerPanel;
