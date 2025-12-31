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
    <div className="bg-bg-secondary/85 backdrop-blur-xl border border-border-visible px-4 py-2 shadow-lg shadow-accent-primary/5 rounded-lg flex items-center gap-3 transition-all duration-300">
      <div className={`w-2 h-2 rounded-full ${groundingEnabled ? 'bg-accent-primary animate-pulse-soft' : 'bg-text-tertiary/40 shadow-[0_0_5px_rgba(59,130,246,0.1)]'}`} />
      <span className="text-[10px] font-bold text-accent-primary uppercase tracking-[0.2em]">
        {groundingEnabled ? "BUSCA ATIVA" : "BUSCA INATIVA"}
      </span>
      <div className="h-4 w-px bg-border-subtle" />
      <span className="text-[10px] font-bold text-text-primary uppercase tracking-tight">
        {currentDate}
      </span>
    </div>
  );
};