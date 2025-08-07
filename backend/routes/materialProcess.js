const express = require("express");
const router = express.Router();
const controller = require("../controllers/materialProcessController");

router.post("/", controller.processMaterials);

module.exports = router;
