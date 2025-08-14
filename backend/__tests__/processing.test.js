const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

describe("Processing API", () => {
  let sourceMaterialIds = [];
  let processedMaterialIds = [];
  let processingId;

  beforeEach(async () => {
    // Create source materials for processing tests
    const sourceMaterial1 = {
      type: "BSTN",
      specie: "STJ",
      cod_unic_aviz: "SRC001",
      data: "2025-01-01",
      lungime: "5.0",
      diametru: "0.3",
      volum_total: "0.35",
    };

    const sourceMaterial2 = {
      type: "BSTN",
      specie: "STJ",
      cod_unic_aviz: "SRC002",
      data: "2025-01-01",
      lungime: "4.5",
      diametru: "0.25",
      volum_total: "0.22",
    };

    const response1 = await request(app)
      .post("/materials")
      .send(sourceMaterial1);

    const response2 = await request(app)
      .post("/materials")
      .send(sourceMaterial2);

    sourceMaterialIds = [response1.body._id, response2.body._id];
  });

  describe("POST /materials/process", () => {
    test("should process materials successfully", async () => {
      const processingRequest = {
        sourceIds: sourceMaterialIds,
        outputConfig: {
          type: "BSTF",
          specie: "STJ",
          count: 2,
          processingTypeId: "fasonare",
        },
      };

      const response = await request(app)
        .post("/materials/process")
        .send(processingRequest)
        .expect(200);

      expect(response.body).toHaveProperty("outputMaterials");
      expect(response.body).toHaveProperty("processing");
      expect(response.body.outputMaterials).toHaveLength(2);
      expect(response.body.outputMaterials[0].type).toBe("BSTF");
      expect(response.body.processing.processingTypeId).toBe("fasonare");

      // Store for cleanup
      processedMaterialIds = response.body.outputMaterials.map((m) => m._id);
      processingId = response.body.processing._id;
    });

    test("should return 400 for missing required fields", async () => {
      const invalidRequest = {
        sourceIds: sourceMaterialIds,
        outputConfig: {
          type: "BSTF",
          // Missing specie, count, processingTypeId
        },
      };

      await request(app)
        .post("/materials/process")
        .send(invalidRequest)
        .expect(400);
    });

    test("should return 400 for invalid processing type", async () => {
      const invalidRequest = {
        sourceIds: sourceMaterialIds,
        outputConfig: {
          type: "BSTF",
          specie: "STJ",
          count: 1,
          processingTypeId: "invalid_processing_type",
        },
      };

      await request(app)
        .post("/materials/process")
        .send(invalidRequest)
        .expect(400);
    });

    test("should return 400 for non-existent source materials", async () => {
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
    });
  });

  describe("GET /api/processings", () => {
    test("should get processing history", async () => {
      // First create a processing
      const processingRequest = {
        sourceIds: sourceMaterialIds,
        outputConfig: {
          type: "BSTF",
          specie: "STJ",
          count: 1,
          processingTypeId: "fasonare",
        },
      };

      await request(app).post("/materials/process").send(processingRequest);

      const response = await request(app).get("/api/processings").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const processing = response.body[0];
      expect(processing).toHaveProperty("sourceIds");
      expect(processing).toHaveProperty("outputIds");
      expect(processing).toHaveProperty("processingTypeId");
      expect(processing).toHaveProperty("processingDate");
    });
  });

  describe("GET /processings", () => {
    test("should get all processings (alternative endpoint)", async () => {
      const response = await request(app).get("/processings").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe("GET /processing-types", () => {
    test("should get all processing types", async () => {
      const response = await request(app).get("/processing-types").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const processingType = response.body[0];
      expect(processingType).toHaveProperty("id");
      expect(processingType).toHaveProperty("label");
      expect(processingType).toHaveProperty("sourceTypes");
      expect(processingType).toHaveProperty("resultType");
    });
  });

  describe("GET /processing-types/:materialType", () => {
    test("should get processing types for specific material type", async () => {
      const response = await request(app)
        .get("/processing-types/BSTN")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);

      // All returned processing types should accept BSTN as source
      response.body.forEach((processingType) => {
        expect(processingType.sourceTypes).toContain("BSTN");
      });
    });

    test("should return empty array for non-existent material type", async () => {
      const response = await request(app)
        .get("/processing-types/NONEXISTENT")
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });
});
