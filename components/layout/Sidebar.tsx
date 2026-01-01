import React from 'react';
import { Clock, Library, Folder, Github, Command } from 'lucide-react';
import { useViewer } from '../../hooks/useViewer';
import { ViewerType, useLayoutContext } from '../../contexts/LayoutContext';

const Sidebar: React.FC = () => {
  const { viewerAberto, abrirViewer } = useViewer();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useLayoutContext();

  const items: { id: ViewerType; icon: React.FC<any>; label: string }[] = [
    { id: 'projects', icon: Folder, label: 'Protocolos' },
    { id: 'history', icon: Clock, label: 'Histórico' },
    { id: 'library', icon: Library, label: 'Biblioteca' },
    { id: 'github', icon: Github, label: 'GitHub Sync' },
  ];

  const sidebarClasses = `
    fixed md:relative top-0 left-0 h-full bg-bg-primary border-r border-border-visible 
    flex flex-col items-center py-4 gap-4 z-[80] shrink-0 transition-all duration-300 ease-in-out
    ${isMobileMenuOpen ? 'translate-x-0 w-[48px]' : '-translate-x-full md:translate-x-0 w-[48px]'}
  `;

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[75] md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={sidebarClasses} style={{ width: '48px' }}>
        <div className="flex flex-col items-center gap-2 w-full">
          {items.map((item) => {
            const isActive = viewerAberto === item.id;
            return (
              <button
                key={item.id}
                onClick={() => abrirViewer(item.id)}
                title={item.label}
                className={`w-10 h-10 flex items-center justify-center transition-all duration-200 group relative ${
                  isActive 
                    ? 'text-accent-primary bg-accent-subtle/40' 
                    : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-bg-tertiary border border-border-visible text-text-primary text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 z-[100] shadow-xl backdrop-blur-md">
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent-primary"></div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col items-center gap-2 w-full">
          <button 
            className="w-10 h-10 flex items-center justify-center text-text-tertiary hover:text-accent-primary transition-colors"
            title="Shortcuts"
          >
            <Command size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;