
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { 
  fetchRepositoryStructure, 
  fetchFileContent, 
  getGitHubToken, 
  setGitHubToken as ghSetToken,
  setGitHubQueueListener,
  performCommitChanges,
  performCreateBranch,
  performCreatePullRequest
} from '../services/githubService';
import { db } from '../services/dbService';
import { GitHubFile, PendingAction } from '../types';

interface GitHubState {
  token: string | null;
  repoPath: string | null;
  tree: any | null;
  isLoading: boolean;
  error: string | null;
  pendingActions: PendingAction[];
}

interface GitHubContextType extends GitHubState {
  updateToken: (newToken: string) => Promise<void>;
  connectRepo: (path: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshTree: () => Promise<void>;
  getFileContent: (path: string) => Promise<GitHubFile>;
  approveAction: (id: string) => Promise<void>;
  rejectAction: (id: string) => void;
  isActionsModalOpen: boolean;
  setIsActionsModalOpen: (open: boolean) => void;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export const GitHubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GitHubState>({
    token: null,
    repoPath: null,
    tree: null,
    isLoading: false,
    error: null,
    pendingActions: [],
  });
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);

  const loadInitialState = useCallback(async () => {
    const token = await getGitHubToken();
    const currentProjId = await db.settings.get('tessy-current-project');
    let repoPath = null;
    if (currentProjId) {
      const project = await db.projects.get(currentProjId.value);
      repoPath = project?.githubRepo || null;
    }

    setState(prev => ({ ...prev, token, repoPath }));
    
    if (token && repoPath) {
      refreshTreeInternal(token, repoPath);
    }
  }, []);

  useEffect(() => {
    loadInitialState();
    
    // Subscribe to pending actions queue
    setGitHubQueueListener((action) => {
      setState(prev => ({
        ...prev,
        pendingActions: [...prev.pendingActions, action]
      }));
    });
  }, [loadInitialState]);

  const refreshTreeInternal = async (token: string, path: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const tree = await fetchRepositoryStructure(token, path, 3);
      setState(prev => ({ ...prev, tree, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    }
  };

  const updateToken = async (newToken: string) => {
    await ghSetToken(newToken);
    setState(prev => ({ ...prev, token: newToken }));
    if (state.repoPath) refreshTreeInternal(newToken, state.repoPath);
  };

  const connectRepo = async (path: string) => {
    setState(prev => ({ ...prev, repoPath: path }));
    const currentProjId = await db.settings.get('tessy-current-project');
    if (currentProjId) {
      const project = await db.projects.get(currentProjId.value);
      if (project) {
        await db.projects.put({ ...project, githubRepo: path, updatedAt: Date.now() });
      }
    }
    if (state.token) refreshTreeInternal(state.token, path);
  };

  const disconnect = async () => {
    setState(prev => ({ ...prev, repoPath: null, tree: null, error: null }));
    const currentProjId = await db.settings.get('tessy-current-project');
    if (currentProjId) {
      const project = await db.projects.get(currentProjId.value);
      if (project) {
        await db.projects.put({ ...project, githubRepo: '', updatedAt: Date.now() });
      }
    }
  };

  const refreshTree = async () => {
    if (state.token && state.repoPath) {
      await refreshTreeInternal(state.token, state.repoPath);
    }
  };

  const getFileContent = async (path: string) => {
    if (!state.token || !state.repoPath) throw new Error("Não conectado ao GitHub.");
    return await fetchFileContent(state.token, state.repoPath, path);
  };

  const approveAction = async (id: string) => {
    const action = state.pendingActions.find(a => a.id === id);
    if (!action) return;

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { params } = action;
      switch (action.type) {
        case 'commit':
        case 'push':
          await performCommitChanges(params.token, params.repoPath, params.files, params.message, params.branch);
          break;
        case 'branch':
          await performCreateBranch(params.token, params.repoPath, params.branchName, params.fromBranch);
          break;
        case 'pr':
          await performCreatePullRequest(params.token, params.repoPath, params.title, params.body, params.head, params.base);
          break;
      }
      
      setState(prev => ({
        ...prev,
        pendingActions: prev.pendingActions.filter(a => a.id !== id),
        isLoading: false
      }));
      refreshTree();
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
      alert(`Erro na execução: ${err.message}`);
    }
  };

  const rejectAction = (id: string) => {
    setState(prev => ({
      ...prev,
      pendingActions: prev.pendingActions.filter(a => a.id !== id)
    }));
  };

  return (
    <GitHubContext.Provider value={{
      ...state,
      updateToken,
      connectRepo,
      disconnect,
      refreshTree,
      getFileContent,
      approveAction,
      rejectAction,
      isActionsModalOpen,
      setIsActionsModalOpen
    }}>
      {children}
    </GitHubContext.Provider>
  );
};

export const useGitHub = () => {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
};
