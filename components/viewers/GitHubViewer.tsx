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
    <div className="flex flex-col select-none">
      <div 
        onClick={handleClick}
        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-emerald-500/5 cursor-pointer transition-colors border-l-2 group ${
          isOpen && isFolder ? 'border-emerald-500/40' : 'border-transparent'
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <span className="text-gray-500">
          {isFolder ? (
            isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="w-3.5" />
          )}
        </span>
        <span className={isFolder ? 'text-emerald-500/80' : 'text-gray-400 group-hover:text-white transition-colors'}>
          {isFolder ? (
            isOpen ? <Folder size={14} fill="currentColor" opacity={0.2} /> : <Folder size={14} />
          ) : (
            <File size={14} />
          )}
        </span>
        <span className={`text-[10px] font-mono tracking-tight ${isFolder ? 'font-bold' : ''}`}>
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
      <div className="p-6 flex flex-col gap-6 animate-fade-in">
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
          <h4 className="text-[10px] font-black uppercase text-emerald-500 mb-2 flex items-center gap-2">
            <Key size={12} /> Autenticação Necessária
          </h4>
          <p className="text-[9px] text-gray-500 leading-relaxed uppercase font-bold tracking-wider">
            Insira seu Personal Access Token (PAT) do GitHub para iniciar a sincronização segura de diretórios.
          </p>
        </div>
        <div className="space-y-4">
          <input 
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="GHP_XXXXXXXXXXXXXXXX"
            className="w-full bg-[#0a0a0a] border border-gray-800 p-3 text-[10px] font-mono text-white focus:border-emerald-500 outline-none transition-all uppercase tracking-widest"
          />
          <button 
            onClick={() => updateToken(tokenInput)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all"
          >
            Autenticar Core
          </button>
        </div>
      </div>
    );
  }

  if (!repoPath) {
    return (
      <div className="p-6 flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Sessão Autenticada</span>
        </div>
        <div className="space-y-4">
          <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Caminho do Repositório</label>
          <input 
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="USUARIO/REPOSITORIO"
            className="w-full bg-[#0a0a0a] border border-gray-800 p-3 text-[10px] font-mono text-white focus:border-emerald-500 outline-none transition-all uppercase tracking-widest"
          />
          <button 
            onClick={() => connectRepo(repoInput)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all"
          >
            Conectar Protocolo Git
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#111111] animate-fade-in">
      <div className="p-4 border-b border-gray-800 bg-[#0a0a0a]/50 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase text-white tracking-tighter truncate max-w-[180px]">{repoPath}</span>
          </div>
          <button 
            onClick={refreshTree}
            className={`p-1.5 text-gray-500 hover:text-emerald-500 transition-all ${isLoading ? 'animate-spin' : ''}`}
          >
            <RefreshCcw size={14} />
          </button>
        </div>
        <button 
          onClick={disconnect}
          className="text-[8px] font-black uppercase text-red-500/60 hover:text-red-500 transition-colors self-start"
        >
          Desconectar Repositório
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {isLoading && !tree ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 opacity-40">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent animate-spin"></div>
            <span className="text-[8px] font-black uppercase tracking-widest">Mapeando Árvore...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center space-y-4">
            <AlertCircle size={32} className="mx-auto text-red-500 opacity-50" />
            <p className="text-[10px] text-red-400 font-bold uppercase leading-relaxed">{error}</p>
            <button onClick={refreshTree} className="text-[9px] font-black text-emerald-500 uppercase underline">Tentar Novamente</button>
          </div>
        ) : tree?.items ? (
          <div className="flex flex-col">
            {tree.items.map((item: any) => (
              <TreeNode key={item.path} item={item} level={0} onFileSelect={handleFileSelect} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-[9px] text-gray-600 font-black uppercase tracking-widest italic border border-dashed border-gray-800 m-2">
            Estrutura vazia ou não carregada
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800 bg-[#0a0a0a]/50 grid grid-cols-3 gap-2">
        <button className="py-2 bg-gray-800/40 border border-gray-800 text-gray-500 text-[8px] font-black uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-500/20 transition-all">Sync</button>
        <button className="py-2 bg-gray-800/40 border border-gray-800 text-gray-500 text-[8px] font-black uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-500/20 transition-all">Commit</button>
        <button className="py-2 bg-gray-800/40 border border-gray-800 text-gray-500 text-[8px] font-black uppercase tracking-widest hover:text-emerald-500 hover:border-emerald-500/20 transition-all">Push</button>
      </div>
    </div>
  );
};

export default GitHubViewer;
