import { useLayoutContext } from '../contexts/LayoutContext';

export const useLayout = () => {
  const { selectedFile, setSelectedFile, terminalHeight, setTerminalHeight } = useLayoutContext();

  return {
    arquivoSelecionado: selectedFile,
    selecionarArquivo: setSelectedFile,
    alturaTerminal: terminalHeight,
    ajustarAlturaTerminal: setTerminalHeight,
  };
};
