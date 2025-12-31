import React, { useState, useEffect } from 'react';

interface DateAnchorProps {
  groundingEnabled: boolean;
}

export const DateAnchor: React.FC<DateAnchorProps> = ({ groundingEnabled }) => {
  const [currentDate, setCurrentDate] = useState('');

  const updateDate = () => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }));
  };

  useEffect(() => {
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-emerald-600 px-4 py-2 shadow-[4px_4px_0_rgba(16,185,129,0.3)] rounded-none flex items-center gap-3 transition-all duration-300">
      <div className={`w-2 h-2 rounded-full ${groundingEnabled ? 'bg-emerald-600 animate-pulse-soft' : 'bg-slate-600 shadow-[0_0_5px_rgba(100,116,139,0.5)]'}`} />
      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">
        {groundingEnabled ? "BUSCA ATIVA" : "BUSCA INATIVA"}
      </span>
      <div className="h-4 w-px bg-emerald-600/25" />
      <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-tight">
        {currentDate}
      </span>
    </div>
  );
};