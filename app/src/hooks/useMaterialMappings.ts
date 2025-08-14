/**
 * Hook for using MaterialMappings with i18n support
 * 
 * This hook provides easy access to material type and wood species mappings
 * with automatic translation support.
 */

import { MaterialMappings, MaterialTypeOption, WoodSpeciesOption } from '../config/materialMappings';
import useI18n from './useI18n';

export const useMaterialMappings = () => {
    const { t } = useI18n();

    return {
        // Material Type Functions
        getMaterialTypeLabel: (id: string): string => {
            return MaterialMappings.getMaterialTypeLabel(id, t);
        },

        getMaterialTypeId: (label: string): string | undefined => {
            return MaterialMappings.getMaterialTypeId(label);
        },

        isMaterialTypeValid: (id: string): boolean => {
            return MaterialMappings.isMaterialTypeValid(id);
        },

        getMaterialTypeOptions: (): MaterialTypeOption[] => {
            return MaterialMappings.getMaterialTypeOptions(t);
        },

        getFieldsForType: (id: string): string[] => {
            return MaterialMappings.getFieldsForType(id);
        },

        // Wood Species Functions
        getWoodSpeciesLabel: (id: string): string => {
            return MaterialMappings.getWoodSpeciesLabel(id, t);
        },

        getWoodSpeciesId: (label: string): string | undefined => {
            return MaterialMappings.getWoodSpeciesId(label);
        },

        isWoodSpeciesValid: (id: string): boolean => {
            return MaterialMappings.isWoodSpeciesValid(id);
        },

        getWoodSpeciesOptions: (): WoodSpeciesOption[] => {
            return MaterialMappings.getWoodSpeciesOptions(t);
        },

        // Search Functions
        searchMaterialTypes: (query: string): MaterialTypeOption[] => {
            return MaterialMappings.searchMaterialTypes(query, t);
        },

        searchWoodSpecies: (query: string): WoodSpeciesOption[] => {
            return MaterialMappings.searchWoodSpecies(query, t);
        }
    };
};

export default useMaterialMappings;
