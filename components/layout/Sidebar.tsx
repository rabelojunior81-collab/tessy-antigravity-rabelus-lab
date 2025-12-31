
import React from 'react';
import { Clock, Library, Folder, Sliders, Github, X } from 'lucide-react';
import { useViewer } from '../../hooks/useViewer';
import { ViewerType, useLayoutContext } from '../../contexts/LayoutContext';

const Sidebar: React.FC = () => {
  const { viewerAberto, abrirViewer } = useViewer();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useLayoutContext();

  const items: { id: ViewerType; icon: React.FC<any>; label: string }[] = [
    { id: 'projects', icon: Folder, label: 'Protocolos' },
    { id: 'history', icon: Clock, label: 'Histórico' },
    { id: 'library', icon: Library, label: 'Biblioteca' },
    { id: 'controllers', icon: Sliders, label: 'Controles' },
    { id: 'github', icon: Github, label: 'GitHub' },
  ];

  const sidebarClasses = `
    fixed md:relative top-0 left-0 h-full bg-[#0a0a0a] border-r border-gray-800 
    flex flex-col items-center py-6 gap-6 z-[80] shrink-0 transition-transform duration-300
    ${isMobileMenuOpen ? 'translate-x-0 w-[80px]' : '-translate-x-full md:translate-x-0 w-[60px]'}
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[75] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        {isMobileMenuOpen && (
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-gray-500 hover:text-white mb-4"
          >
            <X size={24} />
          </button>
        )}

        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => abrirViewer(item.id)}
            title={item.label}
            className={`sidebar-icon p-2.5 rounded-none transition-all duration-200 group relative ${
              viewerAberto === item.id 
                ? 'text-emerald-500 bg-emerald-500/10 border-r-2 border-emerald-500' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <item.icon size={22} strokeWidth={2.5} />
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-gray-700">
              {item.label}
            </span>
          </button>
        ))}
      </aside>
    </>
  );
};

export default Sidebar;
