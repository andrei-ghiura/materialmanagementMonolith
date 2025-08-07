
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export type FooterActions = {
    actionsLeft?: React.ReactNode;
    actionsRight?: React.ReactNode;
};

export type UiState = {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    footerActions: FooterActions | null;
    setFooterActions: (actions: FooterActions | null) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    // Add more UI state fields as needed
};

const UiStateContext = createContext<UiState | undefined>(undefined);

export const UiStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [footerActions, setFooterActions] = useState<FooterActions | null>(null);
    const [theme, setThemeState] = useState<Theme>(() => {
        const stored = localStorage.getItem('theme');
        return (stored === 'dark' || stored === 'light') ? stored : 'light';
    });

    useEffect(() => {
        document.body.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const setTheme = (t: Theme) => setThemeState(t);
    const toggleTheme = () => setThemeState(t => (t === 'light' ? 'dark' : 'light'));

    const value: UiState = {
        sidebarOpen,
        setSidebarOpen,
        footerActions,
        setFooterActions,
        theme,
        setTheme,
        toggleTheme,
    };

    return (
        <UiStateContext.Provider value={value}>
            {children}
        </UiStateContext.Provider>
    );
};

export const useUiState = () => {
    const ctx = useContext(UiStateContext);
    if (!ctx) throw new Error('useUiState must be used within UiStateProvider');
    return ctx;
};
