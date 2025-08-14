const express = require("express");
const router = express.Router();
const materialsController = require("../controllers/materialsController");
const createFlowService = require("../flow");
const Material = require("../models/Material");
const Processing = require("../models/Processing");

const flowService = createFlowService(Material, Processing);

router.get("/", materialsController.getAllMaterials);
router.post("/", materialsController.createMaterial);
router.get("/:id", materialsController.getMaterialById);
router.put("/:id", materialsController.updateMaterial);
router.delete("/:id", materialsController.deleteMaterial);

// GET /materials/:id/flow
router.get("/:id/flow", async (req, res) => {
  try {
    const flow = await flowService.getMaterialFlow(req.params.id);
    res.json(flow);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// GET /materials/:id/ancestors
router.get("/:id/ancestors", async (req, res) => {
  try {
    const Material = require("../models/Material");
    const startMaterial = await Material.findById(req.params.id);
    if (!startMaterial) {
      return res.status(404).json({ error: "Material not found" });
    }

    // Helper to recursively find ancestors
    async function findAncestors(material) {
      if (!material.componente || material.componente.length === 0) {
        // No ancestors, return this material
        return [material];
      }
      // Fetch all ancestor materials
      const ancestorMaterials = await Material.find({
        _id: { $in: material.componente },
      });
      let allAncestors = [];
      for (const ancestor of ancestorMaterials) {
        const furtherAncestors = await findAncestors(ancestor);
        allAncestors = allAncestors.concat(furtherAncestors);
      }
      return allAncestors;
    }

    let ancestors = await findAncestors(startMaterial);
    // Only return ancestors that do not have any other ancestors
    ancestors = ancestors.filter(
      (mat) => !mat.componente || mat.componente.length === 0
    );
    // Remove duplicates by _id
    const uniqueAncestors = [];
    const seen = new Set();
    for (const mat of ancestors) {
      if (!seen.has(mat._id.toString())) {
        uniqueAncestors.push(mat);
        seen.add(mat._id.toString());
      }
    }
    res.json(uniqueAncestors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
