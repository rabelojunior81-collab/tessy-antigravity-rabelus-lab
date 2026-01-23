
import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface ReasoningChainProps {
    content: string;
    isLoading?: boolean;
    loadingLabel?: string;
}

export const ReasoningChain: React.FC<ReasoningChainProps> = ({
    content,
    isLoading = false,
    loadingLabel = "Analisando..."
}) => {
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex items-center gap-3 py-4 animate-in fade-in slide-in-from-left-2 duration-500">
                <div className="relative">
                    <Sparkles size={18} className="text-accent-primary animate-pulse" />
                    <div className="absolute inset-0 bg-accent-primary/20 blur-lg animate-pulse rounded-full"></div>
                </div>
                <span className="text-[13px] font-medium text-text-secondary tracking-tight">
                    {loadingLabel}
                </span>
                <ChevronDown size={14} className="text-text-tertiary opacity-50" />
            </div>
        );
    }

    if (!content) return null;

    return (
        <div className="mb-6 animate-in fade-in duration-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 py-2 text-text-secondary hover:text-text-primary transition-all duration-300 group"
            >
                <Sparkles size={18} className="text-accent-primary group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-medium tracking-tight">
                    Mostrar raciocínio
                </span>
                <ChevronDown
                    size={14}
                    className={`text-text-tertiary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="mt-3 pl-8 border-l border-border-visible/50 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap font-normal opacity-90">
                        {content}
                    </div>
                </div>
            )}
        </div>
    );
};
