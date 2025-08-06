/**
 * Performance Benchmark: Material Mapping System
 * 
 * This file demonstrates the performance improvements of the new mapping system
 * vs the old array.find() approach.
 */

import { MaterialMappings, MATERIAL_TYPES, WOOD_SPECIES } from './materialMappings';

// Old approach (array.find)
const oldGetMaterialTypeLabel = (id: string): string => {
    return MATERIAL_TYPES.find(t => t.id === id)?.label || id;
};

const oldGetWoodSpeciesLabel = (id: string): string => {
    return WOOD_SPECIES.find(s => s.id === id)?.label || id;
};

// Performance test function
export const runPerformanceTest = () => {
    const iterations = 100000;
    const testIds = ['BSTN', 'CHN', 'FRZ', 'PAN']; // Sample material type IDs
    const speciesIds = ['STJ', 'FRN', 'FAG', 'MOL']; // Sample wood species IDs

    console.log('🚀 Running Material Mapping Performance Test...');
    console.log(`Testing ${iterations.toLocaleString()} lookups for each method\n`);

    // Test Material Types
    console.log('📊 Material Type Lookups:');

    // Old method timing
    console.time('Old Array.find() method');
    for (let i = 0; i < iterations; i++) {
        const id = testIds[i % testIds.length];
        oldGetMaterialTypeLabel(id);
    }
    console.timeEnd('Old Array.find() method');

    // New method timing
    console.time('New Map lookup method');
    for (let i = 0; i < iterations; i++) {
        const id = testIds[i % testIds.length];
        MaterialMappings.getMaterialTypeLabel(id);
    }
    console.timeEnd('New Map lookup method');

    console.log('\n📊 Wood Species Lookups:');

    // Old method timing for wood species
    console.time('Old Array.find() method');
    for (let i = 0; i < iterations; i++) {
        const id = speciesIds[i % speciesIds.length];
        oldGetWoodSpeciesLabel(id);
    }
    console.timeEnd('Old Array.find() method');

    // New method timing for wood species
    console.time('New Map lookup method');
    for (let i = 0; i < iterations; i++) {
        const id = speciesIds[i % speciesIds.length];
        MaterialMappings.getWoodSpeciesLabel(id);
    }
    console.timeEnd('New Map lookup method');

    console.log('\n✅ Performance test completed!');
    console.log('Expected improvement: ~10-50x faster with Map lookups (O(1) vs O(n))');
};

// Uncomment to run the test in development
// runPerformanceTest();
