import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLayout } from '../../hooks/useLayout';
import { Terminal as TerminalIcon, Trash2, Command, ShieldCheck } from 'lucide-react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

const Terminal: React.FC = () => {
  const { alturaTerminal, ajustarAlturaTerminal } = useLayout();
  const [isResizing, setIsResizing] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: 'TESSY OS [Build 3.1.0-STABLE]' },
    { type: 'system', content: 'Iniciando Kernel Antigravity...' },
    { type: 'system', content: 'Conexão segura estabelecida via Gemini 3 Nucleus.' },
    { type: 'output', content: 'Digite "help" para ver os comandos de sistema.' },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const outputEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const executeCommand = useCallback((cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setHistory(prev => [...prev, { type: 'input', content: trimmedCmd }]);
    setCmdHistory(prev => [trimmedCmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    const parts = trimmedCmd.toLowerCase().split(' ');
    const baseCmd = parts[0];
    const args = parts.slice(1);

    let output: string | null = null;
    let type: 'output' | 'error' | 'system' = 'output';

    switch (baseCmd) {
      case 'help':
        output = `COMANDOS DISPONÍVEIS:
  ls        - Listar diretórios virtuais
  pwd       - Diretório atual de trabalho
  clear     - Limpar buffer de saída
  echo [t]  - Repetir texto na saída
  date      - Data e hora sincronizada
  whoami    - Identificação do operador
  tessy     - Status vital do núcleo
  help      - Mostrar este guia`;
        break;
      case 'ls':
        output = 'src/  public/  assets/  config/  lib/  manifest.json  readme.md';
        break;
      case 'pwd':
        output = '/workspace/rabelus-lab/tessy-nucleus-01';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'echo':
        output = args.length > 0 ? args.join(' ') : ' ';
        break;
      case 'date':
        output = new Date().toLocaleString('pt-BR');
        break;
      case 'whoami':
        output = 'tessy-operator@rabelus-nucleus';
        break;
      case 'tessy':
        output = `RELATÓRIO DE STATUS:
  Núcleo: Ativo (Gemini 3)
  Latência: 118ms (Nominal)
  Grounding: Online
  Tokens Disponíveis: 128k
  Sincronização: 100% Estável`;
        type = 'system';
        break;
      default:
        output = `Comando desconhecido: "${baseCmd}". Digite help.`;
        type = 'error';
    }

    if (output) {
      setTimeout(() => {
        setHistory(prev => [...prev, { type, content: output! }]);
      }, 80);
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

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => setIsResizing(false);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 100 && newHeight <= window.innerHeight * 0.6) {
        ajustarAlturaTerminal(newHeight);
      }
    }
  }, [isResizing, ajustarAlturaTerminal]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize]);

  return (
    <div 
      ref={terminalRef}
      style={{ height: `${alturaTerminal}px` }}
      className="bg-bg-primary border-t border-border-subtle flex flex-col shrink-0 relative transition-[height] duration-75 select-none"
      onClick={handleTerminalClick}
    >
      <div 
        onMouseDown={startResizing}
        className="resize-handle-v absolute top-0 left-0 right-0 h-[4px] z-20 hover:bg-accent-primary/40 transition-colors"
      />
      
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle/50 bg-bg-secondary shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <TerminalIcon size={14} className="text-accent-primary/60" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-primary/80">Tessy Shell v3.1</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-sm bg-accent-primary/10"></div>
            <div className="w-1.5 h-1.5 rounded-sm bg-accent-primary/20"></div>
            <div className="w-1.5 h-1.5 rounded-sm bg-accent-primary/40"></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); setHistory([]); }}
            className="text-text-tertiary hover:text-red-400 transition-colors flex items-center gap-2 group"
          >
            <Trash2 size={12} className="opacity-50 group-hover:opacity-100" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Limpar</span>
          </button>
          <div className="h-4 w-px bg-border-subtle"></div>
          <div className="flex items-center gap-2 text-[8px] font-mono text-accent-primary/40 uppercase">
             <ShieldCheck size={10} />
             Secure_Layer: Active
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 font-mono text-[11px] leading-relaxed cursor-text selection:bg-accent-primary/20 bg-bg-primary/30">
        {history.map((line, idx) => (
          <div key={idx} className="mb-1.5 animate-fade-in">
            {line.type === 'input' ? (
              <div className="flex gap-3">
                <span className="text-accent-primary font-black">λ</span>
                <span className="text-text-primary">{line.content}</span>
              </div>
            ) : (
              <div className={`whitespace-pre-wrap ${
                line.type === 'error' ? 'text-red-400/90' : 
                line.type === 'system' ? 'text-accent-primary/40 italic' : 
                'text-accent-primary/70'
              }`}>
                {line.content}
              </div>
            )}
          </div>
        ))}
        
        <div className="flex items-center gap-3 mt-3">
          <span className="text-accent-primary font-black">λ</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-text-primary font-mono text-[11px] caret-accent-primary"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={outputEndRef} className="h-4" />
      </div>

      <div className="px-4 py-1.5 border-t border-border-subtle bg-bg-secondary flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Command size={10} className="text-text-tertiary" />
            <span className="text-[7px] font-bold text-text-tertiary uppercase tracking-widest">Comando: help</span>
          </div>
        </div>
        <span className="text-[7px] font-mono text-text-tertiary uppercase">TTY: /dev/nucleus_01</span>
      </div>
    </div>
  );
};

export default React.memo(Terminal);