import { useState, useEffect, useRef } from 'react';
import { useIonAlert } from '@ionic/react';
import { Material } from '../types';

interface UnsavedChangesHookProps {
    initialData: Material | null;
    currentData: Material;
    additionalData?: unknown[];
}

export const useUnsavedChanges = ({
    initialData,
    currentData,
    additionalData = []
}: UnsavedChangesHookProps) => {
    const [unsaved, setUnsaved] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<null | (() => void)>(null);
    const [presentAlert] = useIonAlert();
    const initialDataRef = useRef<Material | null>(initialData);

    // Update ref when initial data changes
    useEffect(() => {
        initialDataRef.current = initialData;
    }, [initialData]);

    // Track unsaved changes
    useEffect(() => {
        if (!initialDataRef.current) return;

        const currentState = {
            ...currentData,
            ...additionalData.reduce((acc: Record<string, unknown>, data, index) => ({
                ...acc,
                [`additional_${index}`]: data
            }), {} as Record<string, unknown>)
        };

        const initialState = {
            ...initialDataRef.current,
            ...additionalData.reduce((acc: Record<string, unknown[]>, _, index) => ({
                ...acc,
                [`additional_${index}`]: []
            }), {} as Record<string, unknown[]>)
        };

        const isChanged = JSON.stringify(currentState) !== JSON.stringify(initialState);
        setUnsaved(isChanged);
    }, [currentData, additionalData]);

    // Intercept browser back/refresh
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (unsaved) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [unsaved]);

    const handleNav = (navFn: () => void) => {
        if (unsaved) {
            setPendingNavigation(() => navFn);
            handleLeaveConfirm();
        } else {
            navFn();
        }
    };

    const handleLeaveConfirm = () => {
        presentAlert({
            header: 'Modificări nesalvate',
            message: 'Ai modificări nesalvate. Ce vrei să faci?',
            buttons: [
                {
                    text: 'Rămâi pe pagină',
                    role: 'cancel',
                    handler: () => {
                        setPendingNavigation(null);
                    }
                },
                {
                    text: 'Părăsește fără salvare',
                    role: 'destructive',
                    handler: () => {
                        setUnsaved(false);
                        if (pendingNavigation) {
                            pendingNavigation();
                            setPendingNavigation(null);
                        }
                    },
                },
                {
                    text: 'Salvează și pleacă',
                    handler: () => {
                        // This should be handled by the parent component
                        return false;
                    },
                },
            ],
        });
    };

    const clearUnsaved = () => {
        setUnsaved(false);
        if (pendingNavigation) {
            pendingNavigation();
            setPendingNavigation(null);
        }
    };

    return {
        unsaved,
        handleNav,
        clearUnsaved,
        pendingNavigation
    };
};
