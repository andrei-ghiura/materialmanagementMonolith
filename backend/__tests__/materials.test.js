const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

// Mock material data
const mockMaterial = {
  type: "BSTN",
  specie: "STJ",
  cod_unic_aviz: "TEST123",
  data: "2025-01-01",
  apv: "APV123",
  lungime: "5.0",
  diametru: "0.3",
  volum_total: "0.35",
  observatii: "Test material",
};

describe("Materials API", () => {
  let materialId;

  // Helper function to create a material
  const createTestMaterial = async (overrides = {}) => {
    const material = { ...mockMaterial, ...overrides };
    const response = await request(app).post("/materials").send(material);
    return response;
  };

  describe("POST /materials", () => {
    test("should create a new material", async () => {
      const response = await request(app)
        .post("/materials")
        .send(mockMaterial)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.type).toBe(mockMaterial.type);
      expect(response.body.specie).toBe(mockMaterial.specie);
      expect(response.body.humanId).toBeDefined();

      materialId = response.body._id;
    });

    test("should return 400 for invalid material data", async () => {
      const invalidMaterial = { ...mockMaterial };
      delete invalidMaterial.type; // Remove required field

      await request(app).post("/materials").send(invalidMaterial).expect(400);
    });
  });

  describe("GET /materials", () => {
    beforeEach(async () => {
      // Create a material for this test suite
      const response = await createTestMaterial({ cod_unic_aviz: "GET001" });
      materialId = response.body._id;
    });

    test("should get all materials", async () => {
      const response = await request(app).get("/materials").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /materials/:id", () => {
    beforeEach(async () => {
      // Create a material for this test suite
      const response = await createTestMaterial({ cod_unic_aviz: "GETID001" });
      materialId = response.body._id;
    });

    test("should get a material by ID", async () => {
      const response = await request(app)
        .get(`/materials/${materialId}`)
        .expect(200);

      expect(response.body._id).toBe(materialId);
      expect(response.body.type).toBe(mockMaterial.type);
    });

    test("should return 404 for non-existent material", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app).get(`/materials/${fakeId}`).expect(404);
    });

    test("should return 400 for invalid material ID", async () => {
      await request(app).get("/materials/invalid-id").expect(400);
    });
  });

  describe("PUT /materials/:id", () => {
    beforeEach(async () => {
      // Create a material for this test suite
      const response = await createTestMaterial({ cod_unic_aviz: "PUT001" });
      materialId = response.body._id;
    });

    test("should update a material", async () => {
      const updatedData = {
        observatii: "Updated test material",
      };

      const response = await request(app)
        .put(`/materials/${materialId}`)
        .send(updatedData)
        .expect(200);

      expect(response.body._id).toBe(materialId);
      expect(response.body.observatii).toBe("Updated test material");
    });

    test("should return 404 for non-existent material", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .put(`/materials/${fakeId}`)
        .send(mockMaterial)
        .expect(404);
    });
  });

  describe("DELETE /materials/:id", () => {
    beforeEach(async () => {
      // Create a material for this test suite
      const response = await createTestMaterial({ cod_unic_aviz: "DEL001" });
      materialId = response.body._id;
    });

    test("should soft delete a material", async () => {
      await request(app).delete(`/materials/${materialId}`).expect(204);

      // Verify material is not found via API
      await request(app).get(`/materials/${materialId}`).expect(404);

      // Verify material is still in DB but marked as deleted
      const Material = require("../models/Material");
      const mat = await Material.findById(materialId);
      expect(mat).not.toBeNull();
      expect(mat.deleted).toBe(true);
    });

    test("should return 404 for non-existent material", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app).delete(`/materials/${fakeId}`).expect(404);
    });
  });
});
