import { createContext } from 'react';

export interface ToastContextType {
    showToast: (message: string, variant?: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
