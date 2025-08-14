const Material = require("../models/Material");
const Processing = require("../models/Processing");
const {
  getProcessingType,
  applyProcessingRules,
} = require("../processingTypes");
const { getNextHumanId } = require("../helpers/humanId");

exports.processMaterials = async (req, res) => {
  try {
    const { sourceIds, outputConfig } = req.body;
    if (!sourceIds || !Array.isArray(sourceIds) || sourceIds.length === 0) {
      return res
        .status(400)
        .json({ error: "Source material IDs are required" });
    }
    const useProcessingTypes =
      outputConfig.processingTypeId &&
      outputConfig.processingTypeId.trim() !== "";
    if (!useProcessingTypes && (!outputConfig.type || !outputConfig.specie)) {
      return res
        .status(400)
        .json({ error: "Output configuration is incomplete" });
    }
    const sourceMaterials = await Material.find({ _id: { $in: sourceIds } });
    if (sourceMaterials.length !== sourceIds.length) {
      return res
        .status(400)
        .json({ error: "One or more source materials not found" });
    }
    let resultType = outputConfig.type;
    let resultSpecie = outputConfig.specie;
    let additionalFields = {};
    if (useProcessingTypes) {
      const processingType = getProcessingType(outputConfig.processingTypeId);
      if (!processingType) {
        return res.status(400).json({
          error: `Unknown processing type: ${outputConfig.processingTypeId}`,
        });
      }
      if (processingType.sourceTypes && processingType.sourceTypes.length > 0) {
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
      additionalFields = applyProcessingRules(
        outputConfig.processingTypeId,
        sourceMaterials
      );
      resultType =
        processingType.resultType === "same"
          ? sourceMaterials[0].type
          : processingType.resultType;
      resultSpecie = additionalFields.specie || sourceMaterials[0].specie;
    }
    const count = outputConfig.count || 1;
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
        const humanId = await getNextHumanId(Material);
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
        if (Object.keys(additionalFields).length > 0) {
          Object.keys(additionalFields).forEach((key) => {
            if (!materialData[key] && additionalFields[key] !== undefined) {
              materialData[key] = additionalFields[key];
            }
          });
        }
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
        throw saveError;
      }
    }
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
      }
    }
    processingRecord.outputIds = outputMaterials.map((m) => m._id);
    await processingRecord.save();
    res.status(200).json({
      message: `Successfully processed ${sourceMaterials.length} materials into ${outputMaterials.length} new materials`,
      outputMaterials,
      updatedSourceMaterials,
      processing: processingRecord,
    });
  } catch (err) {
    console.error("Processing error:", err);
    res.status(500).json({ error: err.message });
  }
};
