
import React, { createContext, useState, useContext, ReactNode } from 'react';

export type ViewerType = 'history' | 'library' | 'projects' | 'controllers' | 'github' | null;

interface SelectedFile {
  path: string;
  content: string;
  language: string;
}

interface LayoutContextType {
  activeViewer: ViewerType;
  selectedFile: SelectedFile | null;
  terminalHeight: number;
  isMobileMenuOpen: boolean;
  openViewer: (viewer: ViewerType) => void;
  closeViewer: () => void;
  setSelectedFile: (file: SelectedFile | null) => void;
  setTerminalHeight: (height: number) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeViewer, setActiveViewer] = useState<ViewerType>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [terminalHeight, setTerminalHeight] = useState(250);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openViewer = (viewer: ViewerType) => {
    setActiveViewer(current => current === viewer ? null : viewer);
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(false);
    }
  };

  const closeViewer = () => setActiveViewer(null);

  return (
    <LayoutContext.Provider value={{
      activeViewer,
      selectedFile,
      terminalHeight,
      isMobileMenuOpen,
      openViewer,
      closeViewer,
      setSelectedFile,
      setTerminalHeight,
      setIsMobileMenuOpen
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
};
