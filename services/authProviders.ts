/**
 * Auth Providers Service
 * Gerenciamento centralizado de tokens para múltiplos provedores de IA
 */

import { openDB, IDBPDatabase } from 'idb';
import { Sparkles, Brain, Zap, Github, type LucideIcon } from 'lucide-react';

// Database setup
const DB_NAME = 'tessy_auth';
const DB_VERSION = 1;
const STORE_NAME = 'tokens';

let dbPromise: Promise<IDBPDatabase> | null = null;

async function getDB() {
    if (!dbPromise) {
        dbPromise = openDB(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            },
        });
    }
    return dbPromise;
}

// Provider definitions
export interface AuthProvider {
    id: 'gemini' | 'openai' | 'zai' | 'github';
    name: string;
    icon: LucideIcon;
    color: string;
    placeholder: string;
    helpUrl: string;
    helpText: string;
    validator: (token: string) => boolean;
}

export const AUTH_PROVIDERS: AuthProvider[] = [
    {
        id: 'gemini',
        name: 'Gemini',
        icon: Sparkles,
        color: '#4285F4',
        placeholder: 'AIzaSy...',
        helpUrl: 'https://aistudio.google.com/app/apikey',
        helpText: 'Obtenha sua chave no Google AI Studio',
        validator: (token) => token.startsWith('AIza') && token.length > 30,
    },
    {
        id: 'openai',
        name: 'OpenAI',
        icon: Brain,
        color: '#10A37F',
        placeholder: 'sk-...',
        helpUrl: 'https://platform.openai.com/api-keys',
        helpText: 'Obtenha sua chave na OpenAI Platform',
        validator: (token) => token.startsWith('sk-') && token.length > 20,
    },
    {
        id: 'zai',
        name: 'Z.ai (GLM)',
        icon: Zap,
        color: '#FF6B35',
        placeholder: 'zai_...',
        helpUrl: 'https://z.ai/developers',
        helpText: 'Obtenha sua chave na plataforma Z.ai',
        validator: (token) => token.length > 10,
    },
    {
        id: 'github',
        name: 'GitHub',
        icon: Github,
        color: '#6e5494',
        placeholder: 'ghp_...',
        helpUrl: 'https://github.com/settings/tokens',
        helpText: 'Gere um PAT com escopo "repo"',
        validator: (token) => (token.startsWith('ghp_') || token.startsWith('github_pat_')) && token.length > 20,
    },
];

// Token storage operations
export async function getToken(providerId: AuthProvider['id']): Promise<string | null> {
    try {
        const db = await getDB();
        return await db.get(STORE_NAME, providerId) || null;
    } catch (error) {
        console.error(`Error getting token for ${providerId}:`, error);
        return null;
    }
}

export async function setToken(providerId: AuthProvider['id'], token: string): Promise<void> {
    try {
        const db = await getDB();
        await db.put(STORE_NAME, token, providerId);
    } catch (error) {
        console.error(`Error setting token for ${providerId}:`, error);
        throw error;
    }
}

export async function clearToken(providerId: AuthProvider['id']): Promise<void> {
    try {
        const db = await getDB();
        await db.delete(STORE_NAME, providerId);
    } catch (error) {
        console.error(`Error clearing token for ${providerId}:`, error);
        throw error;
    }
}

export async function getConnectedProviders(): Promise<AuthProvider['id'][]> {
    const connected: AuthProvider['id'][] = [];
    for (const provider of AUTH_PROVIDERS) {
        const token = await getToken(provider.id);
        if (token) {
            connected.push(provider.id);
        }
    }
    return connected;
}

export function getProviderById(id: AuthProvider['id']): AuthProvider | undefined {
    return AUTH_PROVIDERS.find(p => p.id === id);
}
