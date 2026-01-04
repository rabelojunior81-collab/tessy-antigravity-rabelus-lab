
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
    setCoPilotWidth,
    selectedProjectId,
    setSelectedProjectId,
    selectedLibraryItem,
    setSelectedLibraryItem
  } = useLayoutContext();

  return {
    arquivoSelecionado: selectedFile,
    selecionarArquivo: setSelectedFile,
    alturaTerminal: terminalHeight,
    ajustarAlturaTerminal: setTerminalHeight,
    larguraViewer: viewerPanelWidth,
    ajustarLarguraViewer: setViewerPanelWidth,
    larguraCoPilot: coPilotWidth,
    ajustarLarguraCoPilot: setCoPilotWidth,
    projetoSelecionado: selectedProjectId,
    setProjetoSelecionado: setSelectedProjectId,
    itemBibliotecaSelecionado: selectedLibraryItem,
    setItemBibliotecaSelecionado: setSelectedLibraryItem
  };
};
