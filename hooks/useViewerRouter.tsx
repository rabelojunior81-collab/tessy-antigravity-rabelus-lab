
import React, { useMemo } from 'react';
import { useViewer } from './useViewer';
import { useChat } from '../contexts/ChatContext';
import HistoryViewer from '../components/viewers/HistoryViewer';
import LibraryViewer from '../components/viewers/LibraryViewer';
import ProjectsViewer from '../components/viewers/ProjectsViewer';
import GitHubViewer from '../components/viewers/GitHubViewer';
import { RepositoryItem, Template } from '../types';

interface UseViewerRouterProps {
  currentProjectId: string;
  onProjectSelected: (id: string) => void;
  onLibraryItemSelected: (item: RepositoryItem | Template) => void;
  onNewConversation: () => void;
  onOpenProjectModal: (id?: string | null) => void;
  handleSwitchProject: (id: string) => void;
}

export const useViewerRouter = ({
  currentProjectId,
  onProjectSelected,
  onLibraryItemSelected,
  onNewConversation,
  onOpenProjectModal,
  handleSwitchProject
}: UseViewerRouterProps) => {
  const { viewerAberto, fecharViewer } = useViewer();
  const { currentConversation, loadConversation, deleteConversation } = useChat();

  const viewerContent = useMemo(() => {
    switch (viewerAberto) {
      case 'history':
        return (
          <HistoryViewer 
            currentProjectId={currentProjectId} 
            activeId={currentConversation?.id || ''} 
            onLoad={(conv) => { 
              loadConversation(conv); 
              fecharViewer(); 
              onProjectSelected(''); // Limpa seleção de visualização ao carregar conversa
            }} 
            onDelete={deleteConversation}
            onNew={() => { 
              onNewConversation(); 
              fecharViewer(); 
              onProjectSelected('');
            }}
          />
        );
      case 'library':
        return (
          <LibraryViewer 
            currentProjectId={currentProjectId} 
            onSelectItem={(item) => {
              onLibraryItemSelected(item as any);
            }}
          />
        );
      case 'projects':
        return (
          <ProjectsViewer 
            currentProjectId={currentProjectId} 
            onSwitch={(id) => { 
              handleSwitchProject(id); 
              fecharViewer(); 
            }}
            onOpenModal={() => onOpenProjectModal()}
            onEditProject={(id) => onOpenProjectModal(id)}
            onSelectProject={onProjectSelected}
          />
        );
      case 'github':
        return <GitHubViewer />;
      default:
        return null;
    }
  }, [
    viewerAberto, 
    currentProjectId, 
    currentConversation, 
    loadConversation, 
    deleteConversation, 
    fecharViewer, 
    onNewConversation, 
    onLibraryItemSelected, 
    handleSwitchProject, 
    onOpenProjectModal, 
    onProjectSelected
  ]);

  return viewerContent;
};
