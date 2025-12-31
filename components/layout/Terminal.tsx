import React, { useState, useEffect, useRef } from 'react';
import { useLayout } from '../../hooks/useLayout';

const Terminal: React.FC = () => {
  const { alturaTerminal, ajustarAlturaTerminal } = useLayout();
  const [isResizing, setIsResizing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e: MouseEvent) => {
    if (isResizing && terminalRef.current) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight >= 100 && newHeight <= window.innerHeight * 0.7) {
        ajustarAlturaTerminal(newHeight);
      }
    }
  };

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
  }, [isResizing]);

  return (
    <div 
      ref={terminalRef}
      style={{ height: `${alturaTerminal}px` }}
      className="bg-[#1e1e1e] border-t border-gray-800 flex flex-col shrink-0 relative"
    >
      <div 
        onMouseDown={startResizing}
        className="resize-handle-v absolute top-0 left-0 right-0 h-[4px] z-10"
      />
      <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-800 bg-[#111111]">
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Terminal</span>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/30"></div>
          <div className="w-2 h-2 rounded-full bg-amber-500/30"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500/30"></div>
        </div>
      </div>
      <div className="flex-1 p-4 font-mono text-xs text-emerald-500/60 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-emerald-500 font-black">TESSY_CORE ></span>
          <span className="animate-pulse">_</span>
        </div>
        <p className="text-gray-500">Terminal (em breve - integração xterm.js pendente)</p>
      </div>
    </div>
  );
};

export default Terminal;
