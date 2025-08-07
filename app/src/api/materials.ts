// Get the flow for a single material by ID
const getMaterialFlow = async (id: string) => {
    const response = await apiClient.get(`/materials/${id}/flow`);
    return response.data;
};
// import axios, { isCancel, AxiosError } from 'axios';
// const save = async (materialData: any) => {
//     axios.post(`${import.meta.env.VITE_WORKER_URL}/addMaterial`, materialData,
//         { headers: { "Content-Type": "application/json" } })
//         .then(function (response) {
//             console.log(response);
//         })
//         .catch(function (error) {
//             console.log(error);
//         });
// }


// const getAll = async () => axios.get(`${import.meta.env.VITE_WORKER_URL}/getAllMaterials`)
// const deleteMaterial = async (id) => axios.get(`${import.meta.env.VITE_WORKER_URL}/deleteMaterial/${id}`)


import apiClient from './apiClient';
import { Material } from '../types';

// Create a new material
const save = async (materialData: Material) => {
    const response = await apiClient.post('/materials', materialData);
    return response.data;
};

// Get all materials
const getAll = async () => {
    const response = await apiClient.get('/materials');
    return response.data;
};

// Get a material by ID
const getById = async (id: string) => {
    const response = await apiClient.get(`/materials/${id}`);
    return response.data;
};

// Update a material by ID
const update = async (id: string, materialData: Material) => {
    const response = await apiClient.put(`/materials/${id}`, materialData);
    return response.data;
};

// Delete a material by ID
const deleteMaterial = async (id: string) => {
    await apiClient.delete(`/materials/${id}`);
};

// Process materials into new material(s)
interface ProcessConfig {
    type: string;
    specie: string;
    count?: number;
    processingTypeId?: string; // Processing type ID (matches backend expectation)
}

const processMaterials = async (sourceIds: string[], outputConfig: ProcessConfig) => {
    const response = await apiClient.post('/materials/process', {
        sourceIds,
        outputConfig
    });
    return response.data;
};

export { save, getAll, getById, update, deleteMaterial, processMaterials, getMaterialFlow };