import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    onComplete?: () => void;
    onTick?: () => void; // Chamado a cada chunk de texto (para auto-scroll)
    renderFinal?: (text: string) => React.ReactNode;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
    text,
    speed = 25, // Velocidade humanizada (25ms por tick)
    onComplete,
    onTick,
    renderFinal
}) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const prevTextRef = useRef('');

    useEffect(() => {
        if (!text) return;

        // Se o texto mudou completamente (nova mensagem), resetamos
        if (!text.startsWith(prevTextRef.current) || prevTextRef.current === '') {
            setDisplayedText('');
            setIsComplete(false);
        }
        prevTextRef.current = text;

        // Se já exibimos tudo, apenas marca como completo
        if (displayedText.length >= text.length) {
            setIsComplete(true);
            onComplete?.();
            return;
        }

        const interval = setInterval(() => {
            setDisplayedText(prev => {
                const chunkSize = Math.min(2, text.length - prev.length); // 2 chars por tick
                const next = text.slice(0, prev.length + chunkSize);
                onTick?.(); // Notifica para auto-scroll
                if (next.length >= text.length) {
                    clearInterval(interval);
                    setIsComplete(true);
                    onComplete?.();
                }
                return next;
            });
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, onComplete, displayedText.length]);

    // Quando completo, renderiza com Markdown (se fornecido)
    if (isComplete && renderFinal) {
        return <>{renderFinal(text)}</>;
    }

    // Durante a digitação, mostra texto bruto (prose styling)
    return <span className="whitespace-pre-wrap">{displayedText}</span>;
};
