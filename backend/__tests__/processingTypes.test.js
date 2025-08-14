const {
  getProcessingType,
  applyProcessingRules,
} = require("../processingTypes");

describe("processingTypes", () => {
  describe("getProcessingType", () => {
    test("should return the correct processing type for a given ID", () => {
      const type = getProcessingType("fasonare");
      expect(type).toBeDefined();
      expect(type.id).toBe("fasonare");
      expect(type.label).toBe("Fasonare");
    });

    test("should return undefined for an unknown processing type ID", () => {
      const type = getProcessingType("unknown_type");
      expect(type).toBeUndefined();
    });
  });

  describe("applyProcessingRules", () => {
    const mockMaterials = [
      {
        _id: "mat1",
        type: "BSTN",
        specie: "stejar",
        lungime: "5.0",
        diametru: "0.3",
        volum_total: "0.35",
      },
      {
        _id: "mat2",
        type: "BSTN",
        specie: "brad",
        lungime: "4.0",
        diametru: "0.2",
        volum_total: "0.15",
      },
    ];

    test("should return an empty object if processingTypeId is not found", () => {
      const result = applyProcessingRules("non_existent_type", mockMaterials);
      expect(result).toEqual({});
    });

    test("should return an empty object if sourceMaterials is empty or null", () => {
      const result1 = applyProcessingRules("fasonare", []);
      expect(result1).toEqual({});
      const result2 = applyProcessingRules("fasonare", null);
      expect(result2).toEqual({});
    });

    test('should apply "first" carryOverStrategy correctly', () => {
      const result = applyProcessingRules("fasonare", mockMaterials);
      expect(result.type).toBe("BSTF");
      expect(result.specie).toBe("stejar");
      expect(result.apv).toBeUndefined(); // apv is not present in mockMaterials
    });

    test('should apply "sum" carryOverStrategy correctly for numeric fields', () => {
      const materialsForSum = [
        { lungime: "10", latime: "5", grosime: "2" },
        { lungime: "5", latime: "3", grosime: "1" },
      ];
      const result = applyProcessingRules("presa", materialsForSum);
      expect(result.lungime).toBe("15"); // Adjusted to match updated logic
      expect(result.latime).toBe("8");
    });

    test('should apply "average" carryOverStrategy correctly for numeric fields', () => {
      const materialsForAverage = [
        { lungime: "10", latime: "5", grosime: "2" },
        { lungime: "20", latime: "15", grosime: "4" },
      ];
      const result = applyProcessingRules("presa", materialsForAverage);
      expect(result.grosime).toBe("3");
    });

    test('should handle "all" carryOverStrategy (not explicitly in processingTypes.js, but good to test if added)', () => {
      // This test case assumes a processing type with 'all' strategy exists or is mocked.
      // Since 'all' is not in the provided processingTypes, this test will be skipped or adapted.
      // For now, I'll create a mock processing type for this test.
      const mockProcessingTypes = [
        {
          id: "test_all",
          label: "Test All",
          sourceTypes: ["ANY"],
          resultType: "COMBINED",
          carryOverFields: [
            {
              sourceField: "notes",
              resultField: "combinedNotes",
              carryOverStrategy: "all",
            },
          ],
        },
      ];

      // Temporarily override the getProcessingType to use our mock
      const originalGetProcessingType =
        require("../processingTypes").getProcessingType;
      require("../processingTypes").getProcessingType = (id) =>
        mockProcessingTypes.find((p) => p.id === id);

      const materialsWithNotes = [
        { notes: "Note 1" },
        { notes: "Note 2" },
        { notes: null },
        { notes: undefined },
      ];
      console.log(
        "Debug: Mock Processing Type for 'test_all':",
        mockProcessingTypes.find((p) => p.id === "test_all")
      );
      console.log("Debug: Materials with Notes:", materialsWithNotes);
      const result = applyProcessingRules("test_all", materialsWithNotes);
      expect(result.combinedNotes).toBe("Note 1, Note 2");

      // Restore original getProcessingType
      require("../processingTypes").getProcessingType =
        originalGetProcessingType;
    });

    test('should correctly set resultType based on "same" or explicit value', () => {
      const fasonareResult = applyProcessingRules("fasonare", mockMaterials);
      expect(fasonareResult.type).toBe("BSTF"); // Explicit resultType

      const mockProcessingTypesSame = [
        {
          id: "test_same",
          label: "Test Same",
          sourceTypes: ["BSTN"],
          resultType: "same",
          carryOverFields: [],
        },
      ];
      const originalGetProcessingType =
        require("../processingTypes").getProcessingType;
      require("../processingTypes").getProcessingType = (id) =>
        mockProcessingTypesSame.find((p) => p.id === id);

      const sameResult = applyProcessingRules("test_same", mockMaterials);
      expect(sameResult.type).toBe("BSTN"); // "same" as source material type

      require("../processingTypes").getProcessingType =
        originalGetProcessingType;
    });

    test("should correctly set resultSpecie based on additionalFields or source", () => {
      const materialsWithSpecie = [
        { _id: "mat1", type: "BSTN", specie: "stejar" },
      ];

      // Test case where specie is provided by additionalFields (mocked via processing type)
      const mockProcessingTypesWithSpecieRule = [
        {
          id: "test_specie_rule",
          label: "Test Specie Rule",
          sourceTypes: ["BSTN"],
          resultType: "BSTF",
          carryOverFields: [
            {
              sourceField: "specie",
              resultField: "specie",
              carryOverStrategy: "first",
            },
          ],
        },
      ];
      const originalGetProcessingType =
        require("../processingTypes").getProcessingType;
      require("../processingTypes").getProcessingType = (id) =>
        mockProcessingTypesWithSpecieRule.find((p) => p.id === id);

      const resultWithSpecieRule = applyProcessingRules(
        "test_specie_rule",
        materialsWithSpecie
      );
      expect(resultWithSpecieRule.specie).toBe("stejar");

      // Test case where specie is taken from sourceMaterials[0].specie if not in additionalFields
      const mockProcessingTypesNoSpecieRule = [
        {
          id: "test_no_specie_rule",
          label: "Test No Specie Rule",
          sourceTypes: ["BSTN"],
          resultType: "BSTF",
          carryOverFields: [], // No specie rule
        },
      ];
      require("../processingTypes").getProcessingType = (id) =>
        mockProcessingTypesNoSpecieRule.find((p) => p.id === id);

      const resultNoSpecieRule = applyProcessingRules(
        "test_no_specie_rule",
        materialsWithSpecie
      );
      expect(resultNoSpecieRule.specie).toBe("stejar"); // Should be taken from sourceMaterials[0].specie

      require("../processingTypes").getProcessingType =
        originalGetProcessingType;
    });
  });
});
