const Processing = require("../models/Processing");

exports.getAllProcessings = async (req, res) => {
  try {
    const processings = await Processing.find()
      .populate("sourceIds", "humanId type specie volum_total")
      .populate("outputIds", "humanId type specie volum_total")
      .sort("-processingDate");
    res.json(processings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
