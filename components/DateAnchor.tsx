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
    <div className="bg-surface border border-surface px-4 py-1.5 flex items-center gap-4 transition-all duration-300">
      <div className="flex items-center gap-2">
        <div
          style={{ backgroundColor: groundingEnabled ? 'var(--glass-accent)' : undefined }}
          className={`w-1.5 h-1.5 ${groundingEnabled ? 'animate-pulse' : 'bg-glass-muted opacity-40'}`}
        />
        <span
          style={{ color: groundingEnabled ? 'var(--glass-accent)' : undefined }}
          className={`text-[10px] font-bold uppercase tracking-[0.1em] ${groundingEnabled ? '' : 'text-glass-muted'}`}
        >
          {groundingEnabled ? "GROUNDING ATIVO" : "GROUNDING OFF"}
        </span>
      </div>
      <div className="h-3 w-px bg-surface-elevated" />
      <span className="text-[10px] font-semibold text-glass uppercase tracking-tight opacity-80">
        {currentDate}
      </span>
    </div>
  );
};

