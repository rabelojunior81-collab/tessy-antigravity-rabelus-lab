/**
 * Workspace Service
 * Hotfix 001: File System Synchronization
 * 
 * Manages workspace lifecycle: creation, persistence, restoration
 */

import { db, generateUUID } from './dbService';
import { Workspace, WorkspaceStatus } from '../types';
import {
    storeDirectoryHandle,
    retrieveDirectoryHandle,
    requestPermission,
    createFSAdapter
} from './fsaAdapter';
import { openDirectory, listDirectory, FileEntry } from './fileSystemService';

// Check if File System Access API is available
export function isWorkspaceSupported(): boolean {
    return 'showDirectoryPicker' in window;
}

/**
 * Create a new workspace for a project
 */
export async function createWorkspace(
    projectId: string,
    name: string,
    directoryHandle: FileSystemDirectoryHandle
): Promise<Workspace> {
    const now = Date.now();
    const workspace: Workspace = {
        id: generateUUID(),
        projectId,
        name,
        localPath: directoryHandle.name,
        status: 'connected',
        lastSyncAt: now,
        createdAt: now,
        updatedAt: now
    };

    // Store workspace metadata in IndexedDB
    await db.workspaces.put(workspace);

    // Store the directory handle separately (as it's a special object)
    await storeDirectoryHandle(`workspace-${workspace.id}`, directoryHandle);

    // Update project with workspace reference
    const project = await db.projects.get(projectId);
    if (project) {
        await db.projects.put({ ...project, workspaceId: workspace.id, updatedAt: now });
    }

    return workspace;
}

/**
 * Get workspace by project ID
 */
export async function getWorkspaceByProject(projectId: string): Promise<Workspace | null> {
    const project = await db.projects.get(projectId);
    if (!project?.workspaceId) return null;

    return await db.workspaces.get(project.workspaceId) || null;
}

/**
 * Get workspace by ID
 */
export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
    return await db.workspaces.get(workspaceId) || null;
}

/**
 * Restore directory handle for a workspace
 * Returns null if handle is no longer valid or permission denied
 */
export async function restoreWorkspaceHandle(
    workspaceId: string
): Promise<FileSystemDirectoryHandle | null> {
    try {
        const handle = await retrieveDirectoryHandle(`workspace-${workspaceId}`);
        if (!handle) return null;

        // Request permission (needed after browser restart)
        const hasPermission = await requestPermission(handle, 'readwrite');
        if (!hasPermission) {
            // Update workspace status
            await updateWorkspaceStatus(workspaceId, 'disconnected');
            return null;
        }

        await updateWorkspaceStatus(workspaceId, 'connected');
        return handle;
    } catch (e) {
        console.error('Failed to restore workspace handle:', e);
        await updateWorkspaceStatus(workspaceId, 'error');
        return null;
    }
}

/**
 * Update workspace status
 */
export async function updateWorkspaceStatus(
    workspaceId: string,
    status: WorkspaceStatus
): Promise<void> {
    const workspace = await db.workspaces.get(workspaceId);
    if (workspace) {
        await db.workspaces.put({
            ...workspace,
            status,
            updatedAt: Date.now(),
            lastSyncAt: status === 'connected' ? Date.now() : workspace.lastSyncAt
        });
    }
}

/**
 * Prompt user to select a directory and create workspace
 */
export async function promptForWorkspace(projectId: string): Promise<{
    workspace: Workspace;
    handle: FileSystemDirectoryHandle;
} | null> {
    const handle = await openDirectory('readwrite');
    if (!handle) return null;

    const workspace = await createWorkspace(projectId, handle.name, handle);
    return { workspace, handle };
}

/**
 * Get file tree for a workspace
 */
export async function getWorkspaceFileTree(
    handle: FileSystemDirectoryHandle,
    maxDepth: number = 3
): Promise<FileEntry[]> {
    return await listDirectory(handle, '', maxDepth);
}

/**
 * Create FS adapter for isomorphic-git
 */
export function getWorkspaceFSAdapter(handle: FileSystemDirectoryHandle) {
    return createFSAdapter(handle);
}

/**
 * Update workspace with GitHub clone URL
 */
export async function setWorkspaceGitHubUrl(
    workspaceId: string,
    githubCloneUrl: string
): Promise<void> {
    const workspace = await db.workspaces.get(workspaceId);
    if (workspace) {
        await db.workspaces.put({
            ...workspace,
            githubCloneUrl,
            updatedAt: Date.now()
        });
    }
}

/**
 * Delete a workspace (but not the files)
 */
export async function deleteWorkspace(workspaceId: string): Promise<void> {
    await db.workspaces.delete(workspaceId);
    // Note: Directory handle will be orphaned in TessyFSHandles DB
    // but that's okay - it's just metadata
}

/**
 * Get all workspaces
 */
export async function getAllWorkspaces(): Promise<Workspace[]> {
    return await db.workspaces.toArray();
}
