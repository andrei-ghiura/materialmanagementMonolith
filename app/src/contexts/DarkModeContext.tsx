import { createContext, useContext } from 'react';
import { ToggleCustomEvent } from '@ionic/react';

// Create a context for dark mode
export interface DarkModeContextType {
    paletteToggle: boolean;
    toggleChange: (event: ToggleCustomEvent) => void;
    toggleDarkPalette: (shouldAdd: boolean) => void;
}

export const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const useDarkMode = () => {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeProvider');
    }
    return context;
};
