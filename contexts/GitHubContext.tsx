import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { fetchRepositoryStructure, fetchFileContent, GitHubError } from '../services/githubService';
import { getGitHubToken, setGitHubToken as dbSetToken, db } from '../services/dbService';
import { GitHubFile } from '../types';

interface GitHubState {
  token: string | null;
  repoPath: string | null;
  tree: any | null;
  isLoading: boolean;
  error: string | null;
}

interface GitHubContextType extends GitHubState {
  updateToken: (newToken: string) => Promise<void>;
  connectRepo: (path: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshTree: () => Promise<void>;
  getFileContent: (path: string) => Promise<GitHubFile>;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export const GitHubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GitHubState>({
    token: null,
    repoPath: null,
    tree: null,
    isLoading: false,
    error: null,
  });

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
    await dbSetToken(newToken);
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

  return (
    <GitHubContext.Provider value={{
      ...state,
      updateToken,
      connectRepo,
      disconnect,
      refreshTree,
      getFileContent
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
