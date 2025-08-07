const express = require("express");
const router = express.Router();
const processingsController = require("../controllers/processingsController");

router.get("/", processingsController.getAllProcessings);

module.exports = router;
