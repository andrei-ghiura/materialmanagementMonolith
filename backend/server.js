const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
var cors = require("cors");

function connectToDatabase() {
  console.log("Connecting to MongoDB:" + process.env.MONGODB_URL);
  const dbUrl =
    process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/materialmanager";
  mongoose
    .connect(dbUrl, {
      user: process.env.MONGODB_USER || "root",
      pass: process.env.MONGODB_PASSWORD || "root",
    })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    });
}

function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  app.use(cors());

  app.use(express.json());

  // Swagger UI
  const swaggerUi = require("swagger-ui-express");
  const swaggerDocument = require("./swagger.json");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Mongoose model
  const materialSchema = new mongoose.Schema({
    humanId: { type: String, unique: true },
    type: { type: String, required: true },
    cod_unic_aviz: { type: String, maxlength: 40 },
    specie: { type: String, required: true },
    data: { type: String },
    apv: { type: String, maxlength: 40 },
    lat: { type: String },
    log: { type: String },
    nr_placuta_rosie: { type: String },
    lungime: { type: String },
    diametru: { type: String },
    volum_placuta_rosie: { type: String },
    volum_total: { type: String },
    volum_net_paletizat: { type: String },
    volum_brut_paletizat: { type: String },
    nr_bucati: { type: String },
    observatii: { type: String, maxlength: 1024 },
    componente: [{ type: String }],
  });
  const Material = mongoose.model("Material", materialSchema, "material");

  // GET /materials
  app.get("/materials", async (req, res) => {
    try {
      const materials = await Material.find();
      res.json(materials);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /materials
  app.post("/materials", async (req, res) => {
    try {
      // Find the highest current human-readable id
      const lastMaterial = await Material.findOne().sort({ humanId: -1 });
      let nextId = 1;
      if (lastMaterial && lastMaterial.humanId) {
        nextId = parseInt(lastMaterial.humanId.replace("MAT-", ""), 10) + 1;
      }
      const humanId = `MAT-${nextId.toString().padStart(4, "0")}`;
      // Remove _id if present in the request body
      const { _id, ...materialData } = req.body;
      const material = new Material({ ...materialData, humanId });
      await material.save();
      res.status(201).json(material);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // GET /materials/:id
  app.get("/materials/:id", async (req, res) => {
    try {
      const material = await Material.findById(req.params.id);
      if (!material)
        return res.status(404).json({ error: "Material not found" });
      res.json(material);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /materials/:id
  app.put("/materials/:id", async (req, res) => {
    try {
      const material = await Material.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!material)
        return res.status(404).json({ error: "Material not found" });
      res.json(material);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE /materials/:id
  app.delete("/materials/:id", async (req, res) => {
    try {
      const material = await Material.findByIdAndDelete(req.params.id);
      if (!material)
        return res.status(404).json({ error: "Material not found" });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/", (req, res) => {
    res.send("Material Manager API is running.");
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

function main() {
  connectToDatabase();
  startServer();
}

if (require.main === module) {
  main();
}
