/**
 * File System Access API Service
 * Sprint 1.2: Local File Access & IndexedDB 2.0
 * 
 * Provides browser-based file system access using the File System Access API
 */

// Type definitions for File System Access API
declare global {
    interface Window {
        showDirectoryPicker(options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
        showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>;
        showSaveFilePicker(options?: SaveFilePickerOptions): Promise<FileSystemFileHandle>;
    }

    interface DirectoryPickerOptions {
        id?: string;
        mode?: 'read' | 'readwrite';
        startIn?: 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
    }

    interface OpenFilePickerOptions {
        multiple?: boolean;
        excludeAcceptAllOption?: boolean;
        types?: FilePickerAcceptType[];
    }

    interface SaveFilePickerOptions {
        suggestedName?: string;
        types?: FilePickerAcceptType[];
    }

    interface FilePickerAcceptType {
        description?: string;
        accept: Record<string, string[]>;
    }
}

// File entry type for our tree structure
export interface FileEntry {
    name: string;
    kind: 'file' | 'directory';
    handle: FileSystemHandle;
    path: string;
    children?: FileEntry[];
    isExpanded?: boolean;
}

// Check if File System Access API is available
export function isFileSystemAccessSupported(): boolean {
    return 'showDirectoryPicker' in window;
}

// Open a directory picker
export async function openDirectory(mode: 'read' | 'readwrite' = 'read'): Promise<FileSystemDirectoryHandle | null> {
    if (!isFileSystemAccessSupported()) {
        console.error('File System Access API not supported in this browser');
        return null;
    }

    try {
        const handle = await window.showDirectoryPicker({ mode });
        return handle;
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            console.log('User cancelled directory picker');
        } else {
            console.error('Error opening directory:', error);
        }
        return null;
    }
}

// List all entries in a directory (recursive)
export async function listDirectory(
    dirHandle: FileSystemDirectoryHandle,
    path: string = '',
    maxDepth: number = 2,
    currentDepth: number = 0
): Promise<FileEntry[]> {
    const entries: FileEntry[] = [];

    try {
        // Note: entries() is part of the File System Access API but may need casting
        for await (const [name, handle] of (dirHandle as any).entries()) {
            const entryPath = path ? `${path}/${name}` : name;

            const entry: FileEntry = {
                name,
                kind: handle.kind,
                handle,
                path: entryPath,
                isExpanded: false
            };

            // Recursively get children for directories (up to maxDepth)
            if (handle.kind === 'directory' && currentDepth < maxDepth) {
                entry.children = await listDirectory(
                    handle as FileSystemDirectoryHandle,
                    entryPath,
                    maxDepth,
                    currentDepth + 1
                );
            } else if (handle.kind === 'directory') {
                entry.children = []; // Placeholder, will load on expand
            }

            entries.push(entry);
        }

        // Sort: directories first, then alphabetically
        entries.sort((a, b) => {
            if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
    } catch (error) {
        console.error('Error listing directory:', error);
    }

    return entries;
}

// Read file content
export async function readFile(fileHandle: FileSystemFileHandle): Promise<string> {
    try {
        const file = await fileHandle.getFile();
        return await file.text();
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
}

// Read file as binary
export async function readFileBinary(fileHandle: FileSystemFileHandle): Promise<ArrayBuffer> {
    try {
        const file = await fileHandle.getFile();
        return await file.arrayBuffer();
    } catch (error) {
        console.error('Error reading file binary:', error);
        throw error;
    }
}

// Get file info
export async function getFileInfo(fileHandle: FileSystemFileHandle): Promise<{
    name: string;
    size: number;
    type: string;
    lastModified: Date;
}> {
    const file = await fileHandle.getFile();
    return {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
    };
}

// Write to a file
export async function writeFile(fileHandle: FileSystemFileHandle, content: string): Promise<void> {
    try {
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    } catch (error) {
        console.error('Error writing file:', error);
        throw error;
    }
}

// Create a new file in a directory
export async function createFile(
    dirHandle: FileSystemDirectoryHandle,
    fileName: string
): Promise<FileSystemFileHandle> {
    return await dirHandle.getFileHandle(fileName, { create: true });
}

// Create a new directory
export async function createDirectory(
    dirHandle: FileSystemDirectoryHandle,
    dirName: string
): Promise<FileSystemDirectoryHandle> {
    return await dirHandle.getDirectoryHandle(dirName, { create: true });
}

// Delete a file or directory
export async function deleteEntry(
    parentHandle: FileSystemDirectoryHandle,
    name: string,
    options?: { recursive?: boolean }
): Promise<void> {
    await parentHandle.removeEntry(name, options);
}

// Get file extension
export function getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

// Get file icon based on extension
export function getFileIcon(fileName: string, isDirectory: boolean): string {
    if (isDirectory) return '📁';

    const ext = getFileExtension(fileName);
    const iconMap: Record<string, string> = {
        // Code files
        'ts': '🔷',
        'tsx': '⚛️',
        'js': '🟨',
        'jsx': '⚛️',
        'json': '📋',
        'html': '🌐',
        'css': '🎨',
        'scss': '🎨',
        'md': '📝',
        'py': '🐍',
        'rs': '🦀',
        'go': '🐹',
        // Config files
        'yaml': '⚙️',
        'yml': '⚙️',
        'toml': '⚙️',
        'env': '🔐',
        // Media
        'png': '🖼️',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'gif': '🖼️',
        'svg': '🎭',
        'mp4': '🎬',
        'mp3': '🎵',
        // Documents
        'pdf': '📄',
        'txt': '📃',
        // Archive
        'zip': '📦',
        'tar': '📦',
        'gz': '📦',
    };

    return iconMap[ext] || '📄';
}

// Language detection for syntax highlighting
export function getLanguageFromExtension(fileName: string): string {
    const ext = getFileExtension(fileName);
    const langMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'json': 'json',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'md': 'markdown',
        'py': 'python',
        'rs': 'rust',
        'go': 'go',
        'yaml': 'yaml',
        'yml': 'yaml',
        'toml': 'toml',
        'sql': 'sql',
        'sh': 'bash',
        'bash': 'bash',
    };

    return langMap[ext] || 'plaintext';
}
