/**
 * FileExplorer Component
 * Sprint 1.2: Local File Access
 * 
 * Tree-style file browser using File System Access API
 */

import React, { useState, useCallback } from 'react';
import { FolderOpen, ChevronRight, ChevronDown, RefreshCw, File, Plus, Trash2, AlertCircle } from 'lucide-react';
import {
    isFileSystemAccessSupported,
    openDirectory,
    listDirectory,
    readFile,
    createFile,
    deleteEntry,
    getFileIcon,
    getLanguageFromExtension,
    type FileEntry
} from '../../services/fileSystemService';

interface FileExplorerProps {
    onFileSelect?: (content: string, fileName: string, language: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
    const [rootHandle, setRootHandle] = useState<FileSystemDirectoryHandle | null>(null);
    const [rootName, setRootName] = useState<string>('');
    const [entries, setEntries] = useState<FileEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isSupported = isFileSystemAccessSupported();

    // Open directory picker
    const handleOpenDirectory = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const handle = await openDirectory('readwrite');
            if (handle) {
                setRootHandle(handle);
                setRootName(handle.name);
                const fileEntries = await listDirectory(handle, '', 1, 0);
                setEntries(fileEntries);
            }
        } catch (err) {
            setError('Erro ao abrir diretório');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Refresh current directory
    const handleRefresh = useCallback(async () => {
        if (!rootHandle) return;

        setIsLoading(true);
        try {
            const fileEntries = await listDirectory(rootHandle, '', 1, 0);
            setEntries(fileEntries);
        } catch (err) {
            setError('Erro ao atualizar');
        } finally {
            setIsLoading(false);
        }
    }, [rootHandle]);

    // Toggle directory expansion
    const handleToggleExpand = useCallback(async (entry: FileEntry, parentEntries: FileEntry[], setParentEntries: React.Dispatch<React.SetStateAction<FileEntry[]>>) => {
        if (entry.kind !== 'directory') return;

        const updatedEntries = parentEntries.map(e => {
            if (e.path === entry.path) {
                return { ...e, isExpanded: !e.isExpanded };
            }
            return e;
        });
        setParentEntries(updatedEntries);

        // Load children if expanding and not loaded
        if (!entry.isExpanded && entry.children?.length === 0) {
            try {
                const children = await listDirectory(
                    entry.handle as FileSystemDirectoryHandle,
                    entry.path,
                    1,
                    0
                );
                const withChildren = updatedEntries.map(e => {
                    if (e.path === entry.path) {
                        return { ...e, children, isExpanded: true };
                    }
                    return e;
                });
                setParentEntries(withChildren);
            } catch (err) {
                console.error('Error loading children:', err);
            }
        }
    }, []);

    // Open file
    const handleFileOpen = useCallback(async (entry: FileEntry) => {
        if (entry.kind !== 'file') return;

        setSelectedPath(entry.path);

        try {
            const content = await readFile(entry.handle as FileSystemFileHandle);
            const language = getLanguageFromExtension(entry.name);
            onFileSelect?.(content, entry.name, language);
        } catch (err) {
            setError('Erro ao ler arquivo');
        }
    }, [onFileSelect]);

    // Render file tree recursively
    const renderEntry = (entry: FileEntry, depth: number = 0) => {
        const isSelected = selectedPath === entry.path;
        const icon = getFileIcon(entry.name, entry.kind === 'directory');

        return (
            <div key={entry.path}>
                <div
                    className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-white/5 transition-colors ${isSelected ? 'bg-white/10 border-l-2 border-accent-primary' : ''
                        }`}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => {
                        if (entry.kind === 'directory') {
                            handleToggleExpand(entry, entries, setEntries);
                        } else {
                            handleFileOpen(entry);
                        }
                    }}
                >
                    {entry.kind === 'directory' && (
                        <span className="text-glass-muted">
                            {entry.isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </span>
                    )}
                    <span className="text-sm">{icon}</span>
                    <span className="text-[11px] text-glass truncate flex-1">{entry.name}</span>
                </div>

                {entry.kind === 'directory' && entry.isExpanded && entry.children && (
                    <div>
                        {entry.children.map(child => renderEntry(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    // Not supported message
    if (!isSupported) {
        return (
            <div className="p-4 flex flex-col items-center justify-center h-full gap-3">
                <AlertCircle size={32} className="text-yellow-500" />
                <p className="text-[10px] text-glass-muted text-center">
                    File System Access API não suportada neste browser.
                    <br />
                    Use Chrome, Edge ou Opera.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <FolderOpen size={14} className="text-glass-accent" />
                    <span className="text-[10px] font-bold tracking-widest text-glass uppercase">
                        {rootName || 'Arquivos'}
                    </span>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={handleRefresh}
                        disabled={!rootHandle || isLoading}
                        className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                        title="Atualizar"
                    >
                        <RefreshCw size={12} className={`text-glass-muted ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {!rootHandle ? (
                    <div className="p-4 flex flex-col items-center justify-center h-full gap-4">
                        <div className="p-4 rounded-full bg-white/5">
                            <FolderOpen size={28} className="text-glass-muted" />
                        </div>
                        <button
                            onClick={handleOpenDirectory}
                            disabled={isLoading}
                            className="px-4 py-2 bg-glass-accent text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Abrindo...' : 'Abrir Pasta'}
                        </button>
                        <p className="text-[9px] text-glass-muted text-center max-w-[200px]">
                            Selecione uma pasta para navegar e editar arquivos locais.
                        </p>
                    </div>
                ) : (
                    <div className="py-1">
                        {entries.length === 0 ? (
                            <p className="text-[10px] text-glass-muted text-center py-4">
                                Pasta vazia
                            </p>
                        ) : (
                            entries.map(entry => renderEntry(entry))
                        )}
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="px-3 py-2 bg-red-500/20 border-t border-red-500/30">
                    <p className="text-[9px] text-red-400 text-center">{error}</p>
                </div>
            )}
        </div>
    );
};

export default FileExplorer;
