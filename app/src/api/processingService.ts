import { Material } from '../types';
import { getProcessingType, applyProcessingRules, ProcessingType } from '../config/processingTypes';
import apiClient from './apiClient';

interface ProcessingRequest {
    sourceIds: string[];
    processingTypeId: string;
    count: number;
    additionalFields?: Partial<Material>; // Any manually entered fields
}

interface ProcessingRecord {
    id: string;
    sourceIds: string[];
    processingTypeId: string;
    count: number;
    createdAt: string;
    updatedAt: string;
    status: string;
}

interface ProcessingResponse {
    message: string;
    outputMaterials: Material[];
    updatedSourceMaterials: Material[];
    processing: ProcessingRecord; // The processing record
}

/**
 * Process materials according to a specific processing type
 */
export const processMaterials = async (
    request: ProcessingRequest
): Promise<ProcessingResponse> => {
    try {
        // Add validation here if needed
        if (!request.processingTypeId) {
            throw new Error('Processing type is required');
        }

        if (!request.sourceIds || request.sourceIds.length === 0) {
            throw new Error('Source materials are required');
        }

        // Get the processing type
        const processingType = getProcessingType(request.processingTypeId);
        if (!processingType) {
            throw new Error(`Unknown processing type: ${request.processingTypeId}`);
        }

        // Call the processing API
        const response = await apiClient.post('/materials/process', {
            sourceIds: request.sourceIds,
            outputConfig: {
                count: request.count || 1,
                processingTypeId: request.processingTypeId,
                additionalFields: request.additionalFields || {}
            }
        });

        return response.data;
    } catch (error) {
        console.error('Processing error:', error);
        throw error;
    }
};

/**
 * Get all available processing types
 */
export const getAllProcessingTypes = async (): Promise<ProcessingType[]> => {
    try {
        const response = await apiClient.get('/processing-types');
        return response.data;
    } catch (error) {
        console.error('Error fetching processing types:', error);
        return [];
    }
};

/**
 * Get valid processing types for a specific material type
 */
export const getProcessingTypesForMaterialType = async (materialType: string): Promise<ProcessingType[]> => {
    try {
        const response = await apiClient.get(`/processing-types/${materialType}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching processing types for ${materialType}:`, error);
        return [];
    }
};

/**
 * Get valid processing types for a list of materials
 */
export const getValidProcessingTypesForMaterials = async (materials: Material[]): Promise<ProcessingType[]> => {
    if (!materials || materials.length === 0) {
        return [];
    }

    // Get all material types
    const materialTypes = new Set(materials.map(m => m.type));

    // If there are multiple different types, return empty array
    if (materialTypes.size > 1) {
        return [];
    }

    // Get valid processing types for this material type
    const sourceType = materials[0].type;
    return getProcessingTypesForMaterialType(sourceType);
};

/**
 * Preview what a processed material would look like
 */
export const previewProcessedMaterial = (
    processingTypeId: string,
    sourceMaterials: Material[],
    additionalFields?: Partial<Material>
): Partial<Material> => {
    // Apply processing rules
    const baseFields = applyProcessingRules(processingTypeId, sourceMaterials);

    // Merge with additional fields
    return {
        ...baseFields,
        ...additionalFields
    };
};