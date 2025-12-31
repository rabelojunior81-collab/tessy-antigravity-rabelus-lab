
import React, { useState, useEffect } from 'react';
import { setGitHubToken } from '../services/dbService';

interface GitHubTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GitHubTokenModal: React.FC<GitHubTokenModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setToken('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('O token é obrigatório.');
      return;
    }
    
    try {
      await setGitHubToken(token.trim());
      onSuccess();
      handleClose();
    } catch (err) {
      setError('Erro ao salvar o token.');
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`glass-panel !rounded-none w-full max-w-md !bg-white dark:!bg-slate-900 border-4 border-emerald-500 shadow-[15px_15px_0_rgba(16,185,129,0.3)] overflow-hidden ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b-4 border-emerald-500 bg-emerald-500/10 flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Autenticação GitHub</h3>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Sincronização Segura</span>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="p-4 bg-amber-500/10 border-2 border-amber-500 text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase leading-relaxed">
            AVISO: O token será armazenado localmente no seu navegador de forma segura. Certifique-se de usar um Token com escopo 'repo'.
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Personal Access Token (PAT)</label>
            <input
              autoFocus
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-300 dark:border-emerald-500/30 p-4 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-emerald-500 transition-all !rounded-none"
            />
            {error && <p className="text-[10px] text-red-600 font-black uppercase mt-1">{error}</p>}
          </div>

          <div className="flex flex-col gap-4">
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase underline text-center"
            >
              Como gerar um token no GitHub?
            </a>
            
            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs border-2 border-black dark:border-white shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer active:scale-95"
            >
              Salvar Credenciais
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GitHubTokenModal;
