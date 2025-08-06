const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
var cors = require("cors");
const {
  getProcessingType,
  applyProcessingRules,
} = require("./processingTypes");

async function connectToDatabase() {
  console.log("Connecting to MongoDB:" + process.env.MONGODB_URL);
  const dbUrl =
    process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/materialmanager";
  try {
    await mongoose.connect(dbUrl, {
      user: process.env.MONGODB_USER || "root",
      pass: process.env.MONGODB_PASSWORD || "root",
    });

    console.log("Connected to MongoDB");

    // Try to drop the problematic id_1 index that's causing duplicate key errors
    try {
      await mongoose.connection.db.collection("material").dropIndex("id_1");
      console.log("Successfully dropped the id_1 index");
    } catch (indexError) {
      // If the index doesn't exist, that's fine
      console.log("Note: id_1 index not found or already dropped");
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
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

  // Mongoose models
  const materialSchema = new mongoose.Schema(
    {
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
      componente: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
    },
    {
      timestamps: true,
      // Explicitly disable the virtual id getter
      id: false,
      // Disable toJSON and toObject transforms that would add the virtual id
      toJSON: {
        virtuals: false,
      },
      toObject: {
        virtuals: false,
      },
    }
  );
  const Material = mongoose.model("Material", materialSchema, "material");

  const processingSchema = new mongoose.Schema(
    {
      sourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
      outputIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Material" }],
      outputType: { type: String, required: true },
      outputSpecie: { type: String, required: true },
      processingTypeId: { type: String, required: true },
      processingDate: { type: Date, default: Date.now },
      note: { type: String },
    },
    {
      timestamps: true,
      id: false,
      toJSON: { virtuals: false },
      toObject: { virtuals: false },
    }
  );
  const Processing = mongoose.model("Processing", processingSchema);

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

      // Remove _id and id if present in the request body to avoid duplicate key errors
      const { _id, id, ...materialData } = req.body;

      const material = new Material({ ...materialData, humanId });
      await material.save();
      res.status(201).json(material);
    } catch (err) {
      console.error("Error creating material:", err);
      res.status(400).json({ error: err.message });
    }
  });

  // GET /api/processings - Get all processing history
  app.get("/api/processings", async (req, res) => {
    try {
      const processings = await Processing.find()
        .populate("sourceIds", "humanId type specie volum_total")
        .populate("outputIds", "humanId type specie volum_total")
        .sort("-processingDate");
      res.json(processings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /materials/:id
  app.get("/materials/:id", async (req, res) => {
    try {
      const material = await Material.findById(req.params.id).populate(
        "componente",
        "humanId type specie"
      );
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

  // POST /materials/process
  app.post("/materials/process", async (req, res) => {
    try {
      const { sourceIds, outputConfig } = req.body;

      // Validate request
      if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
        return res
          .status(400)
          .json({ error: "Source material IDs are required" });
      }

      // Check for processing type or fallback to traditional configuration
      const useProcessingTypes =
        outputConfig.processingTypeId &&
        outputConfig.processingTypeId.trim() !== "";

      if (!useProcessingTypes && (!outputConfig.type || !outputConfig.specie)) {
        return res
          .status(400)
          .json({ error: "Output configuration is incomplete" });
      }

      // Retrieve all source materials
      const sourceMaterials = await Material.find({
        _id: { $in: sourceIds },
      });

      // Validate all materials exist
      if (sourceMaterials.length !== sourceIds.length) {
        return res
          .status(404)
          .json({ error: "One or more source materials not found" });
      }

      // Apply processing type rules if a processing type is specified
      let resultType = outputConfig.type;
      let resultSpecie = outputConfig.specie;
      let additionalFields = {};

      if (useProcessingTypes) {
        // Get the processing type configuration
        const processingType = getProcessingType(outputConfig.processingTypeId);
        if (!processingType) {
          return res.status(400).json({
            error: `Unknown processing type: ${outputConfig.processingTypeId}`,
          });
        }

        // Validate source material types against processing type
        if (
          processingType.sourceTypes &&
          processingType.sourceTypes.length > 0
        ) {
          const invalidMaterials = sourceMaterials.filter(
            (m) => !processingType.sourceTypes.includes(m.type)
          );

          if (invalidMaterials.length > 0) {
            return res.status(400).json({
              error: `Invalid source material types for ${
                processingType.label
              } processing. Expected: ${processingType.sourceTypes.join(", ")}`,
            });
          }
        }

        // Apply processing rules to determine output fields
        additionalFields = applyProcessingRules(
          outputConfig.processingTypeId,
          sourceMaterials
        );

        // Get result type from processing rules or from config
        resultType =
          processingType.resultType === "same"
            ? sourceMaterials[0].type
            : processingType.resultType;

        // Get species from processing rules or from source
        resultSpecie = additionalFields.specie || sourceMaterials[0].specie;
      }

      // Determine how many output materials to create
      const count = outputConfig.count || 1;

      // Create output materials and prepare processing record
      const outputMaterials = [];
      const processingRecord = new Processing({
        sourceIds: sourceIds,
        outputType: resultType,
        outputSpecie: resultSpecie,
        processingTypeId: outputConfig.processingTypeId || null,
        note: `Processing of ${sourceMaterials.length} materials into ${count} new materials`,
      });

      for (let i = 0; i < count; i++) {
        try {
          // Find the highest current human-readable id
          const lastMaterial = await Material.findOne().sort({ humanId: -1 });
          let nextId = 1;
          if (lastMaterial && lastMaterial.humanId) {
            nextId = parseInt(lastMaterial.humanId.replace("MAT-", ""), 10) + 1;
          }
          const humanId = `MAT-${nextId.toString().padStart(4, "0")}`;

          // Start with basic properties
          const materialData = {
            type: resultType,
            specie: resultSpecie,
            humanId,
            data: new Date().toISOString().split("T")[0],
            componente: sourceMaterials.map((m) => m._id),
            observatii: `Procesat din ${
              sourceMaterials.length
            } materiale la ${new Date().toLocaleString()}`,
          };

          // Merge with any additional fields from processing rules
          if (Object.keys(additionalFields).length > 0) {
            // Copy any additional fields, but don't overwrite existing ones
            Object.keys(additionalFields).forEach((key) => {
              if (!materialData[key] && additionalFields[key] !== undefined) {
                materialData[key] = additionalFields[key];
              }
            });
          }

          // Merge with any manual fields provided in the request
          if (outputConfig.additionalFields) {
            Object.keys(outputConfig.additionalFields).forEach((key) => {
              if (outputConfig.additionalFields[key] !== undefined) {
                materialData[key] = outputConfig.additionalFields[key];
              }
            });
          }

          const newMaterial = new Material(materialData);
          await newMaterial.save();
          outputMaterials.push(newMaterial);
        } catch (saveError) {
          console.error(`Error creating output material ${i + 1}:`, saveError);
          throw saveError; // Re-throw to be caught by the main try-catch
        }
      }

      // Update source materials to mark them as processed
      const updatedSourceMaterials = [];
      for (const material of sourceMaterials) {
        try {
          material.observatii =
            (material.observatii || "") +
            `\nProcesat în ${outputMaterials
              .map((m) => m.humanId)
              .join(", ")} la ${new Date().toLocaleString()}`;
          await material.save();
          updatedSourceMaterials.push(material);
        } catch (updateError) {
          console.error(
            `Error updating source material ${material._id}:`,
            updateError
          );
          // Continue with other updates even if one fails
        }
      }

      // Save the processing record with the output material IDs
      processingRecord.outputIds = outputMaterials.map((m) => m._id);
      await processingRecord.save();

      res.status(201).json({
        message: `Successfully processed ${sourceMaterials.length} materials into ${outputMaterials.length} new materials`,
        outputMaterials,
        updatedSourceMaterials,
        processing: processingRecord,
      });
    } catch (err) {
      console.error("Processing error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /processings
  app.get("/processings", async (req, res) => {
    try {
      const processings = await Processing.find()
        .populate("sourceIds", "humanId type specie volum_total")
        .populate("outputIds", "humanId type specie volum_total");
      res.json(processings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /processing-types
  app.get("/processing-types", (req, res) => {
    try {
      const { require } = module;
      const { processingTypes } = require("./processingTypes");
      res.json(processingTypes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET /processing-types/:materialType
  app.get("/processing-types/:materialType", (req, res) => {
    try {
      const { materialType } = req.params;
      const { require } = module;
      const { processingTypes } = require("./processingTypes");

      const validTypes = processingTypes.filter((type) =>
        type.sourceTypes.includes(materialType)
      );

      res.json(validTypes);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });

  app.get("/", (req, res) => {
    res.send("Material Manager API is running.");
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

async function main() {
  await connectToDatabase();
  startServer();
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Main function error:", err);
    process.exit(1);
  });
}
