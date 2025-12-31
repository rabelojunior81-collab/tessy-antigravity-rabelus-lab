
import { useLayoutContext } from '../contexts/LayoutContext';

export const useLayout = () => {
  const { 
    selectedFile, 
    setSelectedFile, 
    terminalHeight, 
    setTerminalHeight,
    viewerPanelWidth,
    setViewerPanelWidth,
    coPilotWidth,
    setCoPilotWidth
  } = useLayoutContext();

  return {
    arquivoSelecionado: selectedFile,
    selecionarArquivo: setSelectedFile,
    alturaTerminal: terminalHeight,
    ajustarAlturaTerminal: setTerminalHeight,
    larguraViewer: viewerPanelWidth,
    ajustarLarguraViewer: setViewerPanelWidth,
    larguraCoPilot: coPilotWidth,
    ajustarLarguraCoPilot: setCoPilotWidth
  };
};
