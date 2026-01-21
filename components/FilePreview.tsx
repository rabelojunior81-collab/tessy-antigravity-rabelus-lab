
import React from 'react';
import { AttachedFile } from '../types';

interface FilePreviewProps {
  files: AttachedFile[];
  onRemove: (id: string) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return null;
    if (mimeType.startsWith('video/')) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-glass-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    );
    if (mimeType.startsWith('audio/')) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-glass-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
    );
    if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('javascript')) return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-glass-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
    );
    // Default document (PDF, etc)
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-glass-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    );
  };

  return (
    <div className="flex flex-wrap gap-3 animate-fade-in">
      <div className="w-full text-xs text-glass-accent font-semibold mb-2 flex items-center gap-3">
        <div className="w-4 h-0.5 bg-glass-accent rounded"></div>
        Carga de Dados: {files.length} unidades
      </div>
      {files.map((file) => (
        <div
          key={file.id}
          title={`${file.name} (${file.mimeType})`}
          className="glass-card relative flex items-center gap-3 p-2 group transition-all"
        >
          {file.mimeType.startsWith('image/') ? (
            <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="w-10 h-10 object-cover rounded border border-glass-border" />
          ) : (
            <div className="w-10 h-10 bg-glass-accent/10 flex items-center justify-center rounded border border-glass-border">
              {getFileIcon(file.mimeType)}
            </div>
          )}
          <div className="flex flex-col min-w-0 max-w-[160px]">
            <span className="text-[10px] text-glass font-semibold truncate line-clamp-2">{file.name}</span>
            <span className="text-[8px] text-glass-muted">{(file.size / 1024).toFixed(0)} KB</span>
          </div>
          <button
            onClick={() => onRemove(file.id)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-400 text-white flex items-center justify-center transition-colors rounded-full shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilePreview;
