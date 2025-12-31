import React, { useState } from 'react';
import { Github, Key, Globe, RefreshCcw, Folder, File, ChevronRight, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGitHub } from '../../contexts/GitHubContext';
import { useLayout } from '../../hooks/useLayout';

const TreeNode: React.FC<{ item: any; level: number; onFileSelect: (path: string) => void }> = ({ item, level, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = item.type === 'dir';

  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(item.path);
    }
  };

  return (
    <div className="flex flex-col select-none rounded-none">
      <div 
        onClick={handleClick}
        className={`flex items-center gap-3 py-2 px-3 hover:bg-accent-primary/5 cursor-pointer transition-colors border-l-2 group ${
          isOpen && isFolder ? 'border-accent-primary/40' : 'border-transparent'
        }`}
        style={{ paddingLeft: `${level * 18 + 12}px` }}
      >
        <span className="text-text-tertiary">
          {isFolder ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="w-4" />
          )}
        </span>
        <span className={isFolder ? 'text-accent-primary/80' : 'text-text-tertiary group-hover:text-text-primary transition-colors'}>
          {isFolder ? (
            isOpen ? <Folder size={16} fill="currentColor" opacity={0.2} /> : <Folder size={16} />
          ) : (
            <File size={16} />
          )}
        </span>
        <span className={`text-[11px] font-mono tracking-tighter ${isFolder ? 'font-bold text-text-secondary' : 'text-text-tertiary'}`}>
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
      const ext = path.split('.').pop() || 'text';
      selecionarArquivo({
        path: fileData.path,
        content: fileData.content || '',
        language: ext
      });
    } catch (err: any) {
      alert(`Erro ao carregar arquivo: ${err.message}`);
    }
  };

  if (!token) {
    return (
      <div className="p-9 flex flex-col gap-9 animate-fade-in">
        <div className="p-6 bg-accent-primary/5 border border-border-visible rounded-none">
          <h4 className="text-[12px] font-bold uppercase text-text-primary mb-3 flex items-center gap-3">
            <Key size={14} className="text-accent-primary" /> Autenticação Necessária
          </h4>
          <p className="text-[10px] text-text-tertiary leading-relaxed uppercase font-semibold tracking-widest">
            Insira seu Personal Access Token (PAT) do GitHub para iniciar a sincronização segura de diretórios.
          </p>
        </div>
        <div className="space-y-6">
          <input 
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="GHP_XXXXXXXXXXXXXXXX"
            className="w-full bg-bg-primary border border-border-subtle p-4 text-[11px] font-mono text-text-primary focus:border-accent-primary outline-none transition-all uppercase tracking-widest rounded-none"
          />
          <button 
            onClick={() => updateToken(tokenInput)}
            className="w-full py-4 bg-accent-primary hover:bg-accent-secondary text-white font-bold text-[11px] uppercase tracking-[0.2em] transition-all rounded-none"
          >
            Autenticar Core
          </button>
        </div>
      </div>
    );
  }

  if (!repoPath) {
    return (
      <div className="p-9 flex flex-col gap-9 animate-fade-in">
        <div className="flex items-center gap-4 p-6 bg-accent-primary/10 border border-border-visible rounded-none">
          <CheckCircle2 size={20} className="text-accent-primary" />
          <span className="text-[11px] font-bold uppercase text-text-primary tracking-widest">Sessão Autenticada</span>
        </div>
        <div className="space-y-6">
          <label className="text-[10px] font-semibold text-text-tertiary uppercase tracking-widest block">Caminho do Repositório</label>
          <input 
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="USUARIO/REPOSITORIO"
            className="w-full bg-bg-primary border border-border-subtle p-4 text-[11px] font-mono text-text-primary focus:border-accent-primary outline-none transition-all uppercase tracking-widest rounded-none"
          />
          <button 
            onClick={() => connectRepo(repoInput)}
            className="w-full py-4 bg-accent-primary hover:bg-accent-secondary text-white font-bold text-[11px] uppercase tracking-[0.2em] transition-all rounded-none"
          >
            Conectar Protocolo Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-secondary animate-fade-in">
      <div className="p-6 border-b border-border-subtle bg-bg-primary/50 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Github size={18} className="text-accent-primary" />
            <span className="text-[12px] font-bold uppercase text-text-primary tracking-tighter truncate max-w-[200px]">{repoPath}</span>
          </div>
          <button 
            onClick={refreshTree}
            className={`p-2 text-text-tertiary hover:text-accent-primary transition-all ${isLoading ? 'animate-spin' : ''}`}
          >
            <RefreshCcw size={18} />
          </button>
        </div>
        <button 
          onClick={disconnect}
          className="text-[10px] font-semibold uppercase text-red-400/70 hover:text-red-400 transition-colors self-start"
        >
          Desconectar Repositório
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {isLoading && !tree ? (
          <div className="flex flex-col items-center justify-center p-16 gap-4 opacity-40">
            <div className="w-5 h-5 border-2 border-accent-primary border-t-transparent animate-spin"></div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Mapeando Árvore...</span>
          </div>
        ) : error ? (
          <div className="p-9 text-center space-y-6">
            <AlertCircle size={40} className="mx-auto text-red-400 opacity-50" />
            <p className="text-[11px] text-red-400 font-bold uppercase leading-relaxed tracking-tight">{error}</p>
            <button onClick={refreshTree} className="text-[10px] font-bold text-accent-primary uppercase underline tracking-widest">Tentar Novamente</button>
          </div>
        ) : tree?.items ? (
          <div className="flex flex-col">
            {tree.items.map((item: any) => (
              <TreeNode key={item.path} item={item} level={0} onFileSelect={handleFileSelect} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-[10px] text-text-tertiary font-bold uppercase tracking-widest italic border border-dashed border-border-subtle m-3 rounded-none">
            Estrutura vazia ou não carregada
          </div>
        )}
      </div>

      <div className="p-6 border-t border-border-subtle bg-bg-primary/50 grid grid-cols-3 gap-3">
        <button className="py-3 bg-bg-secondary border border-border-subtle text-text-tertiary text-[10px] font-bold uppercase tracking-widest hover:text-accent-primary hover:border-accent-primary/20 transition-all rounded-none">Sync</button>
        <button className="py-3 bg-bg-secondary border border-border-subtle text-text-tertiary text-[10px] font-bold uppercase tracking-widest hover:text-accent-primary hover:border-accent-primary/20 transition-all rounded-none">Commit</button>
        <button className="py-3 bg-bg-secondary border border-border-subtle text-text-tertiary text-[10px] font-bold uppercase tracking-widest hover:text-accent-primary hover:border-accent-primary/20 transition-all rounded-none">Push</button>
      </div>
    </div>
  );
};

export default GitHubViewer;