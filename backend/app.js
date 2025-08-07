const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const materialsRouter = require("./routes/materials");
const processingsRouter = require("./routes/processings");
const processingTypesRouter = require("./routes/processingTypes");
const healthRouter = require("./routes/health");
const materialProcessRouter = require("./routes/materialProcess");

const app = express();
app.use(cors());
app.use(express.json());

// Swagger UI
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerDocument);
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/materials", materialsRouter);
app.use("/api/processings", processingsRouter);
app.use("/processings", processingsRouter); // legacy
app.use("/processing-types", processingTypesRouter);
app.use("/materials/process", materialProcessRouter);
app.use("/health", healthRouter);

app.get("/", (req, res) => {
  res.send("Material Manager API is running.");
});

module.exports = app;
