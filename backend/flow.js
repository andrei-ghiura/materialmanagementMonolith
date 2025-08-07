// flow.js - Service for material flow (single material)
const mongoose = require("mongoose");

module.exports = function createFlowService(Material, Processing) {
  /**
   * Get the flow (ancestry and descendants) for a single material by ID.
   * Returns the material, its ancestors, descendants, and related processings.
   */
  async function getMaterialFlow(materialId) {
    // Find the material
    const material = await Material.findById(materialId);
    if (!material) throw new Error("Material not found");

    // Find all processings where this material is a source or output
    const processingsAsSource = await Processing.find({
      sourceIds: material._id,
    })
      .populate("sourceIds", "humanId type specie volum_total")
      .populate("outputIds", "humanId type specie volum_total");
    const processingsAsOutput = await Processing.find({
      outputIds: material._id,
    })
      .populate("sourceIds", "humanId type specie volum_total")
      .populate("outputIds", "humanId type specie volum_total");

    // Collect all related material IDs
    const ancestorIds = new Set();
    const descendantIds = new Set();
    processingsAsOutput.forEach((proc) =>
      proc.sourceIds.forEach((m) => ancestorIds.add(m._id.toString()))
    );
    processingsAsSource.forEach((proc) =>
      proc.outputIds.forEach((m) => descendantIds.add(m._id.toString()))
    );

    // Fetch ancestor and descendant materials
    const ancestors = await Material.find({
      _id: { $in: Array.from(ancestorIds) },
    });
    const descendants = await Material.find({
      _id: { $in: Array.from(descendantIds) },
    });

    return {
      material,
      ancestors,
      descendants,
      processingsAsSource,
      processingsAsOutput,
    };
  }

  return { getMaterialFlow };
};
