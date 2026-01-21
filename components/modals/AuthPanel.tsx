/**
 * AuthPanel - Unified Multi-Provider Authentication Panel
 * Sprint 1.1: Multi-Provider Auth Panel
 */

import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, ExternalLink } from 'lucide-react';
import {
    AUTH_PROVIDERS,
    getToken,
    setToken,
    clearToken,
    getConnectedProviders,
    type AuthProvider
} from '../../services/authProviders';

interface AuthPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onProviderUpdate?: () => void;
}

const AuthPanel: React.FC<AuthPanelProps> = ({ isOpen, onClose, onProviderUpdate }) => {
    const [activeTab, setActiveTab] = useState<AuthProvider['id']>('gemini');
    const [tokenInput, setTokenInput] = useState('');
    const [connectedProviders, setConnectedProviders] = useState<AuthProvider['id'][]>([]);
    const [isClosing, setIsClosing] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    const activeProvider = AUTH_PROVIDERS.find(p => p.id === activeTab)!;

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            loadConnectedProviders();
            loadCurrentToken();
        }
    }, [isOpen]);

    useEffect(() => {
        loadCurrentToken();
        setSaveStatus('idle');
    }, [activeTab]);

    const loadConnectedProviders = async () => {
        const connected = await getConnectedProviders();
        setConnectedProviders(connected);
    };

    const loadCurrentToken = async () => {
        const token = await getToken(activeTab);
        setTokenInput(token ? '••••••••••••••••' : '');
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 150);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tokenInput.trim() || tokenInput.includes('•')) return;

        setSaveStatus('saving');
        try {
            if (!activeProvider.validator(tokenInput.trim())) {
                setSaveStatus('error');
                return;
            }
            await setToken(activeTab, tokenInput.trim());
            setSaveStatus('success');
            await loadConnectedProviders();
            onProviderUpdate?.();
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
            setSaveStatus('error');
        }
    };

    const handleClear = async () => {
        await clearToken(activeTab);
        setTokenInput('');
        await loadConnectedProviders();
        onProviderUpdate?.();
    };

    if (!isOpen) return null;

    return (
        <div
            className={`modal-overlay ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onClick={handleClose}
        >
            <div
                className={`w-full max-w-xs glass-modal bg-[#0a0a0f]/95 flex flex-col ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Standard Glass Header */}
                <div className="px-3 py-2 glass-header border-b border-glass-border flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <div className="w-1.5 h-1.5 bg-glass-muted/40" />
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-glass opacity-90">Central de Autenticação</h2>
                    </div>
                    <button onClick={handleClose} className="p-0.5 text-glass-muted hover:text-glass transition-all active:scale-95">
                        <X size={14} />
                    </button>
                </div>

                {/* Tab Bar - Compact */}
                <div className="flex border-b border-glass-border">
                    {AUTH_PROVIDERS.map(provider => {
                        const Icon = provider.icon;
                        const isConnected = connectedProviders.includes(provider.id);
                        const isActive = activeTab === provider.id;

                        return (
                            <button
                                key={provider.id}
                                onClick={() => setActiveTab(provider.id)}
                                className={`flex-1 py-2 px-1 flex flex-col items-center gap-1 transition-all relative
                                    ${isActive ? 'bg-white/5' : 'hover:bg-white/3'}
                                `}
                            >
                                <div className="relative">
                                    <Icon
                                        size={14}
                                        style={{ color: isActive ? provider.color : 'var(--glass-muted)' }}
                                    />
                                    {isConnected && (
                                        <div
                                            className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                                            title="Conectado"
                                        />
                                    )}
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-wider
                                    ${isActive ? 'text-glass' : 'text-glass-muted'}
                                `}>
                                    {provider.name}
                                </span>
                                {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: provider.color }}></div>}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <form onSubmit={handleSave} className="p-3 space-y-3">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[9px] font-bold text-glass-muted uppercase tracking-widest">Token de Acesso</span>
                            <a
                                href={activeProvider.helpUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[8px] font-bold uppercase hover:underline"
                                style={{ color: activeProvider.color }}
                            >
                                <ExternalLink size={8} /> Obter Chave
                            </a>
                        </div>

                        <input
                            type="password"
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            placeholder={activeProvider.placeholder}
                            className="w-full glass-input p-2 text-[10px] font-mono text-center text-glass focus:border-glass-accent outline-none placeholder:text-glass-muted/30"
                            style={{
                                borderColor: tokenInput && !tokenInput.includes('•')
                                    ? (activeProvider.validator(tokenInput) ? '#22c55e' : '#ef4444')
                                    : undefined
                            }}
                        />
                        <p className="text-[9px] text-glass-muted text-center px-2 opacity-70">
                            {activeProvider.helpText}
                        </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                        <button
                            type="submit"
                            disabled={!tokenInput.trim() || tokenInput.includes('•') || saveStatus === 'saving'}
                            className="flex-1 py-2 glass-button hover:bg-white/10 text-white font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
                            style={{
                                borderColor: activeProvider.color,
                                color: activeProvider.color
                            }}
                        >
                            {saveStatus === 'saving' && <span className="animate-spin text-[10px]">⏳</span>}
                            {saveStatus === 'success' && <Check size={12} />}
                            {saveStatus === 'error' && <AlertCircle size={12} />}
                            {saveStatus === 'idle' ? 'SALVAR' : saveStatus === 'success' ? 'SALVO' : saveStatus === 'error' ? 'ERRO' : '...'}
                        </button>

                        {connectedProviders.includes(activeTab) && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold uppercase tracking-widest text-[9px] transition-all rounded-sm"
                            >
                                Remover
                            </button>
                        )}
                    </div>
                </form>

                {/* Status Bar */}
                <div className="px-3 py-2 border-t border-glass-border bg-black/20">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold text-glass-muted uppercase tracking-widest">
                            Estado:
                        </span>
                        <div className="flex gap-1.5">
                            {AUTH_PROVIDERS.map(provider => {
                                const Icon = provider.icon;
                                const isConnected = connectedProviders.includes(provider.id);
                                return (
                                    <div
                                        key={provider.id}
                                        title={`${provider.name}: ${isConnected ? 'Conectado' : 'Não conectado'}`}
                                        className={`p-1 rounded-sm transition-all ${isConnected ? 'bg-white/10 ring-1 ring-inset ring-white/20' : 'opacity-30 grayscale'}`}
                                    >
                                        <Icon
                                            size={10}
                                            style={{ color: isConnected ? provider.color : 'var(--glass-muted)' }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPanel;
