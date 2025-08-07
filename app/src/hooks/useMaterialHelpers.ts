import { useCallback } from 'react';
import { Material } from '../types';

export const useMaterialHelpers = () => {
    const isMaterial = useCallback((component: string | Material): component is Material => {
        return typeof component === 'object' && component !== null && '_id' in component;
    }, []);

    const ensureMaterialArray = useCallback(async (components: (string | Material)[] = []): Promise<Material[]> => {
        const result: Material[] = [];
        const { getById } = await import('../api/materials');

        for (const comp of components) {
            if (isMaterial(comp)) {
                result.push(comp);
            } else {
                try {
                    const material = await getById(comp);
                    if (material) {
                        result.push(material);
                    }
                } catch (error) {
                    console.error(`Failed to fetch material with id ${comp}:`, error);
                }
            }
        }
        return result;
    }, [isMaterial]);

    return {
        isMaterial,
        ensureMaterialArray
    };
};
