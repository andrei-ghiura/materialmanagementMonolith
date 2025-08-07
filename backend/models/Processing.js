const mongoose = require("mongoose");

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

module.exports = mongoose.model("Processing", processingSchema);
