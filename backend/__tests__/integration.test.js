const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

describe("Material Processing Workflow Integration Tests", () => {
  let bstnMaterialIds = [];
  let bstfMaterialIds = [];
  let blcnMaterialIds = [];

  describe("Complete Processing Chain", () => {
    test("should complete full processing workflow: BSTN → BSTF → BLCN", async () => {
      // Step 1: Create initial BSTN materials
      const bstnMaterials = [
        {
          type: "BSTN",
          specie: "FAG",
          cod_unic_aviz: "WF001",
          data: "2025-01-01",
          lungime: "8.0",
          diametru: "0.5",
          volum_total: "1.57",
        },
        {
          type: "BSTN",
          specie: "FAG",
          cod_unic_aviz: "WF002",
          data: "2025-01-01",
          lungime: "7.5",
          diametru: "0.45",
          volum_total: "1.19",
        },
      ];

      for (const material of bstnMaterials) {
        const response = await request(app)
          .post("/materials")
          .send(material)
          .expect(201);
        bstnMaterialIds.push(response.body._id);
      }

      // Step 2: Process BSTN → BSTF (fasonare)
      const fasonareRequest = {
        sourceIds: bstnMaterialIds,
        outputConfig: {
          type: "BSTF",
          specie: "FAG",
          count: 3,
          processingTypeId: "fasonare",
        },
      };

      const fasonareResponse = await request(app)
        .post("/materials/process")
        .send(fasonareRequest)
        .expect(200);

      expect(fasonareResponse.body.materials).toHaveLength(3);
      bstfMaterialIds = fasonareResponse.body.materials.map((m) => m._id);

      // Step 3: Process BSTF → BLCN (debitare)
      const debitareRequest = {
        sourceIds: bstfMaterialIds,
        outputConfig: {
          type: "BLCN",
          specie: "FAG",
          count: 5,
          processingTypeId: "debitare",
        },
      };

      const debitareResponse = await request(app)
        .post("/materials/process")
        .send(debitareRequest)
        .expect(200);

      expect(debitareResponse.body.materials).toHaveLength(5);
      blcnMaterialIds = debitareResponse.body.materials.map((m) => m._id);

      // Step 4: Verify processing history
      const processingsResponse = await request(app)
        .get("/api/processings")
        .expect(200);

      expect(processingsResponse.body).toHaveLength(2);

      const fasonareProcessing = processingsResponse.body.find(
        (p) => p.processingTypeId === "fasonare"
      );
      const debitareProcessing = processingsResponse.body.find(
        (p) => p.processingTypeId === "debitare"
      );

      expect(fasonareProcessing).toBeDefined();
      expect(debitareProcessing).toBeDefined();

      expect(fasonareProcessing.sourceIds).toEqual(bstnMaterialIds);
      expect(fasonareProcessing.outputIds).toEqual(bstfMaterialIds);

      expect(debitareProcessing.sourceIds).toEqual(bstfMaterialIds);
      expect(debitareProcessing.outputIds).toEqual(blcnMaterialIds);

      // Step 5: Verify all materials exist and have correct types
      const allMaterials = await request(app).get("/materials").expect(200);

      const bstnCount = allMaterials.body.filter(
        (m) => m.type === "BSTN"
      ).length;
      const bstfCount = allMaterials.body.filter(
        (m) => m.type === "BSTF"
      ).length;
      const blcnCount = allMaterials.body.filter(
        (m) => m.type === "BLCN"
      ).length;

      expect(bstnCount).toBe(2); // Original materials
      expect(bstfCount).toBe(3); // From fasonare
      expect(blcnCount).toBe(5); // From debitare
    });
  });

  describe("Material Flow Traceability", () => {
    test("should maintain complete traceability through processing chain", async () => {
      // Create source material
      const sourceMaterial = {
        type: "BSTN",
        specie: "STJ",
        cod_unic_aviz: "TRACE001",
        data: "2025-01-01",
        lungime: "6.0",
        diametru: "0.4",
        volum_total: "0.75",
      };

      const sourceResponse = await request(app)
        .post("/materials")
        .send(sourceMaterial)
        .expect(201);

      const sourceId = sourceResponse.body._id;

      // Process to BSTF
      const fasonareRequest = {
        sourceIds: [sourceId],
        outputConfig: {
          type: "BSTF",
          specie: "STJ",
          count: 2,
          processingTypeId: "fasonare",
        },
      };

      const fasonareResponse = await request(app)
        .post("/materials/process")
        .send(fasonareRequest)
        .expect(200);

      const bstfIds = fasonareResponse.body.materials.map((m) => m._id);

      // Get processing history and verify traceability
      const processings = await request(app)
        .get("/api/processings")
        .expect(200);

      const traceableProcessing = processings.body.find(
        (p) =>
          p.sourceIds.includes(sourceId) && p.processingTypeId === "fasonare"
      );

      expect(traceableProcessing).toBeDefined();
      expect(traceableProcessing.outputIds).toEqual(bstfIds);
      expect(traceableProcessing.sourceIds).toContain(sourceId);
    });
  });

  describe("Processing Type Validation", () => {
    test("should validate processing types are available for material types", async () => {
      // Test all major material types have processing options
      const materialTypes = ["BSTN", "BSTF", "BLCN"];

      for (const materialType of materialTypes) {
        const response = await request(app)
          .get(`/processing-types/${materialType}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);

        // Each processing type should accept this material type
        response.body.forEach((processingType) => {
          expect(processingType.sourceTypes).toContain(materialType);
        });
      }
    });

    test("should get all processing types", async () => {
      const response = await request(app).get("/processing-types").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verify structure of processing types
      const processingType = response.body[0];
      expect(processingType).toHaveProperty("id");
      expect(processingType).toHaveProperty("label");
      expect(processingType).toHaveProperty("sourceTypes");
      expect(processingType).toHaveProperty("resultType");
      expect(Array.isArray(processingType.sourceTypes)).toBe(true);
    });
  });

  describe("Error Handling Integration", () => {
    test("should handle complex error scenarios", async () => {
      // Try to process non-existent materials
      const fakeId = new mongoose.Types.ObjectId();
      const invalidRequest = {
        sourceIds: [fakeId],
        outputConfig: {
          type: "BSTF",
          specie: "STJ",
          count: 1,
          processingTypeId: "fasonare",
        },
      };

      await request(app)
        .post("/materials/process")
        .send(invalidRequest)
        .expect(400);

      // Try to use invalid processing type
      const sourceMaterial = {
        type: "BSTN",
        specie: "STJ",
        cod_unic_aviz: "ERROR001",
        data: "2025-01-01",
        lungime: "5.0",
        diametru: "0.3",
        volum_total: "0.35",
      };

      const sourceResponse = await request(app)
        .post("/materials")
        .send(sourceMaterial)
        .expect(201);

      const invalidProcessingRequest = {
        sourceIds: [sourceResponse.body._id],
        outputConfig: {
          type: "BSTF",
          specie: "STJ",
          count: 1,
          processingTypeId: "nonexistent_processing",
        },
      };

      await request(app)
        .post("/materials/process")
        .send(invalidProcessingRequest)
        .expect(400);
    });
  });

  describe("API Health and Status", () => {
    test("should respond to health check", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status");
      expect(response.body.status).toBe("healthy");
    });

    test("should handle database connection status", async () => {
      expect(mongoose.connection.readyState).toBe(1); // Connected
    });
  });
});
