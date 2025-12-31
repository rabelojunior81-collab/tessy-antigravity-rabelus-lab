import React from 'react';
import { Clock, Library, Folder, Sliders, Github } from 'lucide-react';
import { useViewer } from '../../hooks/useViewer';
import { ViewerType } from '../../contexts/LayoutContext';

const Sidebar: React.FC = () => {
  const { viewerAberto, abrirViewer } = useViewer();

  const items: { id: ViewerType; icon: React.FC<any>; label: string }[] = [
    { id: 'history', icon: Clock, label: 'Histórico' },
    { id: 'library', icon: Library, label: 'Biblioteca' },
    { id: 'projects', icon: Folder, label: 'Projetos' },
    { id: 'controllers', icon: Sliders, label: 'Controladores' },
    { id: 'github', icon: Github, label: 'GitHub Sync' },
  ];

  return (
    <aside className="w-[60px] h-full bg-[#0a0a0a] border-r border-gray-800 flex flex-col items-center py-6 gap-6 z-50 shrink-0">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => abrirViewer(item.id)}
          title={item.label}
          className={`sidebar-icon p-2.5 rounded-none transition-all duration-200 ${
            viewerAberto === item.id 
              ? 'text-emerald-500 bg-emerald-500/10 border-r-2 border-emerald-500' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <item.icon size={22} strokeWidth={2.5} />
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;
