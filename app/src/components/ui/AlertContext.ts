import { createContext } from 'react';

export interface AlertOptions {
    title: string;
    content: React.ReactNode;
    actions?: { text: string; onClick?: () => void; variant?: string }[];
    onClose?: () => void;
}

export interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
}

export const AlertContext = createContext<AlertContextType | undefined>(undefined);
