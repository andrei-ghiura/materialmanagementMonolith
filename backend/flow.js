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

    // Recursive function to fetch all ancestors
    async function fetchAncestors(materialIds, collected = new Set()) {
      const newMaterialIds = materialIds.filter((id) => !collected.has(id));
      newMaterialIds.forEach((id) => collected.add(id));

      if (newMaterialIds.length === 0) return Array.from(collected);

      const processings = await Processing.find({
        outputIds: { $in: newMaterialIds },
      }).populate("sourceIds", "_id humanId type specie volum_total");

      const nextMaterialIds = [];
      processings.forEach((proc) =>
        proc.sourceIds.forEach((m) => {
          if (!collected.has(m._id.toString())) {
            nextMaterialIds.push(m._id.toString());
          }
        })
      );

      return fetchAncestors(nextMaterialIds, collected);
    }

    // Recursive function to fetch all descendants
    async function fetchDescendants(materialIds, collected = new Set()) {
      const processings = await Processing.find({
        sourceIds: { $in: materialIds },
      }).populate("outputIds", "humanId type specie volum_total");

      processings.forEach((proc) =>
        proc.outputIds.forEach((m) => collected.add(m._id.toString()))
      );

      const newDescendantIds = Array.from(collected).filter(
        (id) => !materialIds.includes(id)
      );

      if (newDescendantIds.length > 0) {
        await fetchDescendants(newDescendantIds, collected);
      }

      return Array.from(collected);
    }

    // Fetch the ancestry tree
    async function fetchAncestorsTree(materialId) {
      const material = await Material.findById(materialId).lean();
      if (!material) return null;

      const processings = await Processing.find({
        outputIds: materialId,
      }).populate("sourceIds", "_id humanId type specie volum_total");

      const ancestors = await Promise.all(
        processings.flatMap((proc) =>
          proc.sourceIds.map(async (source) => {
            const ancestorTree = await fetchAncestorsTree(
              source._id.toString()
            );
            return {
              processing: proc,
              material: ancestorTree,
            };
          })
        )
      );

      return {
        ...material,
        ancestors: ancestors.filter((ancestor) => ancestor !== null),
      };
    }

    const ancestryTree = await fetchAncestorsTree(materialId);

    // Fetch descendants (if needed, logic remains unchanged)
    const processingsAsSource = await Processing.find({
      sourceIds: material._id,
    }).populate("outputIds", "humanId type specie volum_total");

    const descendantIds = new Set();
    processingsAsSource.forEach((proc) =>
      proc.outputIds.forEach((m) => descendantIds.add(m._id.toString()))
    );

    const descendants = await Material.find({
      _id: { $in: Array.from(descendantIds) },
    });

    return {
      material,
      ancestors: ancestryTree, // Return the nested tree of ancestors
      descendants,
    };
  }

  return { getMaterialFlow };
};
