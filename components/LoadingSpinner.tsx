import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full h-full animate-fade-in">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-2 border-emerald-400/10 border-b-emerald-400 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
      </div>
      <p className="mt-6 text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] animate-pulse-soft">
        Sincronizando Módulos...
      </p>
    </div>
  );
};

export default LoadingSpinner;