import { Material } from '../types';
import apiClient from './apiClient';

export interface Processing {
    _id: string;
    sourceIds: Material[];
    outputIds: Material[];
    outputType: string;
    outputSpecie: string;
    processingTypeId: string;
    processingDate: string;
    note: string;
}

export const getProcessingHistory = async (): Promise<Processing[]> => {
    try {
        const response = await apiClient.get('/api/processings');
        return response.data;
    } catch (error: unknown) {
        console.error('Processing history fetch error:', error);
        throw new Error('Failed to fetch processing history');
    }
};
