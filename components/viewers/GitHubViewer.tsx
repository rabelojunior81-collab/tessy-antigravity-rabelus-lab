import React, { useState } from 'react';
import { Github, Key, RefreshCcw, Folder, File, ChevronRight, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGitHub } from '../../contexts/GitHubContext';
import { useLayout } from '../../hooks/useLayout';

const TreeNode: React.FC<{ item: any; level: number; onFileSelect: (path: string) => void }> = ({ item, level, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = item.type === 'dir';

  const handleClick = () => {
    if (isFolder) setIsOpen(!isOpen);
    else onFileSelect(item.path);
  };

  return (
    <div className="flex flex-col select-none">
      <div 
        onClick={handleClick}
        className={`flex items-center gap-2 py-1.5 px-3 hover:bg-accent-primary/5 cursor-pointer transition-colors border-l-2 group ${
          isOpen && isFolder ? 'border-accent-primary/40' : 'border-transparent'
        }`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        <span className="text-text-tertiary">
          {isFolder ? (isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />) : <div className="w-3" />}
        </span>
        <span className={isFolder ? 'text-accent-primary/80' : 'text-text-tertiary group-hover:text-text-primary transition-colors'}>
          {isFolder ? <Folder size={14} /> : <File size={14} />}
        </span>
        <span className={`text-[11px] font-mono tracking-tighter truncate ${isFolder ? 'font-bold text-text-secondary' : 'text-text-tertiary'}`}>
          {item.name}
        </span>
      </div>
      
      {isOpen && isFolder && item.items && (
        <div className="flex flex-col">
          {item.items.map((subItem: any) => (
            <TreeNode key={subItem.path} item={subItem} level={level + 1} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const GitHubViewer: React.FC = () => {
  const { token, repoPath, tree, isLoading, error, updateToken, connectRepo, refreshTree, getFileContent, disconnect } = useGitHub();
  const { selecionarArquivo } = useLayout();
  const [tokenInput, setTokenInput] = useState('');
  const [repoInput, setRepoInput] = useState('');

  const handleFileSelect = async (path: string) => {
    try {
      const fileData = await getFileContent(path);
      selecionarArquivo({
        path: fileData.path,
        content: fileData.content || '',
        language: path.split('.').pop() || 'text'
      });
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  if (!token) {
    return (
      <div className="p-6 flex flex-col gap-6 animate-fade-in">
        <div className="p-4 bg-accent-primary/5 border border-border-visible">
          <h4 className="text-[11px] font-bold uppercase text-text-primary mb-2 flex items-center gap-2">
            <Key size={14} className="text-accent-primary" /> Token PAT
          </h4>
          <p className="text-[10px] text-text-tertiary leading-relaxed uppercase font-semibold">
            Necessário para acesso seguro.
          </p>
        </div>
        <div className="space-y-4">
          <input type="password" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="TOKEN..." className="w-full bg-bg-primary border border-border-subtle p-3 text-[10px] font-mono text-text-primary focus:border-accent-primary outline-none uppercase" />
          <button onClick={() => updateToken(tokenInput)} className="w-full py-3 bg-accent-primary hover:bg-accent-secondary text-white font-bold text-[10px] uppercase tracking-widest transition-all">Autenticar</button>
        </div>
      </div>
    );
  }

  if (!repoPath) {
    return (
      <div className="p-6 flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center gap-3 p-4 bg-accent-primary/10 border border-border-visible">
          <CheckCircle2 size={16} className="text-accent-primary" />
          <span className="text-[10px] font-bold uppercase text-text-primary tracking-widest">Autenticado</span>
        </div>
        <div className="space-y-4">
          <input type="text" value={repoInput} onChange={(e) => setRepoInput(e.target.value)} placeholder="USUARIO/REPOS..." className="w-full bg-bg-primary border border-border-subtle p-3 text-[10px] font-mono text-text-primary focus:border-accent-primary outline-none uppercase" />
          <button onClick={() => connectRepo(repoInput)} className="w-full py-3 bg-accent-primary hover:bg-accent-secondary text-white font-bold text-[10px] uppercase tracking-widest transition-all">Conectar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-secondary animate-fade-in">
      <div className="p-4 border-b border-border-subtle bg-bg-primary/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github size={16} className="text-accent-primary" />
          <span className="text-[11px] font-bold uppercase text-text-primary truncate max-w-[150px]">{repoPath}</span>
        </div>
        <button onClick={refreshTree} className={`p-1.5 text-text-tertiary hover:text-accent-primary ${isLoading ? 'animate-spin' : ''}`}>
          <RefreshCcw size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {isLoading && !tree ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 opacity-30">
            <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent animate-spin"></div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary">Mapeando...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center space-y-4">
            <AlertCircle size={32} className="mx-auto text-red-400 opacity-40" />
            <p className="text-[10px] text-red-400 font-bold uppercase">{error}</p>
          </div>
        ) : tree?.items ? (
          <div className="flex flex-col">
            {tree.items.map((item: any) => (
              <TreeNode key={item.path} item={item} level={0} onFileSelect={handleFileSelect} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-[9px] text-text-tertiary font-bold uppercase tracking-widest italic border border-dashed border-border-subtle m-2">
            Vazio
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border-subtle bg-bg-primary/50 flex flex-col gap-2">
        <button onClick={disconnect} className="w-full py-2 border border-border-subtle text-red-400/70 hover:text-red-400 text-[9px] font-bold uppercase tracking-widest transition-all">Desconectar</button>
      </div>
    </div>
  );
};

export default GitHubViewer;