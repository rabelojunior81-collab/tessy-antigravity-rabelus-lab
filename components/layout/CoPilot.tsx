import React from 'react';

interface CoPilotProps {
  children: React.ReactNode;
}

const CoPilot: React.FC<CoPilotProps> = ({ children }) => {
  return (
    <aside className="w-[450px] h-full bg-[#111111] border-l border-gray-800 flex flex-col z-10 shrink-0">
      <div className="h-14 sm:h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
          <h2 className="text-lg font-black text-white uppercase tracking-tighter">Tessy</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Co-Pilot Mode</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </aside>
  );
};

export default CoPilot;
