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
                className={`w-full max-w-md glass-modal flex flex-col ${isClosing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-4 py-3 glass-header flex items-center justify-between shrink-0">
                    <h2 className="text-[11px] font-bold tracking-widest text-glass uppercase">
                        🔐 Central de Autenticação
                    </h2>
                    <button onClick={handleClose} className="p-1 text-glass-muted hover:text-glass transition-all">
                        <X size={14} />
                    </button>
                </div>

                {/* Tab Bar */}
                <div className="flex border-b border-white/5">
                    {AUTH_PROVIDERS.map(provider => {
                        const Icon = provider.icon;
                        const isConnected = connectedProviders.includes(provider.id);
                        const isActive = activeTab === provider.id;

                        return (
                            <button
                                key={provider.id}
                                onClick={() => setActiveTab(provider.id)}
                                className={`flex-1 py-2.5 px-2 flex flex-col items-center gap-1 transition-all relative
                                    ${isActive ? 'bg-white/5' : 'hover:bg-white/3'}
                                `}
                                style={{
                                    borderBottom: isActive ? `2px solid ${provider.color}` : '2px solid transparent'
                                }}
                            >
                                <div className="relative">
                                    <Icon
                                        size={16}
                                        style={{ color: isActive ? provider.color : 'var(--glass-muted)' }}
                                    />
                                    {isConnected && (
                                        <div
                                            className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500"
                                            title="Conectado"
                                        />
                                    )}
                                </div>
                                <span className={`text-[8px] font-semibold uppercase tracking-wider
                                    ${isActive ? 'text-glass' : 'text-glass-muted'}
                                `}>
                                    {provider.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <form onSubmit={handleSave} className="p-4 space-y-4">
                    <div className="text-center space-y-1">
                        <p className="text-[10px] text-glass-muted">
                            {activeProvider.helpText}
                        </p>
                        <a
                            href={activeProvider.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[9px] font-medium opacity-70 hover:opacity-100 transition-opacity"
                            style={{ color: activeProvider.color }}
                        >
                            <ExternalLink size={10} />
                            Obter chave
                        </a>
                    </div>

                    <input
                        type="password"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder={activeProvider.placeholder}
                        className="w-full glass-input py-2.5 px-3 text-[11px] font-mono text-glass text-center focus:border-glass-accent outline-none placeholder:text-glass-muted/40"
                        style={{
                            borderColor: tokenInput && !tokenInput.includes('•')
                                ? (activeProvider.validator(tokenInput) ? '#22c55e' : '#ef4444')
                                : undefined
                        }}
                    />

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={!tokenInput.trim() || tokenInput.includes('•') || saveStatus === 'saving'}
                            style={{
                                backgroundColor: activeProvider.color,
                                opacity: !tokenInput.trim() || tokenInput.includes('•') ? 0.5 : 1
                            }}
                            className="flex-1 py-2.5 text-white font-bold uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                        >
                            {saveStatus === 'saving' && <span className="animate-spin">⏳</span>}
                            {saveStatus === 'success' && <Check size={12} />}
                            {saveStatus === 'error' && <AlertCircle size={12} />}
                            {saveStatus === 'idle' ? 'Salvar' : saveStatus === 'success' ? 'Salvo!' : saveStatus === 'error' ? 'Erro' : 'Salvando...'}
                        </button>

                        {connectedProviders.includes(activeTab) && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-4 py-2.5 bg-red-500/20 text-red-400 font-bold uppercase tracking-widest text-[9px] hover:bg-red-500/30 transition-all"
                            >
                                Remover
                            </button>
                        )}
                    </div>
                </form>

                {/* Status Bar */}
                <div className="px-4 py-2 border-t border-white/5 bg-white/3">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] text-glass-muted uppercase tracking-widest">
                            Conectados:
                        </span>
                        <div className="flex gap-1.5">
                            {AUTH_PROVIDERS.map(provider => {
                                const Icon = provider.icon;
                                const isConnected = connectedProviders.includes(provider.id);
                                return (
                                    <div
                                        key={provider.id}
                                        title={`${provider.name}: ${isConnected ? 'Conectado' : 'Não conectado'}`}
                                        className="p-1 rounded"
                                        style={{
                                            backgroundColor: isConnected ? `${provider.color}20` : 'transparent',
                                            opacity: isConnected ? 1 : 0.3
                                        }}
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
