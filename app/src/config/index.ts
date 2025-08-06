/**
 * Config module exports
 * 
 * Centralized configuration for the Material Manager application
 */

export { MaterialMappings, MATERIAL_TYPES, WOOD_SPECIES } from './materialMappings';
export type { MaterialTypeOption, WoodSpeciesOption } from './materialMappings';

// Re-export for backward compatibility
export { materialTypes, woodSpecies } from './materialMappings';
