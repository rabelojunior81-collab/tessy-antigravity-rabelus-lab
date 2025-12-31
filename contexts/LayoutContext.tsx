
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

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
  viewerPanelWidth: number;
  coPilotWidth: number;
  isMobileMenuOpen: boolean;
  openViewer: (viewer: ViewerType) => void;
  closeViewer: () => void;
  setSelectedFile: (file: SelectedFile | null) => void;
  setTerminalHeight: (height: number) => void;
  setViewerPanelWidth: (width: number) => void;
  setCoPilotWidth: (width: number) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeViewer, setActiveViewer] = useState<ViewerType>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize values from localStorage or defaults
  const [terminalHeight, setTerminalHeight] = useState(() => {
    const saved = localStorage.getItem('tessy-terminal-height');
    return saved ? parseInt(saved, 10) : 250;
  });

  const [viewerPanelWidth, setViewerPanelWidth] = useState(() => {
    const saved = localStorage.getItem('tessy-viewer-width');
    return saved ? parseInt(saved, 10) : 320;
  });

  const [coPilotWidth, setCoPilotWidth] = useState(() => {
    const saved = localStorage.getItem('tessy-copilot-width');
    return saved ? parseInt(saved, 10) : 450;
  });

  // Persist changes
  useEffect(() => {
    localStorage.setItem('tessy-terminal-height', terminalHeight.toString());
  }, [terminalHeight]);

  useEffect(() => {
    localStorage.setItem('tessy-viewer-width', viewerPanelWidth.toString());
  }, [viewerPanelWidth]);

  useEffect(() => {
    localStorage.setItem('tessy-copilot-width', coPilotWidth.toString());
  }, [coPilotWidth]);

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
      viewerPanelWidth,
      coPilotWidth,
      isMobileMenuOpen,
      openViewer,
      closeViewer,
      setSelectedFile,
      setTerminalHeight,
      setViewerPanelWidth,
      setCoPilotWidth,
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
