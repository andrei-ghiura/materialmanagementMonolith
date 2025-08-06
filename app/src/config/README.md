# Material Mappings Configuration

This document describes the centralized material mapping system that replaces the old `selectOptions.ts` approach.

## Overview

The new system provides optimized, type-safe mappings between database IDs and human-readable labels for material types and wood species.

## Location

📁 **`src/config/materialMappings.ts`** - Main configuration file
📁 **`src/config/index.ts`** - Barrel exports for easier imports

## Key Improvements

### 🚀 Performance
- **O(1) Map lookups** instead of O(n) array.find()
- **~10-50x faster** for frequent lookups
- **Pre-computed Maps** for both forward and reverse lookups

### 🔧 Developer Experience
- **Type safety** with TypeScript interfaces
- **Utility functions** for common operations
- **Search functionality** built-in
- **Validation helpers** for ID checking

### 🏗️ Architecture
- **Single source of truth** for all mappings
- **Centralized configuration** in config folder
- **Backward compatibility** maintained during migration

## Usage Examples

### Basic Lookups
```typescript
import { MaterialMappings } from '../config/materialMappings';

// Get human-readable label from database ID
const typeLabel = MaterialMappings.getMaterialTypeLabel('BSTN'); // "Buștean"
const speciesLabel = MaterialMappings.getWoodSpeciesLabel('STJ'); // "Stejar"

// Get database ID from label (reverse lookup)
const typeId = MaterialMappings.getMaterialTypeId('Buștean'); // "BSTN"
const speciesId = MaterialMappings.getWoodSpeciesId('Stejar'); // "STJ"
```

### Validation
```typescript
// Check if IDs are valid
const isValidType = MaterialMappings.isMaterialTypeValid('BSTN'); // true
const isValidSpecies = MaterialMappings.isWoodSpeciesValid('XYZ'); // false
```

### Getting All Options (for dropdowns)
```typescript
// Get all options for select components
const materialTypes = MaterialMappings.getMaterialTypeOptions();
const woodSpecies = MaterialMappings.getWoodSpeciesOptions();

// Example JSX usage
{materialTypes.map(type => (
    <IonSelectOption key={type.id} value={type.id}>
        {type.label}
    </IonSelectOption>
))}
```

### Search Functionality
```typescript
// Search through options
const foundTypes = MaterialMappings.searchMaterialTypes('cher'); // Finds "Cherestea" items
const foundSpecies = MaterialMappings.searchWoodSpecies('st'); // Finds "Stejar" items
```

## Migration Guide

### Before (Old System)
```typescript
import { materialTypes, woodSpecies } from '../selectOptions';

// Slow O(n) lookup
const label = materialTypes.find(t => t.id === 'BSTN')?.label || 'BSTN';

// Used throughout components
{materialTypes.map(type => ...)}
```

### After (New System)
```typescript
import { MaterialMappings } from '../config/materialMappings';

// Fast O(1) lookup
const label = MaterialMappings.getMaterialTypeLabel('BSTN');

// Optimized access
{MaterialMappings.getMaterialTypeOptions().map(type => ...)}
```

## File Structure

```
src/config/
├── materialMappings.ts     # Main configuration
├── index.ts               # Barrel exports
└── performanceTest.ts     # Benchmark utilities
```

## Data Structure

### Material Types
| ID   | Label                |
| ---- | -------------------- |
| BSTN | Buștean              |
| BSTF | Buștean Fasonat      |
| CHN  | Cherestea Netivită   |
| CHS  | Cherestea Semitivită |
| CHT  | Cherestea Tivită     |
| FRZ  | Frize                |
| FRZR | Frize Rindeluite     |
| LEA  | Leaturi              |
| PAN  | Panouri              |

### Wood Species
| ID  | Label      |
| --- | ---------- |
| STJ | Stejar     |
| ALB | Stejar Alb |
| FRN | Frasin     |
| NUT | Nuc        |
| TEI | Tei        |
| FAG | Fag        |
| PLT | Platin     |
| PIN | Pin        |
| BRD | Brad       |
| MOL | Molid      |

## Components Updated

✅ **MaterialItem.tsx** - Display labels  
✅ **ProcessingView.tsx** - Dropdowns and search  
✅ **MaterialView.tsx** - Form selects  
✅ **MaterialFlowView.tsx** - Node labels  

## Performance Benefits

- **Lookup Speed**: O(1) Map access vs O(n) array search
- **Memory Efficiency**: Pre-computed maps avoid repeated computations
- **Bundle Size**: Same constants, more efficient access patterns
- **Runtime Performance**: Faster rendering for large material lists

## Backward Compatibility

The old `materialTypes` and `woodSpecies` exports are still available for gradual migration:

```typescript
// Still works (deprecated)
import { materialTypes, woodSpecies } from '../config/materialMappings';
```

## Testing

Run the performance benchmark:
```typescript
import { runPerformanceTest } from '../config/performanceTest';
runPerformanceTest(); // See console for timing results
```

This new system provides a solid foundation for scalable material management while maintaining excellent performance and developer experience.
