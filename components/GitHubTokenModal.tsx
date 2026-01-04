
import React, { useState, useEffect } from 'react';
// Fix: Import setGitHubToken from githubService instead of dbService
import { setGitHubToken } from '../services/githubService';
import { X, Key } from 'lucide-react';

interface GitHubTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GitHubTokenModal: React.FC<GitHubTokenModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [token, setToken] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) { setIsClosing(false); setToken(''); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsClosing(false); onClose(); }, 100);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    try {
      await setGitHubToken(token.trim());
      onSuccess();
      handleClose();
    } catch (err) { }
  };

  return (
    <div className={`fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
      <div className={`w-full max-w-sm bg-bg-secondary border border-border-visible flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border-subtle bg-bg-primary flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="text-accent-primary" size={16} />
            <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-text-primary">Autenticação</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all"><X size={20} /></button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase leading-relaxed tracking-widest text-center">
            Insira seu PAT com escopo 'repo'.
          </p>
          <input autoFocus type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="GHP_XXXXXXXXXXXXXXXX" className="w-full bg-bg-tertiary border border-border-subtle p-3 text-[10px] font-mono text-text-primary focus:border-accent-primary outline-none uppercase text-center" />
          <div className="flex flex-col gap-4">
            <button type="submit" className="w-full py-4 bg-accent-primary hover:bg-accent-secondary text-white font-bold uppercase tracking-widest text-[10px] transition-all">Salvar Credenciais</button>
            <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-accent-primary uppercase underline text-center opacity-60">Gerar Token</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GitHubTokenModal;
