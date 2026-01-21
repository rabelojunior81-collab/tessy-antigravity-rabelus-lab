/**
 * File System Access Adapter for isomorphic-git
 * Hotfix 001: File System Synchronization
 * 
 * Implements the `fs` plugin interface required by isomorphic-git
 * using the browser's File System Access API.
 */

// Type for our FS adapter
export interface FSAAdapter {
    promises: {
        readFile(path: string, options?: { encoding?: string }): Promise<Uint8Array | string>;
        writeFile(path: string, data: Uint8Array | string): Promise<void>;
        mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
        rmdir(path: string, options?: { recursive?: boolean }): Promise<void>;
        unlink(path: string): Promise<void>;
        stat(path: string): Promise<{
            type: 'file' | 'dir';
            mode: number;
            size: number;
            mtimeMs: number;
            isFile(): boolean;
            isDirectory(): boolean;
            isSymbolicLink(): boolean;
        }>;
        lstat(path: string): Promise<{
            type: 'file' | 'dir';
            mode: number;
            size: number;
            mtimeMs: number;
            isFile(): boolean;
            isDirectory(): boolean;
            isSymbolicLink(): boolean;
        }>;
        readdir(path: string): Promise<string[]>;
        readlink(path: string): Promise<string>;
        symlink(target: string, path: string): Promise<void>;
    };
}

/**
 * Creates an FS adapter for isomorphic-git from a FileSystemDirectoryHandle
 */
export function createFSAdapter(rootHandle: FileSystemDirectoryHandle): FSAAdapter {

    // Helper: Navigate to a path and return the handle
    async function navigateToPath(
        pathStr: string,
        options: { create?: boolean; parent?: boolean } = {}
    ): Promise<FileSystemDirectoryHandle | FileSystemFileHandle | null> {
        // Normalize path: remove leading slash and split
        const normalizedPath = pathStr.replace(/^\/+/, '').replace(/\/+$/, '');
        if (!normalizedPath) return rootHandle;

        const parts = normalizedPath.split('/').filter(Boolean);
        const targetName = parts.pop();

        if (!targetName) return rootHandle;

        // Navigate to parent directory
        let currentDir = rootHandle;
        for (const part of parts) {
            try {
                currentDir = await currentDir.getDirectoryHandle(part, { create: options.create });
            } catch {
                if (options.create) {
                    currentDir = await currentDir.getDirectoryHandle(part, { create: true });
                } else {
                    return null;
                }
            }
        }

        if (options.parent) {
            return currentDir;
        }

        // Try to get the target (could be file or directory)
        try {
            return await currentDir.getDirectoryHandle(targetName, { create: options.create });
        } catch {
            try {
                return await currentDir.getFileHandle(targetName, { create: options.create });
            } catch {
                return null;
            }
        }
    }

    // Helper: Get parent directory and entry name
    async function getParentAndName(pathStr: string): Promise<{ parent: FileSystemDirectoryHandle; name: string } | null> {
        const normalizedPath = pathStr.replace(/^\/+/, '').replace(/\/+$/, '');
        const parts = normalizedPath.split('/').filter(Boolean);
        const name = parts.pop();

        if (!name) return null;

        let parent = rootHandle;
        for (const part of parts) {
            try {
                parent = await parent.getDirectoryHandle(part);
            } catch {
                return null;
            }
        }

        return { parent, name };
    }

    return {
        promises: {
            async readFile(path: string, options?: { encoding?: string }): Promise<Uint8Array | string> {
                const handle = await navigateToPath(path);
                if (!handle || handle.kind !== 'file') {
                    throw new Error(`ENOENT: no such file, open '${path}'`);
                }

                const file = await (handle as FileSystemFileHandle).getFile();

                if (options?.encoding === 'utf8' || options?.encoding === 'utf-8') {
                    return await file.text();
                }

                const buffer = await file.arrayBuffer();
                return new Uint8Array(buffer);
            },

            async writeFile(path: string, data: Uint8Array | string): Promise<void> {
                // First ensure parent directories exist
                const pathParts = path.replace(/^\/+/, '').split('/').filter(Boolean);
                const fileName = pathParts.pop();

                if (!fileName) throw new Error('Invalid path');

                let currentDir = rootHandle;
                for (const part of pathParts) {
                    currentDir = await currentDir.getDirectoryHandle(part, { create: true });
                }

                const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
                const writable = await fileHandle.createWritable();
                // Write data directly - handle both string and Uint8Array
                await writable.write(data as FileSystemWriteChunkType);
                await writable.close();
            },

            async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
                const normalizedPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
                const parts = normalizedPath.split('/').filter(Boolean);

                let currentDir = rootHandle;
                for (const part of parts) {
                    try {
                        currentDir = await currentDir.getDirectoryHandle(part, { create: options?.recursive ?? true });
                    } catch (e) {
                        if (!options?.recursive) throw e;
                        currentDir = await currentDir.getDirectoryHandle(part, { create: true });
                    }
                }
            },

            async rmdir(path: string, options?: { recursive?: boolean }): Promise<void> {
                const info = await getParentAndName(path);
                if (!info) throw new Error(`ENOENT: no such directory '${path}'`);

                await info.parent.removeEntry(info.name, { recursive: options?.recursive ?? false });
            },

            async unlink(path: string): Promise<void> {
                const info = await getParentAndName(path);
                if (!info) throw new Error(`ENOENT: no such file '${path}'`);

                await info.parent.removeEntry(info.name);
            },

            async stat(path: string) {
                const handle = await navigateToPath(path);
                if (!handle) {
                    throw new Error(`ENOENT: no such file or directory '${path}'`);
                }

                if (handle.kind === 'directory') {
                    return {
                        type: 'dir' as const,
                        mode: 0o755,
                        size: 0,
                        mtimeMs: Date.now(),
                        isFile: () => false,
                        isDirectory: () => true,
                        isSymbolicLink: () => false
                    };
                }

                const file = await (handle as FileSystemFileHandle).getFile();
                return {
                    type: 'file' as const,
                    mode: 0o644,
                    size: file.size,
                    mtimeMs: file.lastModified,
                    isFile: () => true,
                    isDirectory: () => false,
                    isSymbolicLink: () => false
                };
            },

            async lstat(path: string) {
                // For browser FS, lstat is the same as stat (no symlinks)
                return this.stat(path);
            },

            async readdir(path: string): Promise<string[]> {
                const handle = await navigateToPath(path);
                if (!handle || handle.kind !== 'directory') {
                    throw new Error(`ENOTDIR: not a directory '${path}'`);
                }

                const entries: string[] = [];
                // Use async iterator with type assertion for browser API
                const dirHandle = handle as FileSystemDirectoryHandle;
                for await (const [name] of (dirHandle as any).entries()) {
                    entries.push(name);
                }
                return entries;
            },

            async readlink(_path: string): Promise<string> {
                // File System Access API doesn't support symlinks
                throw new Error('EINVAL: readlink not supported');
            },

            async symlink(_target: string, _path: string): Promise<void> {
                // File System Access API doesn't support symlinks
                throw new Error('EINVAL: symlink not supported');
            }
        }
    };
}

/**
 * Store directory handle in IndexedDB for persistence across sessions
 * Note: FileSystemHandle can be stored in IndexedDB directly
 */
export async function storeDirectoryHandle(
    dbKey: string,
    handle: FileSystemDirectoryHandle
): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TessyFSHandles', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('handles')) {
                db.createObjectStore('handles', { keyPath: 'key' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('handles', 'readwrite');
            const store = tx.objectStore('handles');
            store.put({ key: dbKey, handle });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        };

        request.onerror = () => reject(request.error);
    });
}

/**
 * Retrieve directory handle from IndexedDB
 */
export async function retrieveDirectoryHandle(
    dbKey: string
): Promise<FileSystemDirectoryHandle | null> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TessyFSHandles', 1);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('handles')) {
                db.createObjectStore('handles', { keyPath: 'key' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;
            const tx = db.transaction('handles', 'readonly');
            const store = tx.objectStore('handles');
            const getRequest = store.get(dbKey);

            getRequest.onsuccess = () => {
                resolve(getRequest.result?.handle || null);
            };
            getRequest.onerror = () => reject(getRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
}

/**
 * Request permission for a stored handle (required after browser restart)
 */
export async function requestPermission(
    handle: FileSystemDirectoryHandle,
    mode: 'read' | 'readwrite' = 'readwrite'
): Promise<boolean> {
    try {
        // Check current permission status
        // Use type assertion for browser-specific APIs
        const handleAny = handle as any;
        const options = { mode };
        let permission = await handleAny.queryPermission(options);

        if (permission === 'granted') {
            return true;
        }

        // Request permission
        permission = await handleAny.requestPermission(options);
        return permission === 'granted';
    } catch (e) {
        console.error('Failed to request permission:', e);
        return false;
    }
}

// Type for permission descriptor
interface FileSystemHandlePermissionDescriptor {
    mode: 'read' | 'readwrite';
}
