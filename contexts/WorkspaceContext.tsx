/**
 * Workspace Context
 * Hotfix 001: File System Synchronization
 * 
 * Global context for workspace state and file system operations
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Workspace, WorkspaceStatus } from '../types';
import {
    isWorkspaceSupported,
    getWorkspaceByProject,
    restoreWorkspaceHandle,
    promptForWorkspace,
    getWorkspaceFileTree,
    getWorkspaceFSAdapter,
    updateWorkspaceStatus,
    setWorkspaceGitHubUrl
} from '../services/workspaceService';
import { FileEntry } from '../services/fileSystemService';
import { FSAAdapter } from '../services/fsaAdapter';
import * as gitService from '../services/gitService';
import { getGitHubToken } from '../services/githubService';

interface WorkspaceState {
    // Current workspace metadata
    currentWorkspace: Workspace | null;
    // Directory handle (not serializable, so kept in memory)
    directoryHandle: FileSystemDirectoryHandle | null;
    // FS adapter for isomorphic-git
    fsAdapter: FSAAdapter | null;
    // File tree
    fileTree: FileEntry[];
    // Loading/status
    isLoading: boolean;
    isSupported: boolean;
    error: string | null;
    // Git info
    gitBranch: string | null;
    isGitRepo: boolean;
}

interface WorkspaceContextType extends WorkspaceState {
    // Actions
    loadWorkspace: (projectId: string) => Promise<void>;
    selectDirectory: (projectId: string) => Promise<boolean>;
    refreshFileTree: () => Promise<void>;
    cloneFromGitHub: (url: string, token?: string) => Promise<boolean>;
    disconnect: () => void;
    // File actions
    saveFile: (path: string, content: string) => Promise<boolean>;
    readFileContent: (path: string) => Promise<string | null>;
    // Git actions
    gitPull: () => Promise<void>;
    gitPush: (token?: string) => Promise<void>;
    gitCommit: (message: string, files: string[]) => Promise<string | null>;
    gitStatus: () => Promise<gitService.GitStatusResult[]>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const initialState: WorkspaceState = {
    currentWorkspace: null,
    directoryHandle: null,
    fsAdapter: null,
    fileTree: [],
    isLoading: false,
    isSupported: false,
    error: null,
    gitBranch: null,
    isGitRepo: false
};

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<WorkspaceState>(initialState);

    // Check API support on mount
    useEffect(() => {
        setState(prev => ({ ...prev, isSupported: isWorkspaceSupported() }));
    }, []);

    // Load workspace for a project
    const loadWorkspace = useCallback(async (projectId: string) => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const workspace = await getWorkspaceByProject(projectId);

            if (!workspace) {
                setState(prev => ({
                    ...prev,
                    currentWorkspace: null,
                    directoryHandle: null,
                    fsAdapter: null,
                    fileTree: [],
                    isLoading: false,
                    isGitRepo: false,
                    gitBranch: null
                }));
                return;
            }

            // Try to restore the handle
            const handle = await restoreWorkspaceHandle(workspace.id);

            if (!handle) {
                setState(prev => ({
                    ...prev,
                    currentWorkspace: { ...workspace, status: 'disconnected' as WorkspaceStatus },
                    directoryHandle: null,
                    fsAdapter: null,
                    fileTree: [],
                    isLoading: false,
                    error: 'Workspace disconnected. Click to reconnect.'
                }));
                return;
            }

            // Create FS adapter
            const fsAdapter = getWorkspaceFSAdapter(handle);

            // Load file tree
            const fileTree = await getWorkspaceFileTree(handle);

            // Check if it's a git repo
            const isGitRepo = await gitService.isGitRepo(fsAdapter, '/');
            let gitBranch = null;
            if (isGitRepo) {
                gitBranch = await gitService.currentBranch(fsAdapter, '/');
            }

            setState(prev => ({
                ...prev,
                currentWorkspace: workspace,
                directoryHandle: handle,
                fsAdapter,
                fileTree,
                isLoading: false,
                isGitRepo,
                gitBranch
            }));
        } catch (e) {
            console.error('Failed to load workspace:', e);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: (e as Error).message
            }));
        }
    }, []);

    // Select and link a directory to a project
    const selectDirectory = useCallback(async (projectId: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const result = await promptForWorkspace(projectId);

            if (!result) {
                setState(prev => ({ ...prev, isLoading: false }));
                return false;
            }

            const fsAdapter = getWorkspaceFSAdapter(result.handle);
            const fileTree = await getWorkspaceFileTree(result.handle);

            // Check if it's a git repo
            const isGitRepo = await gitService.isGitRepo(fsAdapter, '/');
            let gitBranch = null;
            if (isGitRepo) {
                gitBranch = await gitService.currentBranch(fsAdapter, '/');
            }

            setState(prev => ({
                ...prev,
                currentWorkspace: result.workspace,
                directoryHandle: result.handle,
                fsAdapter,
                fileTree,
                isLoading: false,
                isGitRepo,
                gitBranch
            }));

            return true;
        } catch (e) {
            console.error('Failed to select directory:', e);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: (e as Error).message
            }));
            return false;
        }
    }, []);

    // Refresh file tree
    const refreshFileTree = useCallback(async () => {
        if (!state.directoryHandle) return;

        try {
            const fileTree = await getWorkspaceFileTree(state.directoryHandle);
            setState(prev => ({ ...prev, fileTree }));
        } catch (e) {
            console.error('Failed to refresh file tree:', e);
        }
    }, [state.directoryHandle]);

    // Clone from GitHub
    const cloneFromGitHub = useCallback(async (url: string, token?: string): Promise<boolean> => {
        if (!state.fsAdapter || !state.currentWorkspace) {
            setState(prev => ({ ...prev, error: 'No workspace selected' }));
            return false;
        }

        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // Get token if not provided
            const effectiveToken = token || await getGitHubToken();

            await gitService.cloneRepository(state.fsAdapter, '/', {
                url,
                onAuth: effectiveToken ? () => ({ username: 'oauth2', password: effectiveToken }) : undefined,
                onProgress: (progress) => {
                    console.log(`Clone progress: ${progress.phase} ${progress.loaded}/${progress.total}`);
                }
            });

            // Update workspace with GitHub URL
            await setWorkspaceGitHubUrl(state.currentWorkspace.id, url);
            await updateWorkspaceStatus(state.currentWorkspace.id, 'connected');

            // Refresh
            await refreshFileTree();

            const gitBranch = await gitService.currentBranch(state.fsAdapter, '/');

            setState(prev => ({
                ...prev,
                currentWorkspace: prev.currentWorkspace ? {
                    ...prev.currentWorkspace,
                    githubCloneUrl: url
                } : null,
                isLoading: false,
                isGitRepo: true,
                gitBranch
            }));

            return true;
        } catch (e) {
            console.error('Failed to clone:', e);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: `Clone failed: ${(e as Error).message}`
            }));
            return false;
        }
    }, [state.fsAdapter, state.currentWorkspace, refreshFileTree]);

    // Disconnect workspace (clear memory state)
    const disconnect = useCallback(() => {
        setState(prev => ({
            ...prev,
            directoryHandle: null,
            fsAdapter: null,
            fileTree: [],
            isGitRepo: false,
            gitBranch: null,
            error: null
        }));
    }, []);

    // Save file to disk
    const saveFile = useCallback(async (path: string, content: string): Promise<boolean> => {
        if (!state.directoryHandle) return false;

        try {
            // Navigate to the file's parent directory and get the file handle
            const pathParts = path.split('/').filter(Boolean);
            const fileName = pathParts.pop();
            if (!fileName) return false;

            let currentHandle: FileSystemDirectoryHandle = state.directoryHandle;

            // Navigate through directories
            for (const part of pathParts) {
                currentHandle = await currentHandle.getDirectoryHandle(part);
            }

            // Get file handle and write
            const fileHandle = await currentHandle.getFileHandle(fileName);
            const writable = await fileHandle.createWritable();
            await writable.write(content);
            await writable.close();

            return true;
        } catch (e) {
            console.error('Failed to save file:', e);
            setState(prev => ({ ...prev, error: `Save failed: ${(e as Error).message}` }));
            return false;
        }
    }, [state.directoryHandle]);

    // Read file content from disk
    const readFileContent = useCallback(async (path: string): Promise<string | null> => {
        if (!state.directoryHandle) return null;

        try {
            const pathParts = path.split('/').filter(Boolean);
            const fileName = pathParts.pop();
            if (!fileName) return null;

            let currentHandle: FileSystemDirectoryHandle = state.directoryHandle;

            for (const part of pathParts) {
                currentHandle = await currentHandle.getDirectoryHandle(part);
            }

            const fileHandle = await currentHandle.getFileHandle(fileName);
            const file = await fileHandle.getFile();
            return await file.text();
        } catch (e) {
            console.error('Failed to read file:', e);
            return null;
        }
    }, [state.directoryHandle]);

    // Git Pull
    const gitPull = useCallback(async () => {
        if (!state.fsAdapter) return;

        setState(prev => ({ ...prev, isLoading: true }));
        try {
            await gitService.pull(state.fsAdapter, '/');
            await refreshFileTree();
            setState(prev => ({ ...prev, isLoading: false }));
        } catch (e) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: `Pull failed: ${(e as Error).message}`
            }));
        }
    }, [state.fsAdapter, refreshFileTree]);

    // Git Push
    const gitPush = useCallback(async (token?: string) => {
        if (!state.fsAdapter) return;

        setState(prev => ({ ...prev, isLoading: true }));
        try {
            // Get token if not provided
            const effectiveToken = token || await getGitHubToken();
            if (!effectiveToken) {
                throw new Error("GitHub Token not found. Please add it in Settings.");
            }

            await gitService.push(state.fsAdapter, '/', {
                onAuth: () => ({ username: 'oauth2', password: effectiveToken })
            });
            setState(prev => ({ ...prev, isLoading: false }));
        } catch (e) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: `Push failed: ${(e as Error).message}`
            }));
        }
    }, [state.fsAdapter]);

    // Git Commit
    const gitCommit = useCallback(async (message: string, files: string[]): Promise<string | null> => {
        if (!state.fsAdapter) return null;

        setState(prev => ({ ...prev, isLoading: true }));
        try {
            await gitService.stageFiles(state.fsAdapter, '/', files);
            const sha = await gitService.commit(state.fsAdapter, '/', message);
            setState(prev => ({ ...prev, isLoading: false }));
            return sha;
        } catch (e) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: `Commit failed: ${(e as Error).message}`
            }));
            return null;
        }
    }, [state.fsAdapter]);

    // Git Status
    const gitStatus = useCallback(async (): Promise<gitService.GitStatusResult[]> => {
        if (!state.fsAdapter) return [];

        try {
            return await gitService.status(state.fsAdapter, '/');
        } catch (e) {
            console.error('Git status failed:', e);
            return [];
        }
    }, [state.fsAdapter]);

    return (
        <WorkspaceContext.Provider value={{
            ...state,
            loadWorkspace,
            selectDirectory,
            refreshFileTree,
            cloneFromGitHub,
            disconnect,
            saveFile,
            readFileContent,
            gitPull,
            gitPush,
            gitCommit,
            gitStatus
        }}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};
