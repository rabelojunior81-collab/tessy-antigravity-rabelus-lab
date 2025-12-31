
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLayout } from '../../hooks/useLayout';
import { Terminal as TerminalIcon, XCircle, Trash2, Command } from 'lucide-react';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
}

const Terminal: React.FC = () => {
  const { alturaTerminal, ajustarAlturaTerminal } = useLayout();
  const [isResizing, setIsResizing] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'system', content: 'TESSY OS [Version 3.1.0-ANTIGRAVITY]' },
    { type: 'system', content: '(c) 2024 Rabelus Lab. Todos os direitos reservados.' },
    { type: 'system', content: 'Conexão estabelecida com NÚCLEO_GEMINI_V3.' },
    { type: 'output', content: 'Digite "help" para ver os comandos disponíveis.' },
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

  // Focus input on click anywhere in terminal
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
        output = `Comandos disponíveis:
  ls        - Listar diretórios do projeto
  pwd       - Mostrar diretório atual
  clear     - Limpar o terminal
  echo [t]  - Repetir texto
  date      - Data e hora atual
  whoami    - Identificação do operador
  tessy     - Status do núcleo de IA
  help      - Mostrar esta mensagem`;
        break;
      case 'ls':
        output = 'src/  public/  node_modules/  package.json  README.md  tessy.config.js';
        break;
      case 'pwd':
        output = '/workspace/rabelus-lab/tessy-core';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'echo':
        output = args.join(' ');
        break;
      case 'date':
        output = new Date().toLocaleString('pt-BR');
        break;
      case 'whoami':
        output = 'tessy-operator@rabelus-lab';
        break;
      case 'tessy':
        output = `STATUS DO NÚCLEO:
  Modelo Ativo: Gemini 3 Flash
  Latência: 142ms
  Grounding: ATIVO
  Memória de Contexto: 128k tokens
  Integridade: 100%`;
        type = 'system';
        break;
      default:
        output = `Comando não reconhecido: ${baseCmd}. Digite "help" para assistência.`;
        type = 'error';
    }

    if (output) {
      setTimeout(() => {
        setHistory(prev => [...prev, { type, content: output! }]);
      }, 100);
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

  // Resize logic
  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => setIsResizing(false);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 120 && newHeight <= window.innerHeight * 0.7) {
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
      className="bg-[#050505] border-t border-gray-800 flex flex-col shrink-0 relative transition-[height] duration-75"
      onClick={handleTerminalClick}
    >
      <div 
        onMouseDown={startResizing}
        className="resize-handle-v absolute top-0 left-0 right-0 h-[4px] z-20 hover:bg-emerald-500/50 transition-colors"
      />
      
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-800 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-3">
          <TerminalIcon size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/80">Terminal v3.1</span>
          <div className="flex gap-1.5 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/40"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); setHistory([]); }}
            className="text-gray-500 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={12} />
            <span className="text-[8px] font-black uppercase">Limpar</span>
          </button>
          <div className="h-3 w-px bg-gray-800"></div>
          <span className="text-[8px] font-mono text-gray-600 uppercase">SSH: localhost:3001</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 font-mono text-xs leading-relaxed">
        {history.map((line, idx) => (
          <div key={idx} className="mb-1.5 animate-fade-in">
            {line.type === 'input' ? (
              <div className="flex gap-2">
                <span className="text-emerald-500 font-black">$</span>
                <span className="text-gray-200">{line.content}</span>
              </div>
            ) : (
              <div className={`whitespace-pre-wrap ${
                line.type === 'error' ? 'text-red-500' : 
                line.type === 'system' ? 'text-emerald-500/40 italic' : 
                'text-emerald-500/80'
              }`}>
                {line.content}
              </div>
            )}
          </div>
        ))}
        
        <div className="flex items-center gap-2 mt-2">
          <span className="text-emerald-500 font-black">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-gray-200 font-mono caret-emerald-500"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={outputEndRef} />
      </div>

      <div className="px-4 py-1 border-t border-gray-800 bg-[#0a0a0a] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Command size={10} className="text-gray-600" />
            <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest">Help: Digite help</span>
          </div>
        </div>
        <span className="text-[7px] font-mono text-emerald-500/40 uppercase">Tessy-Shell-v3.1-Stable</span>
      </div>
    </div>
  );
};

export default Terminal;
