import apiClient from './apiClient';
import { ProcessingType } from '../config/processingTypes';

// Get all processing types
export const getAllProcessingTypes = async (): Promise<ProcessingType[]> => {
    const response = await apiClient.get('/processingTypes');
    return response.data;
};

// Get a processing type by ID
export const getProcessingTypeById = async (id: string): Promise<ProcessingType> => {
    const response = await apiClient.get(`/processingTypes/${id}`);
    return response.data;
};

// Get valid processing types for a source material type
export const getValidProcessingTypes = async (sourceType: string): Promise<ProcessingType[]> => {
    const response = await apiClient.get(`/processingTypes/valid/${sourceType}`);
    return response.data;
};
