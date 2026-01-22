/**
 * RealTerminal - Terminal real conectado ao PTY via WebSocket
 * 
 * Conecta ao servidor backend (localhost:3001) para fornecer
 * acesso ao shell real do sistema (PowerShell/Bash).
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { AttachAddon } from '@xterm/addon-attach';
import { Terminal as TerminalIcon, Trash2, Power, RefreshCw } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';

const TERMINAL_SERVER_URL = 'ws://localhost:3002/terminal';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface RealTerminalProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const RealTerminal: React.FC<RealTerminalProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<Terminal | null>(null);
  const fitAddonInstance = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const attachAddonRef = useRef<AttachAddon | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');

  /**
   * Connect to the terminal server via WebSocket
   */
  const connectToServer = useCallback(() => {
    if (!xtermInstance.current) return;

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (attachAddonRef.current) {
      attachAddonRef.current.dispose();
    }

    setStatus('connecting');
    const term = xtermInstance.current;

    term.writeln('\x1b[1;33m⏳ Connecting to terminal server...\x1b[0m');

    const ws = new WebSocket(TERMINAL_SERVER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      term.clear();
      term.writeln('\x1b[1;32m✓ Connected to real shell\x1b[0m');
      term.writeln('');

      // Attach xterm to WebSocket
      const attachAddon = new AttachAddon(ws);
      attachAddonRef.current = attachAddon;
      term.loadAddon(attachAddon);

      // Send initial resize
      if (fitAddonInstance.current) {
        fitAddonInstance.current.fit();
        const { cols, rows } = term;
        ws.send(JSON.stringify({ type: 'resize', cols, rows }));
      }
    };

    ws.onerror = () => {
      setStatus('error');
      term.writeln('\x1b[1;31m✗ Failed to connect to terminal server\x1b[0m');
      term.writeln('\x1b[33mMake sure the server is running: npm run terminal\x1b[0m');
    };

    ws.onclose = () => {
      if (status !== 'error') {
        setStatus('disconnected');
        term.writeln('');
        term.writeln('\x1b[1;33m⚡ Connection closed\x1b[0m');
      }
    };
  }, [status]);

  /**
   * Initialize xterm.js
   */
  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: 'transparent',
        foreground: '#f8fafc',
        cursor: '#f97316',
        selectionBackground: 'rgba(249, 115, 22, 0.3)',
        black: '#000000',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#ec4899',
        cyan: '#06b6d4',
        white: '#ffffff',
      },
      fontFamily: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
      fontSize: 13,
      cursorBlink: true,
      cursorStyle: 'block',
      allowProposedApi: true,
      allowTransparency: true,
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

    // Welcome message
    term.writeln('\x1b[1;36m╔════════════════════════════════════╗\x1b[0m');
    term.writeln('\x1b[1;36m║   TESSY OS Shell [Build 4.6.0]    ║\x1b[0m');
    term.writeln('\x1b[1;36m╚════════════════════════════════════╝\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[33mPress "Connect" to start a real shell session\x1b[0m');

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      // Handle resize only if not collapsed
      if (!isCollapsed && fitAddonInstance.current) {
        fitAddonInstance.current.fit();
        // Send resize to PTY
        if (wsRef.current?.readyState === WebSocket.OPEN && xtermInstance.current) {
          const { cols, rows } = xtermInstance.current;
          wsRef.current.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
      }
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
      wsRef.current?.close();
      term.dispose();
    };
  }, []);

  /**
   * Clear terminal
   */
  const clearTerminal = () => {
    if (xtermInstance.current) {
      xtermInstance.current.clear();
    }
  };

  /**
   * Disconnect from server
   */
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('disconnected');
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-text-tertiary';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      default: return 'Offline';
    }
  };

  return (
    <div
      className={`glass-panel flex flex-col shrink-0 relative overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'h-[26px] !border-b-0' : 'h-full'}`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-1 glass-header shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="text-glass-accent opacity-80 hover:opacity-100 transition-opacity"
            title={isCollapsed ? "Expandir Terminal" : "Colapsar Terminal"}
          >
            <TerminalIcon size={12} />
          </button>
          <span className="text-[10px] font-bold tracking-widest text-glass uppercase">Terminal Quantico</span>
          <span className={`text-[9px] font-medium ${getStatusColor()}`}>
            ● {getStatusText()}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {status === 'disconnected' || status === 'error' ? (
            <button
              onClick={connectToServer}
              className="text-glass-muted hover:text-glass-accent transition-colors flex items-center gap-1.5"
            >
              <Power size={11} />
              <span className="text-[9px] font-medium tracking-wide uppercase">Connect</span>
            </button>
          ) : status === 'connected' ? (
            <button
              onClick={disconnect}
              className="text-glass-muted hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <Power size={11} />
              <span className="text-[9px] font-medium tracking-wide uppercase">Disconnect</span>
            </button>
          ) : (
            <RefreshCw size={11} className="text-glass-accent animate-spin" />
          )}
          <div className="h-3 w-px bg-glass-border" />
          <button
            onClick={clearTerminal}
            className="text-glass-muted hover:text-glass-accent transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={11} />
            <span className="text-[9px] font-medium tracking-wide uppercase">Clear</span>
          </button>
        </div>
      </div>

      {/* xterm.js Container */}
      <div
        ref={terminalRef}
        className={`flex-1 w-full h-full p-2 bg-transparent transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}
      />

      <style>{`
        .xterm-viewport::-webkit-scrollbar { width: 4px; }
        .xterm-viewport::-webkit-scrollbar-track { background: transparent; }
        .xterm-viewport::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); }
        .xterm-viewport::-webkit-scrollbar-thumb:hover { background: var(--glass-accent); }
        .xterm { padding: 8px; }
        .xterm-cursor { box-shadow: 0 0 10px var(--glass-accent); }
        /* LiquidGlass Blur Effect behind Terminal Text */
        .xterm-screen canvas {
             /* Ensuring the text is sharp but the background feels integrated */
        }
      `}</style>
    </div>
  );
};

export default React.memo(RealTerminal);
