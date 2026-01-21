
import React, { useState, useEffect } from 'react';
import { setGeminiToken } from '../../services/gemini/client';
import { X, Cpu } from 'lucide-react';

interface GeminiTokenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const GeminiTokenModal: React.FC<GeminiTokenModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [token, setToken] = useState('');
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) { setIsClosing(false); setToken(''); }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => { setIsClosing(false); onClose(); }, 150);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) return;
        try {
            await setGeminiToken(token.trim());
            onSuccess();
            handleClose();
        } catch (err) {
            console.error('Error saving Gemini token:', err);
        }
    };

    return (
        <div
            className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-xs glass-modal flex flex-col ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-3 py-2 glass-header flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Cpu style={{ color: 'var(--glass-accent)' }} size={12} />
                        <h2 className="text-[10px] font-bold tracking-widest text-glass uppercase">Gemini API</h2>
                    </div>
                    <button onClick={handleClose} className="p-0.5 text-glass-muted hover:text-glass transition-all">
                        <X size={12} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSave} className="p-3 space-y-3">
                    <p className="text-[9px] text-glass-muted text-center">
                        Cole sua chave do Google AI Studio
                    </p>
                    <input
                        autoFocus
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full glass-input py-2 px-3 text-[10px] font-mono text-glass text-center focus:border-glass-accent outline-none placeholder:text-glass-muted/40"
                    />
                    <button
                        type="submit"
                        style={{
                            backgroundColor: 'var(--glass-accent)',
                            boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)'
                        }}
                        className="w-full py-2 text-white font-bold uppercase tracking-widest text-[9px] hover:brightness-110 transition-all active:scale-95"
                    >
                        Ativar
                    </button>
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--glass-accent)' }}
                        className="block text-center text-[9px] font-medium opacity-70 hover:opacity-100 transition-opacity"
                    >
                        Não tem chave? Clique aqui para obter
                    </a>
                </form>
            </div>
        </div>
    );
};

export default GeminiTokenModal;

