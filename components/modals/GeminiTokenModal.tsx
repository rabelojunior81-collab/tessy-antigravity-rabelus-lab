
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
        setTimeout(() => { setIsClosing(false); onClose(); }, 100);
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
        <div className={`fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose}>
            <div className={`w-full max-w-sm bg-bg-secondary border border-border-visible flex flex-col shadow-2xl ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`} onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-border-subtle bg-bg-primary flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Cpu className="text-accent-secondary" size={16} />
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-text-primary">Gemini API Key</h2>
                    </div>
                    <button onClick={handleClose} className="p-1.5 text-text-tertiary hover:text-text-primary transition-all"><X size={20} /></button>
                </div>

                <form onSubmit={handleSave} className="p-8 space-y-6">
                    <p className="text-[10px] font-semibold text-text-tertiary uppercase leading-relaxed tracking-widest text-center">
                        Insira sua chave do Google AI Studio para ativar o chat.
                    </p>
                    <input autoFocus type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="AIzaSyXXXXXXXXXXXXXXXXX" className="w-full bg-bg-tertiary border border-border-subtle p-3 text-[10px] font-mono text-text-primary focus:border-accent-secondary outline-none text-center" />
                    <div className="flex flex-col gap-4">
                        <button type="submit" className="w-full py-4 bg-accent-secondary hover:bg-opacity-80 text-white font-bold uppercase tracking-widest text-[10px] transition-all">Ativar Protocolo AI</button>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[9px] font-bold text-accent-secondary uppercase underline text-center opacity-60">Obter Chave API</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GeminiTokenModal;
