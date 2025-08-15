import { useContext } from 'react';
import { AlertContext } from '../components/ui/AlertContext';

export const useAlert = () => {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error('useAlert must be used within an AlertProvider');
    return ctx.showAlert;
};
