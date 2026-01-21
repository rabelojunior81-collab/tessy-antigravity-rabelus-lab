import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full h-full animate-fade-in bg-bg-primary">
      <div className="w-8 h-8 border-2 border-accent-primary/20 border-t-accent-primary animate-spin"></div>
      <p className="mt-4 text-[9px] font-black text-accent-primary uppercase tracking-[0.3em] animate-pulse-soft">
        Sincronizando...
      </p>
    </div>
  );
};

export default LoadingSpinner;
