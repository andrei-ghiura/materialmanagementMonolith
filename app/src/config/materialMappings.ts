/**
 * Central mapping configuration for material types and wood species
 * 
 * This file provides optimized lookups for database IDs to human-readable labels
 * and vice versa. Maps are used for O(1) lookup performance.
 */

// Type definitions
export interface MaterialTypeOption {
    id: string;
    label: string;
}

export interface WoodSpeciesOption {
    id: string;
    label: string;
}

// Material Types Configuration
export const MATERIAL_TYPES: readonly MaterialTypeOption[] = [
    { id: "BSTN", label: "Buștean" },
    { id: "BSTF", label: "Buștean Fasonat" },
    { id: "CHN", label: "Cherestea Netivită" },
    { id: "CHS", label: "Cherestea Semitivită" },
    { id: "CHT", label: "Cherestea Tivită" },
    { id: "FRZ", label: "Frize" },
    { id: "FRZR", label: "Frize Rindeluite" },
    { id: "LEA", label: "Leaturi" },
    { id: "PAN", label: "Panouri" }
] as const;

// Wood Species Configuration
export const WOOD_SPECIES: readonly WoodSpeciesOption[] = [
    { id: "STJ", label: "Stejar" },
    { id: "ALB", label: "Stejar Alb" },
    { id: "FRN", label: "Frasin" },
    { id: "NUT", label: "Nuc" },
    { id: "TEI", label: "Tei" },
    { id: "FAG", label: "Fag" },
    { id: "PLT", label: "Platin" },
    { id: "PIN", label: "Pin" },
    { id: "BRD", label: "Brad" },
    { id: "MOL", label: "Molid" },
] as const;

// Optimized Maps for O(1) lookups
export const MATERIAL_TYPE_MAP = new Map<string, string>(
    MATERIAL_TYPES.map(item => [item.id, item.label])
);

export const WOOD_SPECIES_MAP = new Map<string, string>(
    WOOD_SPECIES.map(item => [item.id, item.label])
);

// Reverse Maps for label-to-ID lookups
export const MATERIAL_TYPE_REVERSE_MAP = new Map<string, string>(
    MATERIAL_TYPES.map(item => [item.label, item.id])
);

export const WOOD_SPECIES_REVERSE_MAP = new Map<string, string>(
    WOOD_SPECIES.map(item => [item.label, item.id])
);

// Utility functions for fast lookups
export const MaterialMappings = {
    // Material Type Functions
    getMaterialTypeLabel: (id: string): string => {
        return MATERIAL_TYPE_MAP.get(id) || id;
    },

    getMaterialTypeId: (label: string): string | undefined => {
        return MATERIAL_TYPE_REVERSE_MAP.get(label);
    },

    isMaterialTypeValid: (id: string): boolean => {
        return MATERIAL_TYPE_MAP.has(id);
    },

    getMaterialTypeOptions: (): readonly MaterialTypeOption[] => {
        return MATERIAL_TYPES;
    },

    // Wood Species Functions
    getWoodSpeciesLabel: (id: string): string => {
        return WOOD_SPECIES_MAP.get(id) || id;
    },

    getWoodSpeciesId: (label: string): string | undefined => {
        return WOOD_SPECIES_REVERSE_MAP.get(label);
    },

    isWoodSpeciesValid: (id: string): boolean => {
        return WOOD_SPECIES_MAP.has(id);
    },

    getWoodSpeciesOptions: (): readonly WoodSpeciesOption[] => {
        return WOOD_SPECIES;
    },

    // Search Functions
    searchMaterialTypes: (query: string): MaterialTypeOption[] => {
        const lowercaseQuery = query.toLowerCase();
        return MATERIAL_TYPES.filter(item =>
            item.id.toLowerCase().includes(lowercaseQuery) ||
            item.label.toLowerCase().includes(lowercaseQuery)
        );
    },

    searchWoodSpecies: (query: string): WoodSpeciesOption[] => {
        const lowercaseQuery = query.toLowerCase();
        return WOOD_SPECIES.filter(item =>
            item.id.toLowerCase().includes(lowercaseQuery) ||
            item.label.toLowerCase().includes(lowercaseQuery)
        );
    }
};

// Backward compatibility exports (deprecated - use MaterialMappings instead)
/**
 * @deprecated Use MaterialMappings.getMaterialTypeOptions() instead
 */
export const materialTypes = MATERIAL_TYPES;

/**
 * @deprecated Use MaterialMappings.getWoodSpeciesOptions() instead
 */
export const woodSpecies = WOOD_SPECIES;
