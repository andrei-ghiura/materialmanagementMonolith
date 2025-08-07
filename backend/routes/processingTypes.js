const express = require("express");
const router = express.Router();
const controller = require("../controllers/processingTypesController");

router.get("/", controller.getProcessingTypes);
router.get("/:materialType", controller.getProcessingTypesByMaterial);

module.exports = router;
