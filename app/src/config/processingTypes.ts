import { Material } from '../types';

// Define what types of processings are available
export interface ProcessingType {
    id: string;          // Unique identifier for this processing type
    label: string;       // Display name for this processing type
    description: string; // Description of what this processing does
    sourceTypes: string[]; // Valid source material types
    resultType: string;  // What type the result material will be
    // Fields that should be copied from source to result
    carryOverFields: CarryOverConfig[];
}

// Configuration for how fields should be carried over
export interface CarryOverConfig {
    sourceField: keyof Material;    // Field name in source material
    resultField: keyof Material;    // Field name in result material
    carryOverStrategy: 'first' | 'all' | 'average' | 'sum' | 'manual'; // How to handle multiple sources
    isRequired: boolean;    // Whether this field must be populated
    transform?: (value: unknown, sourceMaterials: Material[]) => unknown; // Optional transformation function
}

// Define the available processing types
export const processingTypes: ProcessingType[] = [
    {
        id: 'fasonare',
        label: 'Fasonare',
        description: 'Transformarea unui bustean în bustean fasonat',
        sourceTypes: ['bustean'],
        resultType: 'bustean_fasonat',
        carryOverFields: [
            {
                sourceField: 'specie',
                resultField: 'specie',
                carryOverStrategy: 'first',
                isRequired: true
            },
            {
                sourceField: 'apv',
                resultField: 'apv',
                carryOverStrategy: 'first',
                isRequired: false
            },
            {
                sourceField: 'cod_unic_aviz',
                resultField: 'cod_unic_aviz',
                carryOverStrategy: 'first',
                isRequired: false
            },
            // Diametrul și lungimea vor fi adăugate manual
        ]
    },
    {
        id: 'debitare',
        label: 'Debitare',
        description: 'Transformarea unui bustean fasonat în cherestea',
        sourceTypes: ['bustean_fasonat'],
        resultType: 'cherestea',
        carryOverFields: [
            {
                sourceField: 'specie',
                resultField: 'specie',
                carryOverStrategy: 'first',
                isRequired: true
            },
            {
                sourceField: 'apv',
                resultField: 'apv',
                carryOverStrategy: 'first',
                isRequired: false
            },
            // Dimensiunile vor fi adăugate manual
        ]
    },
    {
        id: 'imbinare',
        label: 'Îmbinare',
        description: 'Îmbinarea mai multor bucăți de cherestea într-un panou',
        sourceTypes: ['cherestea'],
        resultType: 'panou',
        carryOverFields: [
            {
                sourceField: 'specie',
                resultField: 'specie',
                carryOverStrategy: 'first', // Presupunem că toate piesele sunt din aceeași specie
                isRequired: true
            },
            // Volumul va fi suma volumelor componentelor
            {
                sourceField: 'volum_total',
                resultField: 'volum_total',
                carryOverStrategy: 'sum',
                isRequired: false,
                transform: (value, materials) => {
                    return materials.reduce((sum, mat) =>
                        sum + (mat.volum_total ? parseFloat(mat.volum_total) : 0), 0).toFixed(3);
                }
            }
        ]
    },
    {
        id: 'uscare',
        label: 'Uscare',
        description: 'Uscarea materialului pentru reducerea umidității',
        sourceTypes: ['cherestea', 'panou'],
        resultType: 'same', // Păstrează același tip
        carryOverFields: [
            // Păstrează toate caracteristicile, dar adaugă observație despre uscare
            {
                sourceField: 'type',
                resultField: 'type',
                carryOverStrategy: 'first',
                isRequired: true
            },
            {
                sourceField: 'specie',
                resultField: 'specie',
                carryOverStrategy: 'first',
                isRequired: true
            },
            {
                sourceField: 'lungime',
                resultField: 'lungime',
                carryOverStrategy: 'first',
                isRequired: false
            },
            {
                sourceField: 'diametru',
                resultField: 'diametru',
                carryOverStrategy: 'first',
                isRequired: false
            },
            {
                sourceField: 'volum_total',
                resultField: 'volum_total',
                carryOverStrategy: 'first',
                isRequired: false
            },
            {
                sourceField: 'observatii',
                resultField: 'observatii',
                carryOverStrategy: 'first',
                isRequired: false,
                transform: (value) => (value || '') + ' - Material uscat'
            }
        ]
    }
];

// Helper function to get a processing type by ID
export function getProcessingType(id: string): ProcessingType | undefined {
    return processingTypes.find(p => p.id === id);
}

// Helper function to get valid processing types for a given source material type
export function getValidProcessingTypes(sourceType: string): ProcessingType[] {
    return processingTypes.filter(p => p.sourceTypes.includes(sourceType));
}

// Helper function to apply processing type rules to generate new material fields
export function applyProcessingRules(
    processingTypeId: string,
    sourceMaterials: Material[]
): Partial<Material> {
    const processingType = getProcessingType(processingTypeId);
    if (!processingType || sourceMaterials.length === 0) {
        return {};
    }

    // Start with an empty result
    const result: Partial<Material> = {};

    // Set the type based on the processing type
    result.type = processingType.resultType === 'same'
        ? sourceMaterials[0].type
        : processingType.resultType;

    // Apply each carry-over rule
    processingType.carryOverFields.forEach(field => {
        if (field.carryOverStrategy === 'first') {
            // Take value from the first source material
            const value = sourceMaterials[0][field.sourceField];
            if (field.transform) {
                // @ts-expect-error - Complex type intersection, using type assertion
                result[field.resultField] = field.transform(value, sourceMaterials) as Material[keyof Material];
            } else {
                // @ts-expect-error - Complex type intersection, using type assertion
                result[field.resultField] = value;
            }
        } else if (field.carryOverStrategy === 'all') {
            // Combine values from all source materials (e.g., for notes)
            const values = sourceMaterials
                .map(m => m[field.sourceField])
                .filter(v => v !== undefined && v !== null);
            if (values.length > 0) {
                if (field.transform) {
                    // @ts-expect-error - Complex type intersection, using type assertion
                    result[field.resultField] = field.transform(values.join(', '), sourceMaterials);
                } else {
                    // @ts-expect-error - Complex type intersection, using type assertion
                    result[field.resultField] = values.join(', ') as string;
                }
            }
        } else if (field.carryOverStrategy === 'sum') {
            // Sum numeric values (e.g., for volumes)
            if (field.transform) {
                // @ts-expect-error - Complex type intersection, using type assertion
                result[field.resultField] = field.transform(null, sourceMaterials);
            } else {
                const sum = sourceMaterials.reduce((total, m) => {
                    const val = m[field.sourceField];
                    return total + (val ? parseFloat(val as string) : 0);
                }, 0);
                // @ts-expect-error - Complex type intersection, using type assertion
                result[field.resultField] = sum.toString() as string;
            }
        } else if (field.carryOverStrategy === 'average') {
            // Average numeric values
            const validValues = sourceMaterials
                .map(m => m[field.sourceField])
                .filter(v => v !== undefined && v !== null)
                .map(v => parseFloat(v as string));

            if (validValues.length > 0) {
                const avg = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
                if (field.transform) {
                    // @ts-expect-error - Complex type intersection, using type assertion
                    result[field.resultField] = field.transform(avg, sourceMaterials);
                } else {
                    // @ts-expect-error - Complex type intersection, using type assertion
                    result[field.resultField] = avg.toString() as string;
                }
            }
        }
        // For 'manual', we don't set anything automatically
    });

    return result;
}
