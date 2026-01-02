import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as TerminalIcon, Trash2, ShieldCheck } from 'lucide-react';
import 'xterm/css/xterm.css';

const RealTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddonInstance = useRef<FitAddon | null>(null);
  const lineBuffer = useRef<string>('');

  const PROMPT = '\x1b[1;34m$\x1b[0m ';

  const writeWelcome = (term: Terminal) => {
    term.writeln('\x1b[1;36mTESSY OS [Build 3.2.1-antigravity]\x1b[0m');
    term.writeln('\x1b[1;32mNucleus Core Online.\x1b[0m');
    term.writeln('');
    term.write(PROMPT);
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#0d1b2a',
        foreground: '#f0f8ff',
        cursor: '#4a9eff',
        selectionBackground: 'rgba(74, 158, 255, 0.3)',
        black: '#000000',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#f8f8f2',
      },
      fontFamily: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'block',
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Mount to DOM
    term.open(terminalRef.current);
    
    // Initial fit
    setTimeout(() => {
        fitAddon.fit();
    }, 100);

    xtermInstance.current = term;
    fitAddonInstance.current = fitAddon;

    writeWelcome(term);

    const handleData = (data: string) => {
      const code = data.charCodeAt(0);
      
      if (data === '\r') { // Enter
        term.write('\r\n');
        const cmd = lineBuffer.current.trim();
        if (cmd) {
          term.writeln(`\x1b[31mError:\x1b[0m Command '${cmd}' not implemented in this build.`);
        }
        lineBuffer.current = '';
        term.write(PROMPT);
      } else if (code === 127) { // Backspace
        if (lineBuffer.current.length > 0) {
          lineBuffer.current = lineBuffer.current.slice(0, -1);
          term.write('\b \b');
        }
      } else if (code < 32) {
        // Ignore other control codes
      } else {
        lineBuffer.current += data;
        term.write(data);
      }
    };

    const dataDisposable = term.onData(handleData);

    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonInstance.current) {
        fitAddonInstance.current.fit();
      }
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      dataDisposable.dispose();
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  const clearTerminal = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
      lineBuffer.current = '';
      writeWelcome(xtermInstance.current);
    }
  };

  return (
    <div className="h-full bg-[#0d1b2a] border-t border-border-visible flex flex-col shrink-0 relative overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <TerminalIcon size={14} className="text-accent-primary opacity-60" />
          <span className="text-xs font-medium tracking-normal text-text-primary">System Shell v3.2</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={clearTerminal}
            className="text-text-tertiary hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <Trash2 size={12} />
            <span className="text-[10px] font-normal tracking-normal">Clear</span>
          </button>
          <div className="h-4 w-px bg-border-subtle"></div>
          <div className="flex items-center gap-2 text-[9px] font-medium text-text-tertiary uppercase tracking-wide">
             <ShieldCheck size={12} className="text-accent-primary/50" />
             Encrypted
          </div>
        </div>
      </div>

      {/* xterm.js Container */}
      <div 
        ref={terminalRef} 
        className="flex-1 w-full h-full p-2 bg-[#0d1b2a]"
      />
      
      <style>{`
        .xterm-viewport::-webkit-scrollbar { width: 4px; }
        .xterm-viewport::-webkit-scrollbar-track { background: transparent; }
        .xterm-viewport::-webkit-scrollbar-thumb { background: rgba(86, 156, 214, 0.3); }
        .xterm { padding: 12px; }
        .xterm-cursor { box-shadow: 0 0 10px #4a9eff; }
      `}</style>
    </div>
  );
};

export default React.memo(RealTerminal);