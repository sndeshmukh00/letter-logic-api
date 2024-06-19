const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  meaning: { type: String, required: true },
  level: { type: Number, required: true, unique: true },
});

module.exports = mongoose.model("Word", WordSchema);
