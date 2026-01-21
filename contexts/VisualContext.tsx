import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Wallpaper gallery
export const WALLPAPERS = [
    { id: 'space', name: 'Deep Space', url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2933&auto=format&fit=crop' },
    { id: 'gradient-dark', name: 'Dark Gradient', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2929&auto=format&fit=crop' },
    { id: 'abstract', name: 'Abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2864&auto=format&fit=crop' },
    { id: 'northern-lights', name: 'Aurora', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=2940&auto=format&fit=crop' },
    { id: 'mountain', name: 'Mountain', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2940&auto=format&fit=crop' },
    { id: 'ocean', name: 'Ocean', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=2826&auto=format&fit=crop' },
    { id: 'forest', name: 'Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2940&auto=format&fit=crop' },
    { id: 'city', name: 'City Night', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2864&auto=format&fit=crop' },
];

// Accent color presets
export const ACCENT_PRESETS = [
    { name: 'Laranja', value: '#f97316', rgb: '249, 115, 22' },
    { name: 'Azul', value: '#3b82f6', rgb: '59, 130, 246' },
    { name: 'Ciano', value: '#06b6d4', rgb: '6, 182, 212' },
    { name: 'Verde', value: '#10b981', rgb: '16, 185, 129' },
    { name: 'Roxo', value: '#8b5cf6', rgb: '139, 92, 246' },
    { name: 'Rosa', value: '#ec4899', rgb: '236, 72, 153' },
    { name: 'Amarelo', value: '#eab308', rgb: '234, 179, 8' },
];

export interface VisualSettings {
    themeMode: 'dark' | 'light' | 'system';
    accentColor: string;
    accentRgb: string;
    wallpaper: string;
    glassOpacity: number;
    blurStrength: number;
    enableAnimations: boolean;
}

const DEFAULT_SETTINGS: VisualSettings = {
    themeMode: 'dark',
    accentColor: '#f97316',
    accentRgb: '249, 115, 22',
    wallpaper: WALLPAPERS[0].url,
    glassOpacity: 0.65,
    blurStrength: 16,
    enableAnimations: true,
};

interface VisualContextType {
    settings: VisualSettings;
    updateSetting: <K extends keyof VisualSettings>(key: K, value: VisualSettings[K]) => void;
    resetSettings: () => void;
    isVisualModalOpen: boolean;
    setIsVisualModalOpen: (open: boolean) => void;
    resolvedTheme: 'dark' | 'light';
}

const VisualContext = createContext<VisualContextType | undefined>(undefined);
const STORAGE_KEY = 'tessy-visual-settings';

// Synchronous initial settings read (prevents flash of wrong theme)
const getInitialSettings = (): VisualSettings => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('[VisualContext] Failed to parse settings:', e);
    }
    return DEFAULT_SETTINGS;
};

export const VisualProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<VisualSettings>(getInitialSettings);
    const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
    const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark');

    // Detect system theme
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);


    const resolvedTheme = settings.themeMode === 'system' ? systemTheme : settings.themeMode;

    // THEME ENGINE - Apply CSS Variables
    useEffect(() => {
        const root = document.documentElement;

        // 1. Theme class (dark/light)
        root.classList.remove('dark', 'light');
        root.classList.add(resolvedTheme);

        // 2. Glass properties
        root.style.setProperty('--glass-opacity', settings.glassOpacity.toString());
        root.style.setProperty('--glass-blur', `${settings.blurStrength}px`);

        // 3. Accent color
        root.style.setProperty('--glass-accent', settings.accentColor);
        root.style.setProperty('--accent-rgb', settings.accentRgb);

        // Calculate hover color (lighter)
        const hoverColor = settings.accentColor.replace(/^#/, '');
        const r = Math.min(255, parseInt(hoverColor.slice(0, 2), 16) + 20);
        const g = Math.min(255, parseInt(hoverColor.slice(2, 4), 16) + 20);
        const b = Math.min(255, parseInt(hoverColor.slice(4, 6), 16) + 20);
        root.style.setProperty('--glass-accent-hover', `rgb(${r}, ${g}, ${b})`);

        // 4. Wallpaper
        if (settings.wallpaper) {
            root.style.setProperty('--wallpaper-url', `url('${settings.wallpaper}')`);
        } else {
            root.style.setProperty('--wallpaper-url', 'none');
        }

        // 5. Animations
        if (!settings.enableAnimations) {
            root.classList.add('reduce-motion');
        } else {
            root.classList.remove('reduce-motion');
        }

        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings, resolvedTheme]);

    const updateSetting = <K extends keyof VisualSettings>(key: K, value: VisualSettings[K]) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };

            // If accent color changed, update RGB too
            if (key === 'accentColor') {
                const preset = ACCENT_PRESETS.find(p => p.value === value);
                if (preset) {
                    newSettings.accentRgb = preset.rgb;
                }
            }

            return newSettings;
        });
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <VisualContext.Provider value={{
            settings,
            updateSetting,
            resetSettings,
            isVisualModalOpen,
            setIsVisualModalOpen,
            resolvedTheme
        }}>
            {children}
        </VisualContext.Provider>
    );
};

export const useVisual = () => {
    const context = useContext(VisualContext);
    if (!context) throw new Error('useVisual must be used within a VisualProvider');
    return context;
};
