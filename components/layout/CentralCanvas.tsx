import React from 'react';
import { useLayout } from '../../hooks/useLayout';

const CentralCanvas: React.FC = () => {
  const { arquivoSelecionado } = useLayout();

  return (
    <div className="flex-1 bg-[#0a0a0a] overflow-hidden flex flex-col relative">
      {!arquivoSelecionado ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-40">
          <div className="w-16 h-16 border-2 border-emerald-500/20 mb-6 flex items-center justify-center rounded-sm">
            <span className="text-3xl font-black text-emerald-500/20">?</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
            Selecione um arquivo no GitHub Sync para visualizar
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-800 bg-[#111111] flex items-center justify-between">
            <span className="text-[10px] font-mono text-emerald-500">{arquivoSelecionado.path}</span>
            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {arquivoSelecionado.language}
            </span>
          </div>
          <div className="flex-1 p-6 overflow-auto custom-scrollbar bg-[#050505]">
            <pre className="text-xs sm:text-sm font-mono text-gray-300 whitespace-pre">
              {arquivoSelecionado.content}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralCanvas;
