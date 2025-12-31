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
    { id: 'github', icon: Github, label: 'GitHub' },
  ];

  const sidebarClasses = `
    fixed md:relative top-0 left-0 h-full bg-bg-secondary/60 backdrop-blur-xl border-r border-border-subtle 
    flex flex-col items-center py-4 gap-4 z-[80] shrink-0 transition-all duration-300 ease-in-out
    ${isMobileMenuOpen ? 'translate-x-0 w-[48px]' : '-translate-x-full md:translate-x-0 w-[48px]'}
  `;

  return (
    <>
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[75] md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="flex flex-col items-center gap-4 w-full">
          {items.map((item) => {
            const isActive = viewerAberto === item.id;
            return (
              <button
                key={item.id}
                onClick={() => abrirViewer(item.id)}
                title={item.label}
                className={`w-10 h-10 flex items-center justify-center transition-all duration-200 group relative ${
                  isActive 
                    ? 'text-accent-primary bg-accent-primary/10' 
                    : 'text-text-tertiary hover:text-accent-primary hover:bg-bg-tertiary/60 hover:backdrop-blur-lg'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                
                <span className="absolute left-full ml-4 px-3 py-1.5 bg-bg-primary/80 backdrop-blur-md text-text-primary text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 z-50 border border-border-visible shadow-xl">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col items-center gap-4 w-full">
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