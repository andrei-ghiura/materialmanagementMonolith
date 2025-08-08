const Material = require("../models/Material");
const { getNextHumanId } = require("../helpers/humanId");

exports.getAllMaterials = async (req, res) => {
  try {
    // Build filter from query params
    const filter = { deleted: false };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.specie) filter.specie = req.query.specie;
    if (req.query.state) filter.state = req.query.state;

    const materials = await Material.find(filter);
    // Ensure state is always present in response
    const materialsWithState = materials.map((mat) => ({
      ...mat.toObject(),
      state: mat.state || "received",
    }));
    res.json(materialsWithState);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMaterial = async (req, res) => {
  try {
    const humanId = await getNextHumanId(Material);
    const { _id, id, ...materialData } = req.body;
    const material = new Material({ ...materialData, humanId });
    await material.save();
    res.status(201).json(material);
  } catch (err) {
    console.error("Error creating material:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findOne({
      _id: req.params.id,
      deleted: false,
    }).populate("componente", "humanId type specie");
    if (!material) return res.status(404).json({ error: "Material not found" });
    res.json(material);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!material) return res.status(404).json({ error: "Material not found" });
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!material) return res.status(404).json({ error: "Material not found" });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
