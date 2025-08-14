exports.getProcessingTypes = (req, res) => {
  try {
    const { processingTypes } = require("../processingTypes");
    res.json(processingTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProcessingTypesByMaterial = (req, res) => {
  try {
    const { materialType } = req.params;
    const { processingTypes } = require("../processingTypes");
    const validTypes = processingTypes.filter((type) =>
      type.sourceTypes.includes(materialType)
    );
    res.json(validTypes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
