/**
 * FileExplorer Component
 * Hotfix 002: Integrated with WorkspaceContext
 * 
 * Tree-style file browser using WorkspaceContext for persistent state
 */

import React, { useEffect, useCallback } from 'react';
import { FolderOpen, ChevronRight, ChevronDown, RefreshCw, AlertCircle, Link2Off, Loader2, GitBranch } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useLayoutContext } from '../../contexts/LayoutContext';
import {
    readFile,
    getFileIcon,
    getLanguageFromExtension,
    type FileEntry
} from '../../services/fileSystemService';

interface FileExplorerProps {
    currentProjectId: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ currentProjectId }) => {
    const {
        currentWorkspace,
        directoryHandle,
        fileTree,
        isLoading,
        isSupported,
        error,
        isGitRepo,
        gitBranch,
        loadWorkspace,
        selectDirectory,
        refreshFileTree
    } = useWorkspace();

    const { setSelectedFile } = useLayoutContext();

    // Auto-load workspace when component mounts or project changes
    useEffect(() => {
        if (currentProjectId) {
            loadWorkspace(currentProjectId);
        }
    }, [currentProjectId, loadWorkspace]);

    // Handle file click - read content and set in LayoutContext
    const handleFileOpen = useCallback(async (entry: FileEntry) => {
        if (entry.kind !== 'file') return;

        try {
            const content = await readFile(entry.handle as FileSystemFileHandle);
            const language = getLanguageFromExtension(entry.name);

            // Set file in LayoutContext so CentralCanvas can display it
            setSelectedFile({
                path: entry.path,
                content,
                language
            });
        } catch (err) {
            console.error('Error reading file:', err);
        }
    }, [setSelectedFile]);

    // Handle directory selection (reconnect)
    const handleSelectDirectory = useCallback(async () => {
        await selectDirectory(currentProjectId);
    }, [selectDirectory, currentProjectId]);

    // Render file tree recursively
    const renderEntry = (entry: FileEntry, depth: number = 0) => {
        const icon = getFileIcon(entry.name, entry.kind === 'directory');

        return (
            <div key={entry.path}>
                <div
                    className={`flex items-center gap-1.5 py-1 px-2 cursor-pointer hover:bg-white/5 transition-colors`}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => {
                        if (entry.kind === 'directory') {
                            // Toggle expand - for now just log, tree comes pre-loaded
                            console.log('Toggle:', entry.path);
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

                {entry.kind === 'directory' && entry.children && (
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
                    File System Access API não suportada.
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
                    <span className="text-[10px] font-bold tracking-widest text-glass uppercase truncate max-w-[120px]">
                        {currentWorkspace?.localPath || 'Arquivos'}
                    </span>
                    {isGitRepo && gitBranch && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-glass-accent/20 rounded">
                            <GitBranch size={10} className="text-glass-accent" />
                            <span className="text-[8px] font-mono text-glass-accent">{gitBranch}</span>
                        </div>
                    )}
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={refreshFileTree}
                        disabled={!directoryHandle || isLoading}
                        className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-30"
                        title="Atualizar"
                    >
                        <RefreshCw size={12} className={`text-glass-muted ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Loader2 size={24} className="text-glass-accent animate-spin" />
                        <span className="text-[9px] text-glass-muted">Carregando...</span>
                    </div>
                ) : !directoryHandle ? (
                    <div className="p-4 flex flex-col items-center justify-center h-full gap-4">
                        {currentWorkspace?.status === 'disconnected' ? (
                            // Workspace exists but disconnected
                            <>
                                <div className="p-4 rounded-full bg-yellow-500/10">
                                    <Link2Off size={28} className="text-yellow-500" />
                                </div>
                                <p className="text-[9px] text-glass-muted text-center max-w-[200px]">
                                    Workspace desconectado. Clique para reconectar.
                                </p>
                                <button
                                    onClick={handleSelectDirectory}
                                    className="px-4 py-2 bg-glass-accent text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                                >
                                    Reconectar
                                </button>
                            </>
                        ) : (
                            // No workspace linked
                            <>
                                <div className="p-4 rounded-full bg-white/5">
                                    <FolderOpen size={28} className="text-glass-muted" />
                                </div>
                                <button
                                    onClick={handleSelectDirectory}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-glass-accent text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-50"
                                >
                                    Vincular Pasta
                                </button>
                                <p className="text-[9px] text-glass-muted text-center max-w-[200px]">
                                    Vincule uma pasta para navegar e editar arquivos locais.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="py-1">
                        {fileTree.length === 0 ? (
                            <p className="text-[10px] text-glass-muted text-center py-4">
                                Pasta vazia
                            </p>
                        ) : (
                            fileTree.map(entry => renderEntry(entry))
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
