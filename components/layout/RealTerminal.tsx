import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as TerminalIcon, Trash2, ShieldCheck } from 'lucide-react';

const RealTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create Terminal Instance
    const term = new Terminal({
      theme: {
        background: '#0a1628',
        foreground: '#e0e7ff',
        cursor: '#4a9eff',
        selectionBackground: 'rgba(74, 158, 255, 0.3)',
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'block',
      allowProposedApi: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Mount to DOM
    term.open(terminalRef.current);
    fitAddon.fit();
    xtermInstance.current = term;

    // Initial Message
    term.writeln('\x1b[1;34mTESSY REAL TERMINAL\x1b[0m - Aguardando backend WebSocket...');
    term.write('\r\n\x1b[33mλ\x1b[0m ');

    // Handle Resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    // Basic Input Echo (Temporary until WebSocket)
    term.onData(data => {
      if (data === '\r') {
        term.write('\r\n\x1b[33mλ\x1b[0m ');
      } else if (data === '\u007f') { // Backspace
        term.write('\b \b');
      } else {
        term.write(data);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
      xtermInstance.current = null;
    };
  }, []);

  const clearTerminal = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
      xtermInstance.current.write('\x1b[1;34mTESSY REAL TERMINAL\x1b[0m - Aguardando backend WebSocket...\r\n\x1b[33mλ\x1b[0m ');
    }
  };

  return (
    <div className="h-full bg-bg-secondary/80 backdrop-blur-xl border-t border-border-visible flex flex-col shrink-0 relative overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <TerminalIcon size={14} className="text-accent-primary opacity-60" />
          <span className="text-xs font-medium tracking-normal text-text-primary">System Shell v3.2 [Real]</span>
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
        className="flex-1 w-full h-full bg-[#0a1628] p-2"
      />
    </div>
  );
};

export default React.memo(RealTerminal);