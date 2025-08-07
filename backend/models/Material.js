const mongoose = require("mongoose");

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
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    id: false,
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  }
);

module.exports = mongoose.model("Material", materialSchema, "material");
