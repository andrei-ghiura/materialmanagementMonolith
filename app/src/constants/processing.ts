// Processing order based on material flow
export const PROCESSING_ORDER = [
    'BSTN',  // Buștean (raw material)
    'BSTF',  // Buștean Fasonat
    'CHN',   // Cherestea Netivită
    'CHS',   // Cherestea Semitivită
    'CHT',   // Cherestea Tivită
    'FRZ',   // Frize
    'FRZR',  // Frize Rindeluite
    'LEA',   // Leaturi
    'PAN'    // Panouri (final product)
];

// Processing type labels mapping
export const PROCESSING_TYPE_LABELS = new Map<string, string>([
    ['fasonare', 'Fasonare'],
    ['gaterare', 'Gaterare'],
    ['multilama_semitivire', 'Multilama Semitivire'],
    ['multilama_tivire', 'Multilama Tivire'],
    ['multilama_rindeluit', 'Multilama Rindeluit'],
    ['mrp_rindeluire_frize', 'MRP Rindeluire Frize'],
    ['mrp_leaturi', 'MRP Leaturi'],
    ['presa', 'Presa']
]);

// Get processing type label
export const getProcessingTypeLabel = (processingTypeId: string): string => {
    return PROCESSING_TYPE_LABELS.get(processingTypeId) || processingTypeId;
};

// Get processing step index for ordering
export const getProcessingStep = (materialType: string): number => {
    const index = PROCESSING_ORDER.indexOf(materialType);
    return index === -1 ? 999 : index; // Unknown types go to end
};
