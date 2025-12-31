import { useLayoutContext, ViewerType } from '../contexts/LayoutContext';

export const useViewer = () => {
  const { activeViewer, openViewer, closeViewer } = useLayoutContext();

  return {
    viewerAberto: activeViewer,
    abrirViewer: (nome: ViewerType) => openViewer(nome),
    fecharViewer: () => closeViewer(),
    isViewerAberto: (nome: ViewerType) => activeViewer === nome,
  };
};
