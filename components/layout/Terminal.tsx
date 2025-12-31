import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal as TerminalIcon, Trash2, ShieldCheck } from 'lucide-react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: 'TESSY OS [Build 3.1.0-STABLE]' },
    { type: 'system', content: 'Kernel Antigravity Ativo.' },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = useCallback((cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setHistory(prev => [...prev, { type: 'input', content: trimmedCmd }]);
    setCmdHistory(prev => [trimmedCmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    const parts = trimmedCmd.toLowerCase().split(' ');
    const baseCmd = parts[0];

    let output: string | null = null;
    let type: 'output' | 'error' | 'system' = 'output';

    switch (baseCmd) {
      case 'help':
        output = 'ls, pwd, clear, date, whoami, tessy';
        break;
      case 'ls':
        output = 'src/ public/ readme.md';
        break;
      case 'pwd':
        output = '/workspace/rabelus-lab/tessy-nucleus';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'date':
        output = new Date().toLocaleString('pt-BR');
        break;
      case 'whoami':
        output = 'tessy-operator';
        break;
      case 'tessy':
        output = 'STATUS: ONLINE\nCORE: GEMINI 3\nSYNC: 100%';
        type = 'system';
        break;
      default:
        output = `Erro: "${baseCmd}" desconhecido.`;
        type = 'error';
    }

    if (output) {
      setTimeout(() => {
        setHistory(prev => [...prev, { type, content: output! }]);
      }, 50);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div 
      className="h-[200px] bg-bg-secondary/60 backdrop-blur-xl border-t border-border-subtle flex flex-col shrink-0 relative select-none"
      onClick={() => inputRef.current?.focus()}
      style={{ height: '200px' }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <TerminalIcon size={14} className="text-accent-primary/60" />
          <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-text-primary">Shell v3.1</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); setHistory([]); }}
            className="text-text-tertiary hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <Trash2 size={12} />
            <span className="text-[10px] font-semibold uppercase tracking-widest">Clear</span>
          </button>
          <div className="h-4 w-px bg-border-subtle"></div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-text-tertiary uppercase tracking-widest">
             <ShieldCheck size={12} className="text-accent-primary/40" />
             Secure
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-[12px] leading-relaxed cursor-text bg-bg-tertiary/20">
        {history.map((line, idx) => (
          <div key={idx} className="mb-1">
            {line.type === 'input' ? (
              <div className="flex gap-2">
                <span className="text-accent-primary font-black opacity-60">λ</span>
                <span className="text-text-primary">{line.content}</span>
              </div>
            ) : (
              <div className={`whitespace-pre-wrap ${
                line.type === 'error' ? 'text-red-400' : 
                line.type === 'system' ? 'text-accent-primary/50' : 
                'text-text-secondary opacity-80'
              }`}>
                {line.content}
              </div>
            )}
          </div>
        ))}
        
        <div className="flex items-center gap-2">
          <span className="text-accent-primary font-black opacity-60">λ</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-text-primary font-mono text-[12px] caret-accent-primary"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={outputEndRef} className="h-4" />
      </div>
    </div>
  );
};

export default React.memo(Terminal);