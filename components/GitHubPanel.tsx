import React, { useState, useEffect, useCallback } from 'react';
import { fetchRepo, fetchCommits, createIssue, formatRelativeDate, GitHubError } from '../services/githubService';
import { getGitHubToken } from '../services/dbService';
import { GitHubRepo, GitHubCommit } from '../types';

interface GitHubPanelProps {
  repoPath: string;
}

const GitHubPanel: React.FC<GitHubPanelProps> = ({ repoPath }) => {
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [showToast, setShowToast] = useState(false);

  const formatCommitDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const isToday = date.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Hoje às ${timeStr}`;
    if (isYesterday) return `Ontem às ${timeStr}`;
    
    return formatRelativeDate(dateString);
  };

  const loadGitHubData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const token = await getGitHubToken();
      if (!token) {
        setError('Token do GitHub não configurado.');
        setLoading(false);
        return;
      }

      const [repoData, commitData] = await Promise.all([
        fetchRepo(token, repoPath),
        fetchCommits(token, repoPath)
      ]);

      setRepo(repoData);
      setCommits(commitData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do GitHub.');
    } finally {
      setLoading(false);
    }
  }, [repoPath]);

  useEffect(() => {
    loadGitHubData();
  }, [loadGitHubData]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim()) return;
    
    setIsCreatingIssue(true);
    try {
      const token = await getGitHubToken();
      if (!token) throw new Error('Token não configurado.');
      
      await createIssue(token, repoPath, issueTitle, `Reportado via Tessy App em ${new Date().toLocaleString()}`);
      setIssueTitle('');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      alert(`Falha ao criar issue: ${err.message}`);
    } finally {
      setIsCreatingIssue(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-slate-900/40 border-2 lg:border border-emerald-600/20 shadow-[6px_6px_0_rgba(16,185,129,0.1)] p-6 space-y-6">
        <div className="flex justify-between items-center border-b-2 lg:border-b border-emerald-600/10 pb-4 animate-pulse">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800"></div>
             <div className="space-y-2">
               <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800"></div>
               <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800"></div>
             </div>
           </div>
        </div>
        <div className="space-y-4">
          <div className="w-32 h-2.5 bg-slate-200 dark:bg-slate-800 uppercase animate-pulse"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 border-l-2 lg:border-l border-emerald-600/20 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border-2 lg:border border-red-600/20 bg-red-600/5 flex flex-col items-center text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-[10px] font-black text-red-600 uppercase mb-2">ERRO NA INTEGRAÇÃO</span>
        <p className="text-[9px] text-slate-500 font-bold uppercase">{error}</p>
        <button onClick={() => loadGitHubData()} className="mt-4 px-4 py-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest active:scale-95">Reconectar</button>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-slate-900/40 border-2 lg:border border-emerald-600/20 shadow-[6px_6px_0_rgba(16,185,129,0.1)] lg:shadow-[8px_8px_0_rgba(16,185,129,0.15)] p-6 space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center border-b-2 lg:border-b border-emerald-600/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 text-white lg:shadow-[2px_2px_0_rgba(16,185,129,0.4)]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">{repo?.name}</h4>
            <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">{repo?.default_branch} branch active</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => loadGitHubData(true)} 
             className="p-1.5 text-slate-400 hover:text-emerald-600 transition-all hover:rotate-180 duration-500 cursor-pointer lg:hover:scale-110"
             title="Atualizar lista"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
           </button>
           <a href={repo?.url} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-slate-400 hover:text-emerald-600 uppercase border border-slate-300 dark:border-emerald-500/30 px-2 py-1 transition-all lg:hover:shadow-[2px_2px_0_rgba(16,185,129,0.3)]">Link</a>
        </div>
      </div>

      <div>
        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Commits Recentes</h5>
        <div className="space-y-3">
          {commits.length === 0 ? (
            <p className="text-[9px] text-slate-400 font-bold uppercase italic text-center py-4">Nenhum commit localizado</p>
          ) : (
            commits.map((commit) => (
              <div key={commit.sha} className="p-3 bg-slate-50 dark:bg-slate-800 border-l-2 lg:border-l border-emerald-500 flex flex-col gap-1 group hover:bg-emerald-500/5 transition-all lg:shadow-[2px_2px_0_rgba(0,0,0,0.03)] hover:lg:shadow-[4px_4px_0_rgba(16,185,129,0.1)] hover:lg:-translate-y-0.5">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-bold text-slate-800 dark:text-white line-clamp-1 flex-1 transition-colors group-hover:text-emerald-600">{commit.message}</span>
                  <span className="text-[8px] font-mono text-emerald-600 shrink-0">{commit.sha.substring(0, 7)}</span>
                </div>
                <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-500">
                  <span>{commit.author}</span>
                  <span>{formatCommitDate(commit.date)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 border-t-2 lg:border-t border-emerald-600/10">
        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Reportar Issue</h5>
        <form onSubmit={handleCreateIssue} className="flex gap-2">
          <input 
            type="text" 
            value={issueTitle}
            onChange={(e) => setIssueTitle(e.target.value)}
            placeholder="TÍTULO DA ISSUE..." 
            className="flex-1 bg-slate-50 dark:bg-slate-950 border-2 lg:border border-slate-300 dark:border-emerald-500/30 p-2.5 text-[10px] font-black text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all !rounded-none focus:lg:shadow-[4px_4px_0_rgba(16,185,129,0.1)]"
          />
          <button 
            type="submit" 
            disabled={isCreatingIssue || !issueTitle.trim()}
            className="bg-emerald-600 text-white text-[10px] font-black uppercase px-4 py-2.5 hover:bg-emerald-700 disabled:opacity-50 transition-all !rounded-none active:scale-95 brutalist-button lg:shadow-[3px_3px_0_rgba(0,0,0,0.8)] hover:lg:-translate-y-0.5 hover:lg:shadow-[4px_4px_0_rgba(0,0,0,0.9)]"
          >
            {isCreatingIssue ? '...' : 'Enviar'}
          </button>
        </form>
      </div>

      {showToast && (
        <div className="fixed bottom-4 right-4 bg-emerald-600 text-white px-6 py-4 font-black uppercase text-[10px] tracking-widest shadow-2xl animate-slide-in-right z-[10000] border-2 lg:border border-black dark:border-white lg:shadow-[8px_8px_0_rgba(0,0,0,0.5)]">
          Issue criada com sucesso no GitHub!
        </div>
      )}
    </div>
  );
};

export default GitHubPanel;