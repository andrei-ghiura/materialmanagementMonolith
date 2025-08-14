/**
 * Central mapping configuration for material types and wood species
 * 
 * This file provides optimized lookups for database IDs to human-readable labels
 * and vice versa. Maps are used for O(1) lookup performance.
 * 
 * Note: This file now supports i18n. For translated labels, use the 
 * MaterialMappings.getMaterialTypeLabel() and MaterialMappings.getWoodSpeciesLabel()
 * functions with a translation function.
 */

// Type definitions
export interface MaterialTypeOption {
    id: string;
    label: string;
    fields: string[];
}

export interface WoodSpeciesOption {
    id: string;
    label: string;
}

// Translation function type
export type TranslationFunction = (key: string) => string;

// Material Types Configuration (with fallback Romanian labels)
export const MATERIAL_TYPES: readonly MaterialTypeOption[] = [
    {
        id: "BSTN",
        label: "Buștean", // Fallback label, use t('material.materialTypes.BSTN') for i18n
        fields: [
            "cod_unic_aviz", "data", "apv", "lat", "log", "nr_placuta_rosie", "lungime", "diametru", "volum_placuta_rosie", "volum_total", "observatii"
        ]
    },
    {
        id: "BSTF",
        label: "Buștean Fasonat", // Fallback label, use t('material.materialTypes.BSTF') for i18n
        fields: [
            "cod_unic_aviz", "data", "apv", "lat", "log", "nr_placuta_rosie", "lungime", "diametru", "volum_placuta_rosie", "volum_total", "observatii"
        ]
    },
    {
        id: "CHN",
        label: "Cherestea Netivită", // Fallback label, use t('material.materialTypes.CHN') for i18n
        fields: [
            "cod_unic_aviz", "data", "apv", "lat", "log", "volum_total", "nr_bucati", "volum_net_paletizat", "volum_brut_paletizat", "observatii"
        ]
    },
    {
        id: "CHS",
        label: "Cherestea Semitivită", // Fallback label, use t('material.materialTypes.CHS') for i18n
        fields: [
            "cod_unic_aviz", "data", "apv", "lat", "log", "volum_total", "nr_bucati", "volum_net_paletizat", "volum_brut_paletizat", "observatii"
        ]
    },
    {
        id: "CHT",
        label: "Cherestea Tivită", // Fallback label, use t('material.materialTypes.CHT') for i18n
        fields: [
            "cod_unic_aviz", "data", "apv", "lat", "log", "volum_total", "nr_bucati", "volum_net_paletizat", "volum_brut_paletizat", "observatii"
        ]
    },
    {
        id: "FRZ",
        label: "Frize", // Fallback label, use t('material.materialTypes.FRZ') for i18n
        fields: [
            "cod_unic_aviz", "data", "apv", "lat", "log", "volum_total", "nr_bucati", "volum_net_paletizat", "volum_brut_paletizat", "observatii"
        ]
    },
    {
        id: "FRZR",
        label: "Frize Rindeluite", // Fallback label, use t('material.materialTypes.FRZR') for i18n
        fields: [
            "cod_unic_aviz", "data", "apv", "lat", "log", "volum_total", "nr_bucati", "volum_net_paletizat", "volum_brut_paletizat", "observatii"
        ]
    },
    {
        id: "LEA",
        label: "Leaturi", // Fallback label, use t('material.materialTypes.LEA') for i18n
        fields: [
            "cod_unic_aviz", "data", "apv", "lat", "log", "volum_total", "nr_bucati", "volum_net_paletizat", "volum_brut_paletizat", "observatii"
        ]
    },
    {
        id: "PAN",
        label: "Panouri", // Fallback label, use t('material.materialTypes.PAN') for i18n
        fields: [
            "cod_unic_aviz", "data", "apv", "lat", "log", "volum_total", "nr_bucati", "volum_net_paletizat", "volum_brut_paletizat", "observatii"
        ]
    }
] as const;

// Wood Species Configuration (with fallback Romanian labels)
export const WOOD_SPECIES: readonly WoodSpeciesOption[] = [
    { id: "STJ", label: "Stejar" }, // Fallback label, use t('material.woodSpecies.STJ') for i18n
    { id: "ALB", label: "Stejar Alb" }, // Fallback label, use t('material.woodSpecies.ALB') for i18n
    { id: "FRN", label: "Frasin" }, // Fallback label, use t('material.woodSpecies.FRN') for i18n
    { id: "NUT", label: "Nuc" }, // Fallback label, use t('material.woodSpecies.NUT') for i18n
    { id: "TEI", label: "Tei" }, // Fallback label, use t('material.woodSpecies.TEI') for i18n
    { id: "FAG", label: "Fag" }, // Fallback label, use t('material.woodSpecies.FAG') for i18n
    { id: "PLT", label: "Platin" }, // Fallback label, use t('material.woodSpecies.PLT') for i18n
    { id: "PIN", label: "Pin" }, // Fallback label, use t('material.woodSpecies.PIN') for i18n
    { id: "BRD", label: "Brad" }, // Fallback label, use t('material.woodSpecies.BRD') for i18n
    { id: "MOL", label: "Molid" }, // Fallback label, use t('material.woodSpecies.MOL') for i18n
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
    getMaterialTypeLabel: (id: string, t?: TranslationFunction): string => {
        if (t) {
            const translatedLabel = t(`material.materialTypes.${id}`);
            if (translatedLabel !== `material.materialTypes.${id}`) {
                return translatedLabel;
            }
        }
        return MATERIAL_TYPE_MAP.get(id) || id;
    },

    getMaterialTypeId: (label: string): string | undefined => {
        return MATERIAL_TYPE_REVERSE_MAP.get(label);
    },

    isMaterialTypeValid: (id: string): boolean => {
        return MATERIAL_TYPE_MAP.has(id);
    },

    getMaterialTypeOptions: (t?: TranslationFunction): MaterialTypeOption[] => {
        if (t) {
            return MATERIAL_TYPES.map(type => ({
                ...type,
                label: MaterialMappings.getMaterialTypeLabel(type.id, t)
            }));
        }
        return [...MATERIAL_TYPES];
    },

    getFieldsForType: (id: string): string[] => {
        const type = MATERIAL_TYPES.find(t => t.id === id);
        return type ? type.fields : [];
    },

    // Wood Species Functions
    getWoodSpeciesLabel: (id: string, t?: TranslationFunction): string => {
        if (t) {
            const translatedLabel = t(`material.woodSpecies.${id}`);
            if (translatedLabel !== `material.woodSpecies.${id}`) {
                return translatedLabel;
            }
        }
        return WOOD_SPECIES_MAP.get(id) || id;
    },

    getWoodSpeciesId: (label: string): string | undefined => {
        return WOOD_SPECIES_REVERSE_MAP.get(label);
    },

    isWoodSpeciesValid: (id: string): boolean => {
        return WOOD_SPECIES_MAP.has(id);
    },

    getWoodSpeciesOptions: (t?: TranslationFunction): WoodSpeciesOption[] => {
        if (t) {
            return WOOD_SPECIES.map(species => ({
                ...species,
                label: MaterialMappings.getWoodSpeciesLabel(species.id, t)
            }));
        }
        return [...WOOD_SPECIES];
    },

    // Search Functions
    searchMaterialTypes: (query: string, t?: TranslationFunction): MaterialTypeOption[] => {
        const lowercaseQuery = query.toLowerCase();
        const options = MaterialMappings.getMaterialTypeOptions(t);
        return options.filter(item =>
            item.id.toLowerCase().includes(lowercaseQuery) ||
            item.label.toLowerCase().includes(lowercaseQuery)
        );
    },

    searchWoodSpecies: (query: string, t?: TranslationFunction): WoodSpeciesOption[] => {
        const lowercaseQuery = query.toLowerCase();
        const options = MaterialMappings.getWoodSpeciesOptions(t);
        return options.filter(item =>
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
