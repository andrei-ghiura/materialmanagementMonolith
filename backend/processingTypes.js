/**
 * Processing Types Configuration
 *
 * This file defines the different types of material processing operations
 * and how fields should be carried over from source to result materials.
 */

// Define what types of processings are available
const processingTypes = [
  {
    id: "fasonare",
    label: "Fasonare",
    description: "Transformarea unui buștean în buștean fasonat",
    sourceTypes: ["BSTN"],
    resultType: "BSTF",
    carryOverFields: [
      {
        sourceField: "specie",
        resultField: "specie",
        carryOverStrategy: "first",
        isRequired: true,
      },
      {
        sourceField: "apv",
        resultField: "apv",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "cod_unic_aviz",
        resultField: "cod_unic_aviz",
        carryOverStrategy: "first",
        isRequired: false,
      },
    ],
  },
  {
    id: "gaterare",
    label: "Gaterare",
    description:
      "Transformarea busteanului sau busteanului fasonat în cherestea netivită",
    sourceTypes: ["BSTN", "BSTF"],
    resultType: "CHN",
    carryOverFields: [
      {
        sourceField: "specie",
        resultField: "specie",
        carryOverStrategy: "first",
        isRequired: true,
      },
      {
        sourceField: "apv",
        resultField: "apv",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "cod_unic_aviz",
        resultField: "cod_unic_aviz",
        carryOverStrategy: "first",
        isRequired: false,
      },
    ],
  },
  {
    id: "multilama_semitivire",
    label: "Multilama Semitivire",
    description: "Transformarea cherestelei netivite în cherestea semitivită",
    sourceTypes: ["CHN"],
    resultType: "CHS",
    carryOverFields: [
      {
        sourceField: "specie",
        resultField: "specie",
        carryOverStrategy: "first",
        isRequired: true,
      },
      {
        sourceField: "apv",
        resultField: "apv",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "cod_unic_aviz",
        resultField: "cod_unic_aviz",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "lungime",
        resultField: "lungime",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "latime",
        resultField: "latime",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "grosime",
        resultField: "grosime",
        carryOverStrategy: "first",
        isRequired: false,
      },
    ],
  },
  {
    id: "multilama_tivire",
    label: "Multilama Tivire",
    description: "Transformarea cherestelei semitivite în cherestea tivită",
    sourceTypes: ["CHS"],
    resultType: "CHT",
    carryOverFields: [
      {
        sourceField: "specie",
        resultField: "specie",
        carryOverStrategy: "first",
        isRequired: true,
      },
      {
        sourceField: "apv",
        resultField: "apv",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "cod_unic_aviz",
        resultField: "cod_unic_aviz",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "lungime",
        resultField: "lungime",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "latime",
        resultField: "latime",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "grosime",
        resultField: "grosime",
        carryOverStrategy: "first",
        isRequired: false,
      },
    ],
  },
  {
    id: "multilama_rindeluit",
    label: "Multilama Rindeluit",
    description: "Transformarea cherestelei tivite în frize",
    sourceTypes: ["CHT"],
    resultType: "FRZ",
    carryOverFields: [
      {
        sourceField: "specie",
        resultField: "specie",
        carryOverStrategy: "first",
        isRequired: true,
      },
      {
        sourceField: "apv",
        resultField: "apv",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "cod_unic_aviz",
        resultField: "cod_unic_aviz",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "lungime",
        resultField: "lungime",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "latime",
        resultField: "latime",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "grosime",
        resultField: "grosime",
        carryOverStrategy: "first",
        isRequired: false,
      },
    ],
  },
  {
    id: "mrp_rindeluire_frize",
    label: "MRP Rindeluire Frize",
    description: "Transformarea frizelor în frize rindeluite",
    sourceTypes: ["FRZ"],
    resultType: "FRZR",
    carryOverFields: [
      {
        sourceField: "specie",
        resultField: "specie",
        carryOverStrategy: "first",
        isRequired: true,
      },
      {
        sourceField: "apv",
        resultField: "apv",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "cod_unic_aviz",
        resultField: "cod_unic_aviz",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "lungime",
        resultField: "lungime",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "latime",
        resultField: "latime",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "grosime",
        resultField: "grosime",
        carryOverStrategy: "first",
        isRequired: false,
      },
    ],
  },
  {
    id: "mrp_leaturi",
    label: "MRP Leaturi",
    description: "Transformarea frizelor rindeluite în leaturi",
    sourceTypes: ["FRZR"],
    resultType: "LEA",
    carryOverFields: [
      {
        sourceField: "specie",
        resultField: "specie",
        carryOverStrategy: "first",
        isRequired: true,
      },
      {
        sourceField: "apv",
        resultField: "apv",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "cod_unic_aviz",
        resultField: "cod_unic_aviz",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "lungime",
        resultField: "lungime",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "latime",
        resultField: "latime",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "grosime",
        resultField: "grosime",
        carryOverStrategy: "first",
        isRequired: false,
      },
    ],
  },
  {
    id: "presa",
    label: "Presa",
    description: "Transformarea leaturilor în panouri",
    sourceTypes: ["LEA"],
    resultType: "PAN",
    carryOverFields: [
      {
        sourceField: "specie",
        resultField: "specie",
        carryOverStrategy: "first",
        isRequired: true,
      },
      {
        sourceField: "apv",
        resultField: "apv",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "cod_unic_aviz",
        resultField: "cod_unic_aviz",
        carryOverStrategy: "first",
        isRequired: false,
      },
      {
        sourceField: "lungime",
        resultField: "lungime",
        carryOverStrategy: "sum",
        isRequired: false,
      },
      {
        sourceField: "latime",
        resultField: "latime",
        carryOverStrategy: "sum",
        isRequired: false,
      },
      {
        sourceField: "grosime",
        resultField: "grosime",
        carryOverStrategy: "average",
        isRequired: false,
      },
    ],
  },
];

/**
 * Get a processing type by its ID
 */
function getProcessingType(id) {
  return processingTypes.find((p) => p.id === id);
}

/**
 * Apply processing rules to generate fields for a new material
 */
function applyProcessingRules(processingTypeId, sourceMaterials) {
  const processingType = getProcessingType(processingTypeId);
  if (!processingType || !sourceMaterials || sourceMaterials.length === 0) {
    return {};
  }

  // Start with an empty result
  const result = {};

  // Set the type based on the processing type
  result.type =
    processingType.resultType === "same"
      ? sourceMaterials[0].type
      : processingType.resultType;

  // Apply each carry-over rule
  processingType.carryOverFields.forEach((field) => {
    if (field.carryOverStrategy === "first") {
      // Take value from the first source material
      const value = sourceMaterials[0][field.sourceField];
      if (value !== undefined && value !== null) {
        result[field.resultField] = value;
      }
    } else if (field.carryOverStrategy === "all") {
      // Combine values from all source materials (e.g., for notes)
      const values = sourceMaterials
        .map((m) => m[field.sourceField])
        .filter((v) => v !== undefined && v !== null);
      if (values.length > 0) {
        result[field.resultField] = values.join(", ");
      }
    } else if (field.carryOverStrategy === "sum") {
      // Sum numeric values (e.g., for volumes)
      const sum = sourceMaterials.reduce((total, m) => {
        const val = m[field.sourceField];
        return total + (val ? parseFloat(val) : 0);
      }, 0);
      result[field.resultField] = sum.toString();
    } else if (field.carryOverStrategy === "average") {
      // Average numeric values
      const validValues = sourceMaterials
        .map((m) => m[field.sourceField])
        .filter((v) => v !== undefined && v !== null)
        .map((v) => parseFloat(v));

      if (validValues.length > 0) {
        const avg =
          validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
        result[field.resultField] = avg.toString();
      }
    }
    // For 'manual', we don't set anything automatically
  });

  return result;
}

module.exports = {
  processingTypes,
  getProcessingType,
  applyProcessingRules,
};
