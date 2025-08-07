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

module.exports = router;
