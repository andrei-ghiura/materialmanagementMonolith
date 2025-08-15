// apiClient.ts
import axios from 'axios';
// Update this import to match the actual export from ToastProvider
import { useToast } from '../components/ui/useToast';
import React from 'react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Global error handler for API calls
// Custom hook to attach toast to error handler
export const useAttachApiErrorToast = () => {
    const { showToast } = useToast();
    React.useEffect(() => {
        const interceptor = apiClient.interceptors.response.use(
            response => response,
            error => {
                showToast('A network or server error occurred.', 'danger');
                return Promise.reject(error);
            }
        );
        return () => {
            apiClient.interceptors.response.eject(interceptor);
        };
    }, [showToast]);
};

export default apiClient;
